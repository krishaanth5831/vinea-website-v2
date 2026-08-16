#!/usr/bin/env python3
"""Clean product-video recorder for the Vinea simulation.

The sim's own recorders (`week3_watch.py --out`, `two_arm_farm.py --out`, …)
composite four to six instrument panels with captions, HSV boxes and live stats
burned in. That is the right output for reading a run and the wrong output for a
website, so this walks the same simulations through the same public entry points
and renders **one** clean 1920x1080 camera instead.

    ./.venv/bin/python tools/record.py --list
    ./.venv/bin/python tools/record.py --probe whole-house
    ./.venv/bin/python tools/record.py whole-house single-pick

Frames are emitted once per control cycle. `reach.CTRL_DT` is 10 ms, so a
recorded second of simulation is exactly 100 frames; encoded at 60 fps every
rendered frame survives, evenly spaced, and playback runs at 0.6x. That is the
only sampling ratio available that drops nothing and duplicates nothing — 60
frames of a 100 Hz signal cannot be taken evenly — and slight slow motion suits
a machine whose whole argument is that it is deliberate. Perceived pace is set
instead by each clip's `speed`, the fraction of the FR5's rated joint speed the
run actually uses.

Nothing here reaches into the simulation's internals: clips subscribe to the
`on_tick` / `on_event` hooks `farm.run`, `farm.trussrun`, `farm.duo` and
`week4_place.harvest_placed` already expose for their viewers.
"""

from __future__ import annotations

import argparse
import math
import os
import pathlib
import shutil
import subprocess
import sys
import time

os.environ.setdefault("MUJOCO_GL", "egl")

ROOT = pathlib.Path(__file__).resolve().parents[1]
SIM = ROOT / "simulation" / "mujoco"
sys.path.insert(0, str(SIM))

import numpy as np  # noqa: E402
import mujoco  # noqa: E402

W, H = 1920, 1080
FPS = 60                      # encoded frame rate
MAX_GEOM = 90000              # the four-row house at true plant density

OUT = ROOT / "capture"
RAW = OUT / "raw"


# --- encoding ---------------------------------------------------------------

def ffmpeg_exe() -> str:
    """The static ffmpeg that ships with imageio-ffmpeg, or a system one."""
    exe = shutil.which("ffmpeg")
    if exe:
        return exe
    import imageio_ffmpeg

    return imageio_ffmpeg.get_ffmpeg_exe()


class Encoder:
    """Raw RGB frames straight into ffmpeg.

    Writes a near-lossless intermediate rather than a deliverable: every final
    format is transcoded from this one file, so a re-encode never costs another
    simulation run.
    """

    def __init__(self, path: pathlib.Path, w=W, h=H, fps=FPS):
        path.parent.mkdir(parents=True, exist_ok=True)
        self.path = path
        self.n = 0
        cmd = [
            ffmpeg_exe(), "-y", "-hide_banner", "-loglevel", "error",
            "-f", "rawvideo", "-pix_fmt", "rgb24",
            "-s", f"{w}x{h}", "-r", str(fps), "-i", "-",
            "-an",
            "-c:v", "libx264", "-preset", "veryfast", "-crf", "12",
            "-pix_fmt", "yuv420p",
            str(path),
        ]
        self.proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)

    def push(self, rgb: np.ndarray):
        self.proc.stdin.write(np.ascontiguousarray(rgb, dtype=np.uint8).tobytes())
        self.n += 1

    def close(self):
        if self.proc.stdin:
            self.proc.stdin.close()
        self.proc.wait()


def finals(raw: pathlib.Path, name: str, dest: pathlib.Path, poster_at=0.35):
    """Transcode one intermediate into the three files the site actually ships.

    mp4 first because Safari needs H.264; webm second because it is a third of
    the bytes everywhere else; a poster frame third so the `<video>` has
    something to show before a single byte of media is fetched.
    """
    dest.mkdir(parents=True, exist_ok=True)
    ff = ffmpeg_exe()
    mp4 = dest / f"{name}.mp4"
    webm = dest / f"{name}.webm"
    poster = dest / f"{name}.jpg"

    subprocess.run([
        ff, "-y", "-hide_banner", "-loglevel", "error", "-i", str(raw),
        "-c:v", "libx264", "-profile:v", "high", "-preset", "slow",
        "-crf", "23", "-pix_fmt", "yuv420p",
        "-movflags", "+faststart", "-an", str(mp4)], check=True)

    subprocess.run([
        ff, "-y", "-hide_banner", "-loglevel", "error", "-i", str(raw),
        "-c:v", "libvpx-vp9", "-crf", "34", "-b:v", "0",
        "-row-mt", "1", "-deadline", "good", "-cpu-used", "2",
        "-pix_fmt", "yuv420p", "-an", str(webm)], check=True)

    dur = probe_duration(raw)
    subprocess.run([
        ff, "-y", "-hide_banner", "-loglevel", "error",
        "-ss", f"{max(0.0, dur * poster_at):.2f}", "-i", str(raw),
        "-frames:v", "1", "-q:v", "3", str(poster)], check=True)

    for p in (mp4, webm, poster):
        print(f"    {p.name:<28} {p.stat().st_size / 1e6:6.2f} MB")
    return mp4, webm, poster


