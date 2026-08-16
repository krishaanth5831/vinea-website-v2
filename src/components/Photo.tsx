import Image from "next/image";

import { IMAGES, type ImageKey } from "@/lib/images";

/**
 * A photograph from the manifest, with its alt text and dimensions attached.
 *
 * Alt text lives with the image rather than at the call site, because the same
 * photograph appearing twice should describe itself the same way both times,
 * and because a description written next to the file is far more likely to be
 * about the photograph than about the layout it happens to be in.
 */
export default function Photo({
  name,
  className = "",
  sizes = "100vw",
  priority = false,
  altOverride,
}: {
  name: ImageKey;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Only when the same photograph is genuinely doing a different job. */
  altOverride?: string;
}) {
  const image = IMAGES[name];
  return (
    <Image
      src={image.src}
      alt={altOverride ?? image.alt}
      width={image.width}
      height={image.height}
      sizes={sizes}
      priority={priority}
      placeholder="blur"
      blurDataURL={image.blurDataURL}
      className={className}
    />
  );
}
