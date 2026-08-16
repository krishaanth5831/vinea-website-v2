#!/usr/bin/env python3
"""Turn the recorded masters into the files the website ships.

    ./.venv/bin/python tools/publish.py --dest /path/to/site/public/video

`record.py` writes one near-lossless intermediate per clip and stops there, so
every decision below — where a clip starts and ends, how hard it is compressed,
whether it is darkened for the hero — can be revised without paying for another
twenty-minute simulation run.

Two things drive the settings. First, a greenhouse at true plant density is
about the worst case a video codec can be handed: several thousand small
high-contrast leaf edges moving independently, with no flat regions to spend
nothing on. At CRF 23 the whole-house clip came out at 49 MB for 62 seconds,
which is not a web asset. Second, the hero clip is played under heavy darkening
by design, and darkening at encode time rather than in CSS both matches the
design and removes most of the detail the encoder was struggling with — the
same frames cost roughly a third as much.

Every clip therefore has an explicit trim. A sixty-second take of a robot doing
the same thing eleven times is a worse clip than an eighteen-second take of it
doing it twice, and the reel wants clips a grower will actually watch to the end.
"""

from __future__ import annotations

import argparse
import pathlib
import shutil
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
RAW = ROOT / "capture" / "raw"


def ffmpeg_exe() -> str:
    exe = shutil.which("ffmpeg")
    if exe:
        return exe
    import imageio_ffmpeg

    return imageio_ffmpeg.get_ffmpeg_exe()


# The house grade, applied to every clip that is not the hero: enough
# desaturation to sit beside the graded photography, a touch of warmth, and no
# darkening — these play on the light sections and on the dark reel, so they
# have to work against both.
GRADE = ("eq=saturation=0.78:contrast=0.96,"
         "colorbalance=rs=0.02:gm=0.01:bs=-0.025")

# name -> (source clip, start seconds, duration seconds, crf, poster offset,
#          extra video filter)
#
# `start` is measured from the top of the intermediate, which begins with the
# recorder's lead-in. Poster offsets are chosen on a frame where the arm is
# actually in the crop rather than parked, because the poster is what a visitor
# sees for as long as the clip takes to arrive.
EDITS: dict[str, dict] = {
    "hero": dict(
        source="whole-house",
        # ⚠️ Much shorter and much harder-compressed than the reel clips,
        # because this is the only video a visitor downloads without asking for
        # it. At 22 s and CRF 32 it was 4.4 MB and Lighthouse put
        # largest-contentful-paint at 8.4 s; even at 15 s and CRF 35 it was 86%
        # of the page's total bytes. The hero is a mood behind a headline, it is
        # already graded down to almost no detail, and it loops — so it is the
        # one clip where compression costs nothing anybody will see.
        start=1.0,
        duration=12.0,
        crf=38,
        webm_crf=52,
        poster=6.0,
        # The design darkens this behind the headline, and doing it here rather
        # than with a CSS overlay is worth two things: the codec stops paying
        # for detail that is about to be covered, and the text contrast is the
        # same on every browser instead of depending on a blend mode.
        #
        # ⚠️ It is a lift-and-cap, not a brightness cut. Simply subtracting
        # brightness crushed the foliage to flat black silhouettes while the
        # roof glazing stayed bright, which read as a broken image rather than a
        # dark one. `colorlevels` caps the whites at about half and lifts the
        # blacks to the palette's green-black, so every part of the frame
        # darkens together and the machine stays legible.
        vf="eq=saturation=0.42:contrast=0.80,"
           "colorlevels=romin=0.055:gomin=0.075:bomin=0.062"
           ":romax=0.50:gomax=0.52:bomax=0.50,"
           "colorbalance=rs=0.03:gm=0.03:bs=-0.03",
    ),
    "whole-house": dict(
        source="whole-house", start=2.0, duration=17.0, crf=30, webm_crf=46,
        poster=8.0, vf=GRADE,
    ),
    "single-pick": dict(
        # ⚠️ Starts twenty seconds in, which is most of the take. The first
        # twenty seconds are the arm crossing the aisle, and the clip is called
        # "it takes the truss, not the tomato" — the shot is the gripper closing
        # on a cluster, which is what the last fifteen seconds are.
        source="single-pick", start=20.0, duration=15.0, crf=30, webm_crf=46,
        poster=7.0, vf=GRADE,
    ),
    "row-load": dict(
        source="row-load", start=0.0, duration=18.0, crf=30, webm_crf=46,
        poster=8.0, vf=GRADE,
    ),
    "wrist-eye": dict(
        # The window where the classifier has several fruit in frame at once and
        # is separating them — which is the decision this clip exists to show —
        # with the close approach on a ripe one at the front of it.
        source="wrist-eye", start=2.0, duration=13.0, crf=30, webm_crf=46,
        poster=4.0, vf=GRADE,
    ),
    "replan": dict(
        # ⚠️ Starts twelve seconds in. This is Week 4's bolted-down scene, whose
        # backdrop is a flat green collision panel — it is a physics backstop,
        # not scenery, and it fills the opening frames. From about twelve
        # seconds the camera has drifted round and the arm is working fruit in
        # front of it, which is the shot. The panel earns its place in the
        # simulation and not on a website.
        source="replan", start=12.0, duration=18.0, crf=30, webm_crf=46,
        poster=9.0, vf=GRADE,
    ),
    "module-loop": dict(
        # The turntable is flat bone with one grey machine on it, so it
        # compresses an order of magnitude better than the crop — and it needs
        # the headroom, because banding across a smooth gradient is far more
        # visible than blocking in foliage. No trim: the loop's seam depends on
        # the clip being exactly one revolution.
        source="module-loop", start=0.0, duration=None, crf=28, webm_crf=42,
        poster=3.0, vf="eq=saturation=0.88:contrast=0.98",
    ),
}