def probe_duration(path: pathlib.Path) -> float:
    ff = ffmpeg_exe()
    probe = pathlib.Path(ff).with_name("ffprobe")
    if probe.exists():
        out = subprocess.run([str(probe), "-v", "error", "-show_entries",
                              "format=duration", "-of",
                              "default=nw=1:nk=1", str(path)],
                             capture_output=True, text=True)
        try:
            return float(out.stdout.strip())
        except ValueError:
            pass
    # ffprobe is not in the imageio wheel; ffmpeg reports duration on stderr.
    out = subprocess.run([ff, "-i", str(path)], capture_output=True, text=True)
    for line in out.stderr.splitlines():
        if "Duration:" in line:
            hms = line.split("Duration:")[1].split(",")[0].strip()
            h, m, s = hms.split(":")
            return int(h) * 3600 + int(m) * 60 + float(s)
    return 1.0


# --- camera -----------------------------------------------------------------

def smooth(cur, target, tau, dt):
    """One step of a first-order lag. `tau` is the time to close ~63% of a gap.

    Every camera value goes through this. A camera cut straight to a tracked
    site inherits the site's own step-to-step noise, which reads as jitter at
    60 fps even when the arm is moving smoothly; a lag with tau well above the
    control period cannot.
    """
    if tau <= 0:
        return target
    a = 1.0 - math.exp(-dt / tau)
    return cur + (target - cur) * a


class Rig:
    """A free camera that follows a moving point without ever snapping to it.

    Position is polar about the tracked point — MuJoCo's own free-camera
    parameterisation — because every shot in this file wants the camera to stay
    in the aisle while the thing it is watching moves along it, and an azimuth
    held near 270 deg is exactly that constraint.
    """

    def __init__(self, target, distance, azimuth, elevation, lookat_offset=(0, 0, 0),
                 tau_pos=0.45, tau_orbit=0.9, drift=(0.0, 0.0, 0.0),
                 drift_span=16.0):
        self.target = target                  # callable -> world xyz
        self.offset = np.array(lookat_offset, dtype=float)
        self.d0, self.az0, self.el0 = distance, azimuth, elevation
        self.tau_pos, self.tau_orbit = tau_pos, tau_orbit
        self.d_rate, self.az_rate, self.el_rate = drift
        # ⚠️ Drift is per-second but it stops after `drift_span`. Unclamped, a
        # rate tuned for a fifteen-second shot keeps going for the whole take:
        # a -0.06 m/s push-in ran a 42-second recording of a pick down to a
        # negative camera distance, which flips the view inside out, and 3 deg/s
        # of orbit swung it 126 degrees off the subject. The clip is framed for
        # its first twenty seconds; after that the camera holds what it has.
        self.drift_span = drift_span
        self.cam = mujoco.MjvCamera()
        self.cam.type = mujoco.mjtCamera.mjCAMERA_FREE
        self.t = 0.0
        self._lookat = None

    def reset(self, model, data):
        p = np.asarray(self.target(model, data), dtype=float) + self.offset
        self._lookat = p.copy()
        self.t = 0.0
        self.cam.lookat[:] = p
        self.cam.distance = self.d0
        self.cam.azimuth = self.az0
        self.cam.elevation = self.el0

    def step(self, model, data, dt):
        if self._lookat is None:
            self.reset(model, data)
        p = np.asarray(self.target(model, data), dtype=float) + self.offset
        for i in range(3):
            self._lookat[i] = smooth(self._lookat[i], p[i], self.tau_pos, dt)
        self.t += dt
        d = min(self.t, self.drift_span)
        self.cam.lookat[:] = self._lookat
        self.cam.distance = max(0.25, smooth(self.cam.distance,
                                             self.d0 + self.d_rate * d,
                                             self.tau_orbit, dt))
        self.cam.azimuth = smooth(self.cam.azimuth,
                                  self.az0 + self.az_rate * d,
                                  self.tau_orbit, dt)
        self.cam.elevation = smooth(self.cam.elevation,
                                    self.el0 + self.el_rate * d,
                                    self.tau_orbit, dt)
        return self.cam


class FixedCam:
    """A named scene camera — the wrist and deck sensors — used as-is."""

    def __init__(self, name):
        self.name = name

    def reset(self, model, data):
        pass

    def step(self, model, data, dt):
        return self.name


# --- target helpers ---------------------------------------------------------

def body_pos(name):
    def f(model, data):
        return data.body(name).xpos
    return f


