"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/**
 * A muted, looping product clip that costs almost nothing until it is worth
 * watching.
 *
 * ⚠️ The poster is a `next/image`, not the `<video poster>` attribute. A
 * `poster` is fetched the moment the element exists, wherever it sits on the
 * page and whatever `preload` says — seven of them cost 1.4 MB of full-size
 * JPEG before a visitor had scrolled past the hero. As an `<Image>` it is
 * served as AVIF at the size it is actually displayed, lazily, and it fades out
 * when the video has frames to show.
 *
 * The video element itself is only mounted once the clip is near the viewport,
 * so a visitor who reads the top of the page and leaves has downloaded one
 * small image per section and no video at all.
 *
 * Under `prefers-reduced-motion` the video is never mounted and the poster
 * stands in for it — which is why every poster is chosen on a frame where the
 * robot is mid-pick rather than parked.
 */
export default function Clip({
  name,
  label,
  className = "",
  eager = false,
  priority = false,
  fit = "cover",
  sizes = "100vw",
}: {
  /** Basename in /public/video — .mp4, .webm and .jpg share it. */
  name: string;
  /** Read out in place of watching. Required: these carry real information. */
  label: string;
  className?: string;
  /** Hero only: mount the video as soon as the page is idle rather than on scroll. */
  eager?: boolean;
  /** Hero only: the poster is the LCP element, so it must not be lazy. */
  priority?: boolean;
  fit?: "cover" | "contain";
  sizes?: string;
}) {
  const holder = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [mounted, setMounted] = useState(false);
  const [playing, setPlaying] = useState(false);

  // Decide whether to bring the video in at all, and when.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    if (eager) {
      // On a metered or slow connection the hero clip is not worth a megabyte
      // of someone's data plan. The poster is the same frame and it is already
      // on screen.
      const link = (
        navigator as Navigator & {
          connection?: { saveData?: boolean; effectiveType?: string };
        }
      ).connection;
      if (link?.saveData) return;
      if (link?.effectiveType && /^(slow-2g|2g|3g)$/.test(link.effectiveType)) {
        return;
      }

      // ⚠️ After `load`, then a beat, then idle — not on mount. This is the one
      // video a visitor fetches without asking for it, and it is mood behind a
      // headline: the poster carries the meaning and it is already there.
      // Requesting it while the fonts, the CSS and the first paint are still
      // competing for the connection pushed largest-contentful-paint out by
      // most of a second and bought nothing, because nobody is looking at
      // frame one. On a fast connection `load` fires in a couple of hundred
      // milliseconds, which is still inside that window — hence the beat.
      let idleHandle = 0;
      let timer = 0;
      const start = () => {
        timer = window.setTimeout(() => {
          const idle =
            window.requestIdleCallback ??
            ((cb: IdleRequestCallback) =>
              window.setTimeout(() => cb({} as never), 0));
          idleHandle = idle(() => setMounted(true), { timeout: 2000 }) as number;
        }, 1500);
      };
      if (document.readyState === "complete") start();
      else window.addEventListener("load", start, { once: true });
      return () => {
        window.removeEventListener("load", start);
        window.clearTimeout(timer);
        window.clearTimeout(idleHandle);
      };
    }

    const node = holder.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        setMounted(true);
        observer.disconnect();
      },
      // A viewport of lead time, so the clip is decoded by the time it arrives.
      { rootMargin: "100% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [eager]);

  // Play only while on screen.
  useEffect(() => {
    const el = video.current;
    if (!el || !mounted) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            // A rejected play() is normal — a background tab, or a browser that
            // wants a gesture. The poster stays up and nothing breaks.
            void el.play().catch(() => {});
          } else {
            el.pause();
          }
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [mounted]);

  const object = fit === "cover" ? "object-cover" : "object-contain";

  return (
    <div ref={holder} className={`relative h-full w-full overflow-hidden ${className}`}>
      <Image
        src={`/video/${name}.jpg`}
        alt={label}
        width={1920}
        height={1080}
        sizes={sizes}
        priority={priority}
        className={`absolute inset-0 h-full w-full ${object} transition-opacity duration-700 ${
          playing ? "opacity-0" : "opacity-100"
        }`}
      />

      {mounted && (
        <video
          ref={video}
          className={`absolute inset-0 h-full w-full ${object}`}
          preload="metadata"
          muted
          loop
          playsInline
          // The poster is the <Image> above; giving the element one too would
          // fetch the same frame a second time at full size.
          onPlaying={() => setPlaying(true)}
          aria-hidden="true"
        >
          {/* ⚠️ mp4 first, which is the opposite of the usual advice. Measured
              on this footage — a four-row glasshouse at true plant density,
              close to a worst case for any codec — VP9 came out larger than
              x264 at matching quality on four of the seven clips. Listing webm
              first made Chrome start the bigger file and abort it. It stays as
              a fallback for anything that cannot play H.264. */}
          <source src={`/video/${name}.mp4`} type="video/mp4" />
          <source src={`/video/${name}.webm`} type="video/webm" />
        </video>
      )}
    </div>
  );
}
