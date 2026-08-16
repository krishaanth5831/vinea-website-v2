import { ImageResponse } from "next/og";

import { GAP } from "@/lib/data";

export const alt =
  "Vinea — a harvesting robot for the glasshouse you already have. Pre-prototype, simulation only.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The share card, drawn rather than screenshotted.
 *
 * It carries the same rule the page does: the measured number in the signal
 * colour with its tag, the target beside it in plain ink with its own. A share
 * card is usually where a company quietly drops its caveats — this one keeps
 * them, because the caveat is the interesting part.
 *
 * Satori (which renders this) supports a subset of CSS: flex only, no grid, no
 * external assets. Everything below is inline and self-contained.
 */
export default async function OpengraphImage() {
  const BONE = "#f7f4ef";
  const FOREST = "#0f1512";
  const SIGNAL = "#e2724f";
  const CHALK = "#ede8dd";
  const MUTE = "#837c70";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: FOREST,
          padding: "68px 72px",
          color: CHALK,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: 34, letterSpacing: "-0.02em" }}>
            Vinea
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 19,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: MUTE,
            }}
          >
            Westland, NL
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 78,
              lineHeight: 1.02,
              letterSpacing: "-0.035em",
            }}
          >
            <span>It picks the truss, in the</span>
            <span>glasshouse you already have.</span>
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 26,
              fontSize: 25,
              color: MUTE,
              maxWidth: 880,
              lineHeight: 1.4,
            }}
          >
            Pre-prototype. Simulation only. No robot has run in a greenhouse.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 64,
            borderTop: `1px solid #26312a`,
            paddingTop: 30,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: 17,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: MUTE,
              }}
            >
              Measured in simulation
            </span>
            <span
              style={{
                fontSize: 52,
                marginTop: 10,
                color: SIGNAL,
                letterSpacing: "-0.03em",
              }}
            >
              ~12 kg/hr, one arm
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: 17,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: MUTE,
              }}
            >
              Target — not achieved
            </span>
            <span
              style={{
                fontSize: 52,
                marginTop: 10,
                color: BONE,
                letterSpacing: "-0.03em",
              }}
            >
              {GAP.targetWeekly} a week
            </span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