def site_pos(name):
    def f(model, data):
        return data.site(name).xpos
    return f


class Follow:
    """Track whichever of several things exists right now, in priority order.

    A pick shot wants the fruit while the arm is flying to it and the tool once
    the fruit is in the gripper and no longer a separate thing worth centring;
    a travel shot wants the trolley. Rather than switch cameras mid-clip, the
    same rig is handed a target that resolves differently as the run progresses.
    """

    def __init__(self, fallback):
        self.fallback = fallback
        self.override = None

    def __call__(self, model, data):
        if self.override is not None:
            try:
                return self.override(model, data)
            except (KeyError, ValueError):
                self.override = None
        return self.fallback(model, data)


def midpoint(a, b, w=0.5):
    def f(model, data):
        return (1 - w) * np.asarray(a(model, data)) + w * np.asarray(b(model, data))
    return f


# --- the perception overlay --------------------------------------------------

class Lens:
    """Draws what the colour classifier decided, on top of the wrist camera.

    The site's other clips are deliberately bare — no captions, no boxes — but
    this one is *about* the decision, and a clean camera feed cannot show a
    decision. Without the overlay the clip is a tomato getting closer; with it,
    you can watch the robot separate ripe from unripe by colour and commit to
    one.

    ⚠️ It does not use `farm.overlay.draw`. That function is tuned for a panel a
    sixth of a screen wide — 0.42pt text, 1px boxes, OpenCV's debug palette —
    and at 1920x1080 it renders as unreadable hairlines. This draws the same
    calls from `overlay.find` at a size that reads full-frame, in the site's
    own palette, so the result is an instrument rather than a debug dump.

    The classifier is the shipped one. Nothing here re-decides anything: it
    reads `find`'s answer and draws it, including when that answer is wrong.
    """

    # BGR, matched to the site tokens.
    SIGNAL = (79, 114, 226)      # #E2724F — ripe. The page's reserved colour.
    CHALK = (221, 232, 237)      # #EDE8DD
    MUTE = (119, 131, 138)       # #8A8377 — unripe
    INK = (18, 21, 15)           # #0F1512

    def __init__(self, detector=None, every=2):
        from farm.scout import StageDetector

        self.detector = detector or StageDetector()
        # The detector costs more than the render at this resolution. Every
        # other frame is 10 ms of lag at 100 Hz — a box a fifth of its own width
        # behind the fruit at the speeds this arm moves, which is not visible.
        self.every = every
        self.calls = []
        self.n = 0
        self.target = None       # world xyz of the fruit the arm committed to

    def frame(self, rgb, model=None, data=None):
        import cv2
        from farm import overlay

        bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
        if self.n % self.every == 0:
            self.calls = overlay.find(bgr, detector=self.detector, min_side=16)
        self.n += 1

        ripe = sum(1 for c in self.calls if c[5])
        # Far ones first, so a near fruit's tag is drawn over a distant one's
        # rather than under it.
        for u0, v0, u1, v1, stage, is_ripe, _fused in sorted(
                self.calls, key=lambda c: (c[2] - c[0]) * (c[3] - c[1])):
            colour = self.SIGNAL if is_ripe else self.MUTE
            self._box(bgr, u0, v0, u1, v1, colour, 4 if is_ripe else 2)
            # ⚠️ Only label what there is room to label. Four fruit at the far
            # end of a row are twenty pixels apart, and four tags at that
            # spacing overlap into one unreadable word — the first pass drew
            # "GREENTURNING". A ripe call always gets its tag because it is the
            # decision the clip exists to show; an unripe one earns its tag by
            # being big enough to carry it.
            if is_ripe or (u1 - u0) >= 34:
                self._tag(bgr, u0, v0, "RIPE" if is_ripe else stage.upper(),
                          colour, filled=is_ripe)

        self._legend(bgr, len(self.calls), ripe)
        return cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)

    def _box(self, bgr, u0, v0, u1, v1, colour, thick):
        import cv2

        if thick >= 4:
            # Corner brackets for the committed call — it reads as a lock
            # rather than as a rectangle drawn round some pixels.
            d = max(10, min(u1 - u0, v1 - v0) // 3)
            for x, sx in ((u0, 1), (u1, -1)):
                for y, sy in ((v0, 1), (v1, -1)):
                    cv2.line(bgr, (x, y), (x + sx * d, y), colour, thick,
                             cv2.LINE_AA)
                    cv2.line(bgr, (x, y), (x, y + sy * d), colour, thick,
                             cv2.LINE_AA)
        else:
            cv2.rectangle(bgr, (u0, v0), (u1, v1), colour, thick, cv2.LINE_AA)

    def _tag(self, bgr, u0, v0, text, colour, filled):
        import cv2

        font, scale, thick = cv2.FONT_HERSHEY_DUPLEX, 0.95, 2
        (tw, th), _ = cv2.getTextSize(text, font, scale, thick)
        y = max(th + 10, v0 - 10)
        if filled:
            cv2.rectangle(bgr, (u0, y - th - 11), (u0 + tw + 18, y + 8),
                          colour, -1)
            cv2.putText(bgr, text, (u0 + 9, y), font, scale, self.INK, thick,
                        cv2.LINE_AA)
        else:
            cv2.putText(bgr, text, (u0 + 2, y), font, scale, colour, thick,
                        cv2.LINE_AA)

    def _legend(self, bgr, found, ripe):
        """One line, bottom left. What the classifier is and what it just said.

        Named rather than anonymous: a viewer who cannot tell whether this is a
        neural network or a colour threshold cannot judge the claim, and the
        honest answer — a colour threshold — is the more impressive one here.
        """
        import cv2

        h = bgr.shape[0]
        font, scale, thick = cv2.FONT_HERSHEY_DUPLEX, 0.85, 2
        line = f"HSV COLOUR THRESHOLD   {found} FOUND   {ripe} RIPE"
        (tw, th), _ = cv2.getTextSize(line, font, scale, thick)
        pad, x, y = 20, 52, h - 52
        panel = bgr[y - th - pad:y + pad, x - pad:x + tw + pad]
        if panel.size:
            # A dark plate rather than a solid fill, so the frame still reads
            # as a camera feed with something drawn on it.
            panel[:] = (panel * 0.35).astype(panel.dtype)
        cv2.putText(bgr, line, (x, y), font, scale, self.CHALK, thick,
                    cv2.LINE_AA)


# --- the recorder ------------------------------------------------------------

class Take:
    """One recording in progress: a renderer, a rig, a gate and an encoder."""

    def __init__(self, name, model, data, rig, budget_s=None, want_picks=1,
                 lens=None):
        model.vis.global_.offwidth = W
        model.vis.global_.offheight = H
        self.name = name
        self.model, self.data = model, data
        self.rig = rig
        self.rig.reset(model, data)
        self.renderer = mujoco.Renderer(model, height=H, width=W,
                                        max_geom=MAX_GEOM)
        RAW.mkdir(parents=True, exist_ok=True)
        self.enc = Encoder(RAW / f"{name}.mp4")
        self.rolling = False
        self.budget = None if budget_s is None else int(budget_s * FPS)
        self.want_picks = want_picks
        self.picks = 0
        self.lens = lens
        self.t0 = time.perf_counter()
        self._last_report = 0

    # -- shutter
    def roll(self):
        self.rolling = True

    def cut(self):
        self.rolling = False

    @property
    def full(self):
        return self.budget is not None and self.enc.n >= self.budget

    # -- frames
    def _render(self):
        cam = self.rig.step(self.model, self.data, 1.0 / FPS)
        self.renderer.update_scene(self.data, camera=cam)
        rgb = self.renderer.render()
        if self.lens is not None:
            rgb = self.lens.frame(rgb, self.model, self.data)
        return rgb

    def frame(self):
        """One recorded frame. Safe to call unconditionally from `on_tick`."""
        if not self.rolling or self.full:
            return
        self.enc.push(self._render())
        if self.enc.n - self._last_report >= 300:
            self._last_report = self.enc.n
            el = time.perf_counter() - self.t0
            print(f"      {self.enc.n:5d} frames "
                  f"({self.enc.n / FPS:5.1f}s of video) · {el / 60:4.1f} min",
                  flush=True)

    def hold(self, seconds):
        """Lead-in / lead-out: the camera keeps moving, the physics does not.

        A held still frame is a freeze, not a lead-in. Stepping only the rig
        gives a few seconds of slow drift with the machine at rest, which is
        what a cut needs on either side of it.
        """
        was, self.rolling = self.rolling, True
        for _ in range(int(seconds * FPS)):
            if self.full:
                break
            self.enc.push(self._render())
        self.rolling = was

    def close(self):
        self.renderer.close()
        self.enc.close()
        secs = self.enc.n / FPS
        print(f"    recorded {self.enc.n} frames = {secs:.1f}s @ {FPS}fps "
              f"({(time.perf_counter() - self.t0) / 60:.1f} min wall)")
        if self.enc.n < 60:
            raise SystemExit(f"{self.name}: only {self.enc.n} frames — "
                             f"the gate never opened, do not ship this")
        # ⚠️ Frame count alone does not prove a clip is worth shipping. A run
        # whose route came back empty still records its lead-in, and a clip of
        # an aisle nothing happens in is exactly the bad take this recorder
        # exists to avoid. Every clip that is about a pick must have seen one.
        if self.picks < self.want_picks:
            raise SystemExit(
                f"{self.name}: {self.picks} pick(s) recorded, wanted "
                f"{self.want_picks} — re-seed the scene, do not ship this")
        return self.enc.path


# --- scene builders ---------------------------------------------------------

def truss_house(seed, n=6, arms=("a",), decks=False):
    import farm.truss as ft

    trusses = ft.spawn(n_per_row=n, seed=seed)
    model = ft.build(aisle=0, arms=arms, trusses=trusses, wrist_cam=True,
                     deck_cam=not decks, arm_decks=decks, seed=seed)
    data = mujoco.MjData(model)
    mujoco.mj_forward(model, data)
    return model, data, trusses


def loose_house(seed, n=12, arms=("a",), decks=False):
    import farm.crop as fcrop
    import farm.trolley as trolley

    trusses = fcrop.spawn(n_per_row=n, seed=seed)
    model = trolley.build(aisle=0, arms=arms, trusses=trusses, wrist_cam=True,
                          deck_cam=not decks, arm_decks=decks, seed=seed)
    data = mujoco.MjData(model)
    mujoco.mj_forward(model, data)
    return model, data, trusses


def stage(arms=("a", "b")):
    """The machine on its rail and nothing else — for the turntable only.

    A 360 degree orbit inside the house spends most of its arc behind a crop
    row, so the module viewer gets its own scene: the same `trolley.add_trolley`
    and the same `house._rails`, on a bare pale floor under flat light. Nothing
    is stepped in this scene, so its solver settings only have to be legal.
    """
    import farm.house as house
    import farm.trolley as trolley

    spec = mujoco.MjSpec()
    spec.option.timestep = 0.002
    spec.option.integrator = mujoco.mjtIntegrator.mjINT_IMPLICITFAST
    spec.option.cone = mujoco.mjtCone.mjCONE_ELLIPTIC
    spec.option.impratio = 10.0
    spec.visual.global_.offwidth = W
    spec.visual.global_.offheight = H

    # A pale, near-flat backdrop: the site puts this clip on the light section,
    # so a bone-white ground and a soft sky composite into it without a plate.
    # ⚠️ Flat, and the same tone as the floor. A gradient sky put a visible
    # horizon across the middle of the turntable, and on the page — where this
    # sits inside a bone panel on a bone section — that horizon read as a seam
    # in the layout rather than as a sky. Matching the two makes the machine
    # float on an infinite ground with no edge to notice.
    spec.add_texture(name="skybox", type=mujoco.mjtTexture.mjTEXTURE_SKYBOX,
                     builtin=mujoco.mjtBuiltin.mjBUILTIN_FLAT,
                     rgb1=[0.968, 0.957, 0.937], rgb2=[0.968, 0.957, 0.937],
                     width=512, height=512)
    spec.add_material(name="bone", rgba=[0.968, 0.957, 0.937, 1],
                      reflectance=0.0, specular=0.05, shininess=0.05)
    spec.worldbody.add_geom(name="floor", type=mujoco.mjtGeom.mjGEOM_PLANE,
                            pos=[house.aisle_x(0), 0, 0], size=[40, 40, 0.05],
                            material="bone")
    # Directional, not point. A point lamp falls off with distance, so on a
    # floor big enough to hide its own edge the ground fades to a grey band at
    # the horizon and that band sweeps past the machine once per revolution.
    # Directional light has no falloff, so the stage reads as one flat tone.
    # Tuned so a flat, upward-facing floor lands at almost exactly the skybox
    # tone: ambient + headlight + four directionals sums to roughly 1.0, and the
    # floor material is the bone value itself. Any brighter and the ground
    # clips to white and the seam comes back the other way round.
    spec.visual.headlight.ambient = [0.51, 0.51, 0.50]
    spec.visual.headlight.diffuse = [0.125, 0.125, 0.12]
    spec.visual.headlight.specular = [0.05, 0.05, 0.05]
    for dx, dy in ((-1.0, -1.0), (1.0, -1.0), (-1.0, 1.0), (1.0, 1.0)):
        spec.worldbody.add_light(
            type=mujoco.mjtLightType.mjLIGHT_DIRECTIONAL,
            pos=[house.aisle_x(0) + dx * 4, dy * 4, 6.0],
            dir=[-dx * 0.35, -dy * 0.35, -1],
            ambient=[0.0, 0.0, 0.0], diffuse=[0.125, 0.125, 0.121],
            specular=[0.05, 0.05, 0.05], castshadow=False)
    house._rails(spec, house.aisle_x(0), "stage")
    trolley.add_trolley(spec, aisle=0, arms=arms, crate=True)
    for tag in arms:
        from camera import add_wrist_camera

        add_wrist_camera(spec, prefix=trolley.ARM_PREFIX[tag])
    from farm.decks import add_arm_deck_cameras

    add_arm_deck_cameras(spec, aisle=0, arms=arms)

    model = spec.compile()
    data = mujoco.MjData(model)
    mujoco.mj_forward(model, data)
    return model, data


def park_all(model, data, arms=("a",)):
    from mission import park_arm, reset_park
    from farm import armframe, trolley

    parks = {t: armframe.park_posture(model, data, t, arms=arms) for t in arms}
    reset_park(model, data, parks[arms[0]], prefix=trolley.ARM_PREFIX[arms[0]])
    for t in arms:
        park_arm(model, data, parks[t], prefix=trolley.ARM_PREFIX[t])
    mujoco.mj_forward(model, data)
    return parks


# --- clips ------------------------------------------------------------------
#
# Each clip is a function taking (probe: bool). With `probe` it builds the
# scene, renders the opening frame to capture/probe/<name>.png and returns
# without stepping any physics — the framing can be judged in seconds instead of
# after a twenty-minute run.

CLIPS = {}


def clip(name, title):
    def wrap(fn):
        fn.title = title
        CLIPS[name] = fn
        return fn
    return wrap


def probe_shot(name, model, data, rig):
    model.vis.global_.offwidth = W
    model.vis.global_.offheight = H
    rig.reset(model, data)
    r = mujoco.Renderer(model, height=H, width=W, max_geom=MAX_GEOM)
    r.update_scene(data, camera=rig.step(model, data, 1.0 / FPS))
    img = r.render()
    r.close()
    import cv2

    d = OUT / "probe"
    d.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(d / f"{name}.png"), cv2.cvtColor(img, cv2.COLOR_RGB2BGR))
    print(f"  probe -> {d / f'{name}.png'}")


