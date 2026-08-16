/**
 * The call-to-action arrows, drawn rather than typed.
 *
 * ⚠️ General Sans has no arrow glyphs — `→` and `↗` were silently falling back
 * to whatever sans the OS offered, so the one mark next to the site's most
 * important button was the only thing on the page not set in the site's
 * typeface, and it looked different on every platform. Two paths cost less than
 * the fallback lookup did.
 */
export default function Arrow({
  direction = "right",
  className = "",
}: {
  direction?: "right" | "up-right";
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="square"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {direction === "right" ? (
        <>
          <path d="M2 8h11" />
          <path d="M9 4l4 4-4 4" />
        </>
      ) : (
        <>
          <path d="M4 12L12 4" />
          <path d="M6 4h6v6" />
        </>
      )}
    </svg>
  );
}
