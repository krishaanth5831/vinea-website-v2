"use client";

import { useEffect, useRef } from "react";

/**
 * A muted, looping product clip that only costs bandwidth once it is worth
 * watching.
 *
 * `preload="metadata"` plus a poster means the initial page load fetches one
 * JPEG per clip and no video at all. An observer starts playback when the clip
 * is on screen and pauses it when it is not, so a visitor who reads the top of
 * the page and leaves has downloaded the hero and nothing else.
 *
 * Under `prefers-reduced-motion` the video never plays and the poster stands in
 * its place — which is why every poster is chosen on a frame where the robot is
 * mid-pick rather than parked.
 */
export default function Clip({
  name,
  poster,
  label,
  className = "",
  autoPlay = false,
  fit = "cover",
}: {
  /** Basename in /public/video — .mp4, .webm and .jpg share it. */
  name: string;
  poster?: string;
  /** Read out in place of watching. Required: these carry real information. */
  label: string;
  className?: string;
  /** Hero only. Everything else starts when it enters the viewport. */
  autoPlay?: boolean;
  fit?: "cover" | "contain";
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.removeAttribute("autoplay");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            // A rejected play() is normal — a background tab, or a browser that
            // wants a gesture. The poster stays up and nothing breaks.
            void video.play().catch(() => {});
          } else {
            video.pause();
          }
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      className={`h-full w-full ${fit === "cover" ? "object-cover" : "object-contain"} ${className}`}
      poster={poster ?? `/video/${name}.jpg`}
      preload="metadata"
      muted
      loop
      playsInline
      autoPlay={autoPlay}
      aria-label={label}
    >
      {/* ⚠️ mp4 first, which is the opposite of the usual advice. Measured on
          this footage — a four-row glasshouse at true plant density, close to a
          worst case for any codec — VP9 came out larger than x264 at matching
          quality on four of the seven clips and within a few percent on two
          more. Listing webm first made Chrome start the bigger file and abort
          it. It stays as a fallback for anything that cannot play H.264. */}
      <source src={`/video/${name}.mp4`} type="video/mp4" />
      <source src={`/video/${name}.webm`} type="video/webm" />
    </video>
  );
}