@clip("single-pick", "One arm takes a single truss off the vine")
def single_pick(probe=False):
    """The cut, close. Truss crop, one arm, ground-truth routing.

    `use_truth` is on because this clip is about the mechanism — cradle, blade,
    carry — and a scouting pass in front of it would be four minutes of a head
    slewing. What perception can do on its own is clip 3's job.
    """
    import farm.trussrun as tr
    import farm.trolley as trolley

    model, data, trusses = truss_house(seed=7, n=6)
    park_all(model, data)
    # ⚠️ The subject is the *pick*, which is the tool and the truss together —
    # so the camera tracks the midpoint of the two, weighted toward the fruit.
    # Tracking the fruit alone (the first version) pushed in until the tomato
    # filled the frame and the gripper was a dark shape leaving the edge: you
    # could see a tomato, and you could not see it being taken.
    follow = Follow(site_pos("tool0"))
    rig = Rig(follow, distance=0.95, azimuth=292, elevation=-6,
              lookat_offset=(0.0, 0, 0.01), tau_pos=0.5, tau_orbit=1.2,
              drift=(-0.012, 0.5, -0.12), drift_span=18.0)
    if probe:
        return probe_shot("single-pick", model, data, rig)

    take = Take("single-pick", model, data, rig, budget_s=42)
    state = {"picks": 0}

    def on_event(kind, **info):
        if kind == "fly":
            # Both the tool and the fruit, biased to the fruit — the gripper
            # closing on a truss is the shot, and it needs both in frame.
            name = info.get("fruit")
            if name:
                follow.override = midpoint(site_pos("tool0"),
                                           body_pos(name), w=0.62)
            take.roll()
        elif kind == "result":
            follow.override = None
            take.picks += 1
            if take.picks >= 2:
                take.cut()

    take.hold(2.5)
    take.roll()
    tr.run(seed=7, aisle=0, n_per_row=6, speed=0.45, use_truth=True,
           max_stops=1, on_tick=lambda _t=None: take.frame(),
           on_event=on_event, verbose=True, scene=(model, data, trusses))
    take.rolling = True
    take.hold(2.5)
    return take.close()


