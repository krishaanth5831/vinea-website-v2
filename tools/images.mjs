/**
 * Grade and optimise the stock photography, and emit the manifest the site
 * imports.
 *
 *   node tools/images.mjs <source-dir>
 *
 * Every photograph on this site was shot by someone else in someone else's
 * light, so straight out of Pexels they do not sit together: one is a cold
 * overcast glasshouse, the next is warm afternoon sun, a third is a saturated
 * product shot. Grading them toward one palette is what makes the page read as
 * a single system rather than a mood board.
 *
 * The grade is deliberately gentle. These are photographs of a real industry
 * and the site's whole argument is about not overstating things, so the pass
 * below pulls saturation back, warms the highlights toward the bone ground and
 * cools the shadows toward the green-black — and stops there. Nothing is
 * posterised, nothing is duotoned.
 *
 * Output per image: a graded JPEG master (what `<Image>` points at, and what
 * Next re-encodes to AVIF/WebP per request) plus a 20px blur placeholder inlined
 * into the manifest so no layout moves while a photograph loads.
 */

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "public", "images");
const MANIFEST = path.join(ROOT, "src", "lib", "images.ts");

/** Longest edge of the shipped master. Above this the extra pixels are only
 *  visible on a 5K display showing one photograph full-bleed. */
const MAX_EDGE = 2800;

const SOURCES = [
  {
    key: "hero",
    file: "hero_full.jpg",
    out: "glasshouse-corridor.jpg",
    alt:
      "The central corridor of a commercial tomato glasshouse, rows of plants running away on both sides under a diffusing screen, the far door small in the distance.",
    credit: { author: "Rajeeb roy", url: "https://www.pexels.com/photo/modern-greenhouse-with-rows-of-growing-tomatoes-38551884/" },
    grade: "hero",
  },
  {
    key: "pipeRail",
    file: "rail.jpg",
    out: "pipe-rail-aisle.jpg",
    alt:
      "Looking down the aisle of a high-wire tomato glasshouse: two rows of plants heavy with ripening fruit on either side, and the pair of steel heating pipes that serve as the trolley rail running away to the vanishing point.",
    credit: { author: "Lyn Ong", url: "https://www.pexels.com/photo/fresh-cherry-tomatoes-growing-on-a-greenhouse-5005518/" },
    grade: "aisle",
  },
  {
    key: "diffuseRow",
    file: "hero.jpg",
    out: "diffuse-row.jpg",
    alt:
      "Tomato plants under flat, diffuse glasshouse light, green trusses still setting, the aisle falling out of focus behind them.",
    credit: { author: "Anna Tarazevich", url: "https://www.pexels.com/photo/flower-buds-on-branches-7299952/" },
    grade: "soft",
  },
  {
    key: "glasshouse",
    file: "house.jpg",
    out: "dutch-glasshouse.jpg",
    alt:
      "A modern Venlo glasshouse in South Holland seen from outside, its glazing bars running the length of the bay with the crop visible inside.",
    credit: { author: "Igor Passchier", url: "https://www.pexels.com/photo/modern-greenhouse-with-tomato-plants-in-south-holland-36917505/" },
    grade: "cool",
  },
  {
    key: "truss",
    file: "truss.jpg",
    out: "truss-on-the-vine.jpg",
    alt:
      "Trusses of tomatoes on the vine at every stage at once — green, breaker, turning and fully red fruit hanging on the same plants.",
    credit: { author: "Cá Bảo", url: "https://www.pexels.com/photo/ripe-and-unripe-cherry-tomatoes-on-the-vine-37443334/" },
    grade: "warm",
  },
  {
    key: "row",
    file: "rows.jpg",
    out: "high-wire-row.jpg",
    alt:
      "A high-wire tomato row from close up, fruit set along the stems at picking height, the aisle running away behind it.",
    credit: { author: "Fer Martinez Gonzalez", url: "https://www.pexels.com/photo/plantation-of-tomatoes-8180574/" },
    grade: "warm",
  },
  {
    key: "crates",
    file: "crates.jpg",
    out: "stacked-crates.jpg",
    alt:
      "Hundreds of stacked harvest crates seen from above, filling the frame, with a single worker moving between them for scale.",
    credit: { author: "Fatih Kopcal", url: "https://www.pexels.com/photo/worker-in-large-greenhouse-farm-setting-32738498/" },
    grade: "cool",
  },
  {
    key: "hand",
    file: "hands.jpg",
    out: "hand-at-the-vine.jpg",
    alt:
      "A picker's hand under a truss of green tomatoes, taking the weight of the cluster without pulling on it.",
    credit: { author: "Anna Tarazevich", url: "https://www.pexels.com/photo/a-hand-touching-the-fruits-on-a-plant-7299950/" },
    grade: "soft",
  },
];

/**
 * Per-image grades, because one curve does not fit an overcast exterior and a
 * backlit close-up. Each is (saturation, brightness, contrast slope, offset,
 * warm recombination weight).
 */
