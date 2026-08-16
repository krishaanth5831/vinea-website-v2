/**
 * Every number on this site, with its provenance attached.
 *
 * The rule the whole page is built on is that a target is never presented as a
 * measurement and a measurement is never presented as a target. Enforcing that
 * in prose alone means trusting seven components to remember it, so provenance
 * is a required field here instead: a figure cannot be rendered without one,
 * and the components key their colour, their mono tag and whether they animate
 * off it.
 *
 *   measured — observed in the MuJoCo simulation, August 2026. Signal colour,
 *              counts up on enter.
 *   target   — what the machine has to reach to be worth deploying. Plain ink,
 *              never animated, always tagged.
 *   grower   — heard in grower interviews. Attributed wherever it appears.
 */

export type Provenance = "measured" | "target" | "grower";

export type Figure = {
  id: string;
  provenance: Provenance;
  /** The numeric part, for the count-up. Omit when the value is not a number. */
  value?: number;
  /** Decimal places to hold while counting. */
  decimals?: number;
  prefix?: string;
  suffix?: string;
  /** Rendered instead of prefix/value/suffix when the figure is not numeric. */
  literal?: string;
  label: string;
  /** How it was arrived at. Printed under the figure, always. */
  method: string;
};

export const MEASURED: Figure[] = [
  {
    id: "throughput",
    provenance: "measured",
    value: 12,
    prefix: "~",
    suffix: " kg/hr",
    label: "Throughput, one arm",
    method:
      "End-to-end in simulation: survey, plan, pick, carry, crate. One arm, full pipeline, nothing stubbed.",
  },
  {
    id: "reach",
    provenance: "measured",
    value: 1.1,
    decimals: 3,
    suffix: " m",
    label: "Reach to the fingertips",
    method:
      "Measured across 20,000 configurations in simulation, to the fingertips rather than the flange.",
  },
  {
    id: "repeatability",
    provenance: "measured",
    literal: "10/10",
    label: "Pick repeatability at ±20 mm",
    method:
      "Ten of ten, across three random scene seeds in simulation. A new arrangement each seed.",
  },
  {
    id: "deprojection",
    provenance: "measured",
    value: 0.39,
    decimals: 2,
    suffix: " mm",
    label: "Camera-to-world accuracy",
    method:
      "Worst deprojection error in simulation: a known fruit projected into the image and read back out.",
  },
  {
    id: "recall",
    provenance: "measured",
    value: 100,
    suffix: "%",
    label: "Ripe-fruit detection recall",
    method:
      "Colour baseline in simulation, with zero phantom false positives. No learned detector involved.",
  },
  {
    id: "cycle",
    provenance: "measured",
    value: 28.7,
    decimals: 1,
    suffix: " s",
    label: "Mean cycle time per pick",
    method:
      "Mean over a full pick campaign in simulation, measured wall-to-wall rather than per leg.",
  },
];

export const TARGET: Figure[] = [
  {
    id: "weekly",
    provenance: "target",
    literal: "8,000 kg",
    label: "Per robot, per week",
    method:
      "About 80 kg/hr over a 100-hour week. This is what the machine has to reach to be worth a grower's aisle — not something it has done.",
  },
  {
    id: "hourly",
    provenance: "target",
    literal: "~80 kg/hr",
    label: "Sustained rate, both arms",
    method:
      "The rate implied by the weekly target. Measured throughput today is one arm at ~12 kg/hr.",
  },
];

export const GROWER: Figure[] = [
  {
    id: "labour-cost",
    provenance: "grower",
    literal: "€250,000",
    label: "A year, picking labour, 5 ha",
    method:
      "About €5 per m² per year, from grower interviews. At five hectares that is a quarter of a million euros of picking.",
  },
  {
    id: "crew",
    provenance: "grower",
    literal: "1.5–2.2",
    label: "Harvest workers per hectare",
    method: "From grower interviews across Westland and Lansingerland.",
  },
  {
    id: "tonnes",
    provenance: "grower",
    literal: "12–24 t",
    label: "Picked per week by two full-timers",
    method:
      "From grower interviews. It is the number the 8,000 kg target is set against.",
  },
];

/** The gap between what is measured and what is targeted, stated plainly. */
export const GAP = {
  measuredWeekly: "~1,200 kg",
  targetWeekly: "8,000 kg",
  factor: 6.5,
  bottleneckSeconds: 12,
} as const;

export const CONTACT = {
  email: "krishaanth@getvinea.nl",
  calendly: "https://calendly.com/vinea5831/new-meeting",
  location: "Westland, Netherlands",
  founder: "Krishaanth Ramaraj",
} as const;

/** The five stages of the build reel, in the order they are scrolled through. */
export type ReelStage = {
  id: string;
  /** Basename in /public/video — .mp4, .webm and .jpg all share it. */
  clip: string;
  index: string;
  heading: string;
  line: string;
  /** Spoken by a screen reader in place of watching the clip. */
  alt: string;
};

export const REEL: ReelStage[] = [
  {
    id: "pick",
    clip: "single-pick",
    index: "One",
    heading: "It takes the truss, not the tomato",
    line:
      "The gripper cradles the cluster from below and a blade cuts the stem. One moving joint, and the fruit is never squeezed.",
    alt:
      "Simulation: a robot arm reaches into a tomato row, cradles a truss of ripe tomatoes from below and cuts the stem, then carries the cluster away.",
  },
  {
    id: "row",
    clip: "row-load",
    index: "Two",
    heading: "A whole row, stem by stem",
    line:
      "Each stem detaches under measured load rather than a scripted event. The row empties one pick at a time.",
    alt:
      "Simulation: the arm works down a full row of tomato plants, picking fruit one after another as each stem detaches under load.",
  },
  {
    id: "eye",
    clip: "wrist-eye",
    index: "Three",
    heading: "It decides which ones are ready",
    line:
      "The robot's own wrist camera, with the colour classifier drawn on it. Nothing in this run was told where a tomato is — it finds each one, calls it ripe or unripe, and goes after the ripe ones.",
    alt:
      "Simulation, seen through the robot's wrist-mounted camera: tomatoes are outlined as the camera passes them and labelled ripe or unripe by colour, and the arm closes on one marked ripe.",
  },
  {
    id: "replan",
    clip: "replan",
    index: "Four",
    heading: "Move the fruit. It re-plans",
    line:
      "There are no hardcoded fruit positions anywhere. Hang tomatoes wherever you like, add more mid-run, and the route is thrown away and rebuilt.",
    alt:
      "Simulation: tomatoes are placed at arbitrary positions, the arm picks two, three more fruit appear, and the arm re-plans its route around them.",
  },
  {
    id: "house",
    clip: "whole-house",
    index: "Five",
    heading: "The house, on the rail it already has",
    line:
      "A trolley on the heating pipes, two arms working both sides of the aisle at once. Four rows, no rebuild.",
    alt:
      "Simulation: a trolley drives along the pipe rail down a greenhouse aisle while two robot arms harvest tomatoes from the rows on either side.",
  },
];