@clip("row-load", "A full row, stems detaching under load")
def row_load(probe=False):
    """Loose fruit, one arm, several picks in sequence.

    Loose fruit is the crop that detaches by being pulled until the peduncle
    weld gives at `plant_row.SNAP_N`, so this is the clip where a stem visibly
    lets go rather than being cut. Wider than clip 1 on purpose: the subject is
    the row emptying, not the gripper.
    """
    import farm.run as frun

    model, data, trusses = loose_house(seed=11, n=12)
    park_all(model, data)
    follow = Follow(site_pos("tool0"))
    # ⚠️ Azimuth is on the far side of 270 here, unlike clip 1.
    # `house.serves(0)` gives arm A row 1, which sits at +x from the aisle — so
    # the arm reaches *away* from an azimuth below 270 and the first take was
    # shot straight through a crop row, with the arm a pale smudge behind four
    # metres of leaves. Above 270 the camera stays on the aisle side of the work
    # and the row it is emptying is the backdrop rather than the obstruction.
    rig = Rig(follow, distance=1.85, azimuth=292, elevation=-6,
              lookat_offset=(0.02, 0, 0.0), tau_pos=0.85, tau_orbit=1.6,
              drift=(0.0, 0.75, -0.12))
    if probe:
        return probe_shot("row-load", model, data, rig)

    take = Take("row-load", model, data, rig, budget_s=54)

    def on_event(kind, **info):
        if kind == "fly":
            name = info.get("fruit")
            if name:
                follow.override = midpoint(site_pos("tool0"),
                                           body_pos(name), w=0.55)
            take.roll()
        elif kind == "result":
            follow.override = None
            take.picks += 1

    take.hold(2.5)
    take.roll()
    frun.run(seed=11, aisle=0, n_per_row=12, speed=0.5, use_truth=True,
             max_stops=2, on_tick=lambda _t=None: take.frame(),
             on_event=on_event, verbose=True, scene=(model, data, trusses))
    take.rolling = True
    take.hold(2.5)
    return take.close()