const GRADES = {
  // Interiors shot under bright glass: pull the greens back hard, lift the
  // shadows so the aisle does not block up under a caption.
  aisle: { sat: 0.62, bright: 1.03, slope: 0.9, offset: 12, warm: 0.05 },
  // Already soft and low contrast; barely touched.
  soft: { sat: 0.72, bright: 1.02, slope: 0.95, offset: 6, warm: 0.045 },
  // Overcast exteriors read blue; warmed further than anything else here.
  cool: { sat: 0.6, bright: 1.04, slope: 0.92, offset: 8, warm: 0.075 },
  // Ripe fruit is the one place saturation is allowed to survive, because the
  // red in these frames is doing the same job as the signal colour.
  warm: { sat: 0.78, bright: 1.0, slope: 0.94, offset: 8, warm: 0.04 },
  // The hero carries the headline at display size across most of its area, so
  // it is graded further than anything else: saturation well down, contrast
  // flattened hard, and the whole frame pulled toward the dark green-black the
  // section sits on. The photograph is the ground the type stands on, not the
  // subject.
  hero: { sat: 0.34, bright: 0.86, slope: 0.72, offset: 4, warm: 0.05 },
};

/**
 * A warm-highlight / cool-shadow recombination.
 *
 * `recomb` is a straight 3x3 on linear RGB, so a warm cast is a matrix that
 * leaks a little red into itself and out of blue. Written as identity plus a
 * weighted correction, so `w` reads as strength and `w = 0` is a no-op.
 */
function warmMatrix(w) {
  return [
    [1 + 0.9 * w, 0.06 * w, -0.02 * w],
    [0.03 * w, 1 + 0.2 * w, -0.02 * w],
    [-0.04 * w, 0.02 * w, 1 - 1.3 * w],
  ];
}

async function grade(srcPath, spec) {
  const g = GRADES[spec.grade];
  const pipeline = sharp(srcPath)
    .rotate()
    .resize({
      width: MAX_EDGE,
      height: MAX_EDGE,
      fit: "inside",
      withoutEnlargement: true,
    })
    .modulate({ saturation: g.sat, brightness: g.bright })
    .recomb(warmMatrix(g.warm))
    // Slope below 1 with a positive offset is a lifted, flattened curve: it
    // stops a photograph fighting text laid over it, which every one of these
    // has to survive.
    .linear(g.slope, g.offset);

  const buffer = await pipeline
    .jpeg({ quality: 78, mozjpeg: true, chromaSubsampling: "4:2:0" })
    .toBuffer();

  const meta = await sharp(buffer).metadata();

  // 20 px wide, blurred, base64. Big enough to carry the composition, small
  // enough that inlining seven of them costs less than one HTTP request.
  const placeholder = await sharp(buffer)
    .resize(20, null, { fit: "inside" })
    .blur(1.4)
    .jpeg({ quality: 45 })
    .toBuffer();

  return { buffer, meta, placeholder };
}

async function main() {
  const src = process.argv[2];
  if (!src) {
    console.error("usage: node tools/images.mjs <source-dir>");
    process.exit(1);
  }

  await fs.mkdir(OUT, { recursive: true });
  const entries = [];

  for (const spec of SOURCES) {
    const from = path.join(src, spec.file);
    const { buffer, meta, placeholder } = await grade(from, spec);
    await fs.writeFile(path.join(OUT, spec.out), buffer);
    entries.push({
      key: spec.key,
      src: `/images/${spec.out}`,
      width: meta.width,
      height: meta.height,
      alt: spec.alt,
      credit: spec.credit,
      blurDataURL: `data:image/jpeg;base64,${placeholder.toString("base64")}`,
    });
    console.log(
      `  ${spec.out.padEnd(26)} ${meta.width}x${meta.height}  ` +
        `${(buffer.length / 1024).toFixed(0)} KB`,
    );
  }

  const body = `/**
 * Generated by tools/images.mjs — do not edit by hand.
 *
 * Dimensions travel with each entry so every <Image> reserves its box before
 * the file arrives, and the blur placeholder is inlined so nothing pops.
 */

export type SiteImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
  blurDataURL: string;
  credit: { author: string; url: string };
};

export const IMAGES = {
${entries
  .map(
    (e) => `  ${e.key}: {
    src: "${e.src}",
    width: ${e.width},
    height: ${e.height},
    alt: ${JSON.stringify(e.alt)},
    credit: { author: ${JSON.stringify(e.credit.author)}, url: "${e.credit.url}" },
    blurDataURL:
      "${e.blurDataURL}",
  },`,
  )
  .join("\n")}
} as const satisfies Record<string, SiteImage>;

export type ImageKey = keyof typeof IMAGES;
`;

  await fs.writeFile(MANIFEST, body);
  console.log(`\n  manifest -> ${path.relative(ROOT, MANIFEST)}`);
}

main();