def run(cmd: list[str]):
    subprocess.run(cmd, check=True)


def publish(name: str, spec: dict, dest: pathlib.Path):
    ff = ffmpeg_exe()
    src = RAW / f"{spec['source']}.mp4"
    if not src.exists():
        print(f"  {name}: no master at {src} — skipped")
        return False

    dest.mkdir(parents=True, exist_ok=True)
    trim = ["-ss", str(spec["start"])]
    if spec["duration"] is not None:
        trim += ["-t", str(spec["duration"])]

    mp4 = dest / f"{name}.mp4"
    webm = dest / f"{name}.webm"
    poster = dest / f"{name}.jpg"

    run([ff, "-y", "-hide_banner", "-loglevel", "error", *trim, "-i", str(src),
         "-vf", spec["vf"],
         "-c:v", "libx264", "-profile:v", "high", "-level", "4.2",
         "-preset", "slower", "-crf", str(spec["crf"]),
         "-pix_fmt", "yuv420p",
         # A keyframe every two seconds. The reel seeks between clips and a
         # 10-second GOP makes every one of those seeks visibly slow.
         "-g", "120", "-keyint_min", "120", "-sc_threshold", "0",
         "-movflags", "+faststart", "-an", str(mp4)])

    run([ff, "-y", "-hide_banner", "-loglevel", "error", *trim, "-i", str(src),
         "-vf", spec["vf"],
         "-c:v", "libvpx-vp9", "-crf", str(spec["webm_crf"]), "-b:v", "0",
         "-row-mt", "1", "-tile-columns", "2", "-frame-parallel", "0",
         # ⚠️ `realtime` looked like a free 10x and was not: on foliage this
         # dense it produced files four to five times the size of the H.264 at
         # the same nominal quality. `good` at cpu-used 4 is the cheapest
         # setting that is actually competitive.
         "-deadline", "good", "-cpu-used", "4",
         "-g", "120", "-pix_fmt", "yuv420p", "-an", str(webm)])

    run([ff, "-y", "-hide_banner", "-loglevel", "error",
         "-ss", str(spec["start"] + spec["poster"]), "-i", str(src),
         "-vf", spec["vf"], "-frames:v", "1", "-q:v", "6", str(poster)])

    # ⚠️ The site lists the mp4 *before* the webm, which is the opposite of
    # the usual advice. Measured on this footage — a four-row house at true
    # plant density, which is close to a worst case for any codec — libvpx-vp9
    # needed CRF 50 to match x264 CRF 30 on size, and looked worse doing it.
    # VP9 wins on most material; it does not win on this, so the webm ships as
    # a fallback rather than as the preferred source.
    for p in (mp4, webm, poster):
        print(f"    {p.name:<24} {p.stat().st_size / 1e6:6.2f} MB")
    return True


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--dest", required=True)
    ap.add_argument("names", nargs="*")
    args = ap.parse_args()

    dest = pathlib.Path(args.dest).expanduser().resolve()
    names = args.names or list(EDITS)
    total = 0.0
    for name in names:
        if name not in EDITS:
            raise SystemExit(f"unknown clip {name!r}")
        print(f"\n  {name}")
        if publish(name, EDITS[name], dest):
            total += sum(
                (dest / f"{name}{ext}").stat().st_size
                for ext in (".mp4", ".webm", ".jpg")
            )
    print(f"\n  {total / 1e6:.1f} MB written to {dest}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