@clip("wrist-eye", "The wrist camera finding fruit on its own")
def wrist_eye(probe=False):
    """The robot's own eye, with the classifier's decision drawn on it.

    `use_truth=False`, so nothing in this run was told where a tomato is: the
    deck camera maps the aisle, the route is planned off that map, and the wrist
    camera closes the last 280 mm.

    ⚠️ This is the one clip that carries an overlay. Every other clip on the
    site is a bare camera, because their subject is the machine and a caption
    would only be decoration. Here the subject is a *decision* — this fruit is
    red enough, that one is not — and a clean feed cannot show a decision. See
    `Lens` for why it does not reuse `farm.overlay.draw`.
    """
    import farm.run as frun

    model, data, trusses = loose_house(seed=12, n=14)
    park_all(model, data)
    rig = FixedCam("wrist")
    if probe:
        return probe_shot("wrist-eye", model, data, rig)

    # The overlay is the point of this clip — see `Lens`.
    take = Take("wrist-eye", model, data, rig, budget_s=34, lens=Lens())

    def on_event(kind, **info):
        if kind == "fly":
            take.roll()
        elif kind == "result":
            take.picks += 1

    take.hold(1.5)
    frun.run(seed=12, aisle=0, n_per_row=14, speed=0.4, use_truth=False,
             max_stops=2, on_tick=lambda _t=None: take.frame(),
             on_event=on_event, verbose=True, scene=(model, data, trusses))
    take.rolling = True
    take.hold(2.0)
    return take.close()


@clip("replan", "Fruit placed freely, and the robot re-planning")
def replan(probe=False):
    """Week 4's bolted-down scene: fruit anywhere, and more arriving mid-run.

    This is the one clip not shot on the trolley, because the claim it carries —
    no hardcoded fruit positions, and a plan thrown away the moment the crop
    changes — is Week 4's and is measured there. Four fruit are placed, then
    three more appear after the second pick and the whole route is re-planned.
    """
    import numpy as _np
    from plant_row import Row
    from greenhouse import build_scene
    from mission import CLEARANCE, park_posture, reset_park
    import week4_place as wp

    pool = wp.pool_trusses()
    model = build_scene(wrist_cam=False, deck_cam=True, trusses=pool,
                        place_board=False)
    data = mujoco.MjData(model)
    names = [n for n, _, _ in pool]
    row = Row(model, data, names=names,
              homes={n: wp.park_spot(i) for i, n in enumerate(names)})
    park_q = park_posture(model)
    reset_park(model, data, park_q)
    row.reset()
    mujoco.mj_forward(model, data)
    crop = wp.Crop(model, data, row, names)
    crop.apply(wp.auto_layout(4, seed=5))

    # The three that arrive mid-run, generated against what is already hanging
    # so they land inside the measured envelope rather than on top of the crop.
    rng = _np.random.default_rng(5 + 99)
    add_layout, tries = [], 0
    while len(add_layout) < 3 and tries < 500:
        tries += 1
        y = float(rng.uniform(-wp.GUARANTEED_HALF_Y, wp.GUARANTEED_HALF_Y))
        z = float(rng.uniform(*wp.GUARANTEED_Z))
        probe_map = dict(crop.placed)
        for _n, ay, az in add_layout:
            probe_map[_n] = _np.array([wp.ROW_X, ay, az])
        ok, _why, _zn = wp.check(y, z, probe_map)
        if ok:
            add_layout.append((f"add{len(add_layout)}", y, z))

    follow = Follow(site_pos("tool0"))
    # ⚠️ Azimuth near 270, not 200. Week 4's scene has a flat green panel
    # behind the crop — a collision backstop, not scenery — and from 200 the
    # camera looks straight into it, so the whole take is a green wall with an
    # arm in front of it. Near 270 the camera looks *along* the row instead:
    # the panel goes edge-on and the fruit string away into depth.
    rig = Rig(follow, distance=1.45, azimuth=268, elevation=-7,
              lookat_offset=(0.06, 0, 0.02), tau_pos=0.7, tau_orbit=1.4,
              drift=(-0.02, 1.1, -0.15))
    if probe:
        return probe_shot("replan", model, data, rig)

    from deck_cam import DeckSurvey
    from week3_perceive import build_detector

    deck = DeckSurvey(model, detector=build_detector("hsv"))
    take = Take("replan", model, data, rig, budget_s=52)

    def on_event(kind, **info):
        if kind == "fly":
            name = info.get("fruit")
            if name:
                follow.override = midpoint(site_pos("tool0"),
                                           body_pos(name), w=0.55)
            take.roll()
        elif kind == "result":
            follow.override = None
            take.picks += 1

    take.hold(2.5)
    take.roll()
    wp.harvest_placed(model, data, row, crop, park_q, speed=0.5,
                      clearance=CLEARANCE, verbose=True,
                      add_at=2, add_layout=add_layout, seed=5,
                      on_tick=lambda _t=None: take.frame(),
                      on_event=on_event, deck=deck)
    take.rolling = True
    take.hold(2.5)
    return take.close()


@clip("whole-house", "The whole house: the trolley on the rail, both arms working")
def whole_house(probe=False):
    """The establishing shot. Two arms, one per row, a trolley that drives.

    The camera sits in the aisle at about a picker's eye height and tracks the
    trolley, so the rail leads into frame and the machine travels along it
    rather than across it. This is the only clip where the subject is the
    machine as a whole rather than a pick.
    """
    import farm.duo as duo
    import farm.trolley as trolley

    arms = ("a", "b")
    model, data, trusses = loose_house(seed=7, n=10, arms=arms, decks=True)
    park_all(model, data, arms=arms)

    rig = Rig(body_pos(trolley.TROLLEY), distance=3.4, azimuth=266,
              elevation=-5, lookat_offset=(0.0, 0.15, 1.02),
              tau_pos=1.6, tau_orbit=2.2, drift=(0.075, 0.75, -0.19))
    if probe:
        return probe_shot("whole-house", model, data, rig)

    state = duo.DuoState(arms=arms, aisle=0)
    state.trusses = list(trusses)
    take = Take("whole-house", model, data, rig, budget_s=62, want_picks=0)

    take.hold(3.0)
    take.roll()
    duo.run(model, data, trusses, state, arms=arms, aisle=0, speed=0.5,
            use_truth=True, max_stops=3, verbose=True,
            on_tick=lambda _t=None: take.frame())
    take.rolling = True
    take.hold(3.0)
    return take.close()


@clip("module-loop", "The machine, rotating — for the module viewer")
def module_loop(probe=False):
    """A seamless 360 of the machine at rest.

    The module viewer on the site shows this instead of placeholder geometry, so
    it has to loop: the last frame is one azimuth step short of the first, and
    the physics never advances, which is also why it is the only clip here with
    no simulation in it at all.
    """
    import farm.trolley as trolley

    arms = ("a", "b")
    model, data = stage(arms=arms)
    park_all(model, data, arms=arms)

    turns = 1
    seconds = 14.0
    frames = int(seconds * FPS)
    rig = Rig(body_pos(trolley.TROLLEY), distance=2.95, azimuth=200,
              elevation=-17, lookat_offset=(0.0, 0.10, 0.66),
              tau_pos=0.0, tau_orbit=0.0)
    if probe:
        return probe_shot("module-loop", model, data, rig)

    take = Take("module-loop", model, data, rig, budget_s=seconds + 1,
                want_picks=0)
    take.rolling = True
    for i in range(frames):
        # Set the angle outright rather than drifting to it: a lag would make
        # the seam between the last frame and the first a visible hitch.
        rig.cam.azimuth = 200 + 360.0 * turns * (i / frames)
        take.renderer.update_scene(take.data, camera=rig.cam)
        take.enc.push(take.renderer.render())
    return take.close()


# --- driver -----------------------------------------------------------------

def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("clips", nargs="*", help="clip names; default is all")
    ap.add_argument("--list", action="store_true")
    ap.add_argument("--probe", action="store_true",
                    help="render the opening frame of each clip and stop")
    ap.add_argument("--no-encode", action="store_true",
                    help="record the intermediate but skip mp4/webm/poster")
    ap.add_argument("--dest", default=None,
                    help="where the deliverables land (default capture/out)")
    args = ap.parse_args()

    if args.list:
        for k, fn in CLIPS.items():
            print(f"  {k:<14} {fn.title}")
        return 0

    names = args.clips or list(CLIPS)
    for n in names:
        if n not in CLIPS:
            raise SystemExit(f"unknown clip {n!r}; --list to see them")

    dest = pathlib.Path(args.dest) if args.dest else OUT / "out"
    for n in names:
        print(f"\n{'=' * 78}\n  {n} — {CLIPS[n].title}", flush=True)
        t0 = time.perf_counter()
        raw = CLIPS[n](probe=args.probe)
        if args.probe or raw is None:
            continue
        print(f"  recorded in {(time.perf_counter() - t0) / 60:.1f} min")
        if not args.no_encode:
            print("  encoding…")
            finals(raw, n, dest)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
