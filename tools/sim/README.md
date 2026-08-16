# The video toolchain

These two scripts produced every clip in `public/video/`. They are kept here
because a marketing site whose only product footage is generated should carry
the thing that generated it — otherwise "rendered from the simulation" is a
claim nobody can check.

They do not run from this repo. They import the Vinea simulation
([krishaanth5831/vinea](https://github.com/krishaanth5831/vinea), `dev` branch)
and belong in that repo's `tools/`:

```bash
git clone -b dev https://github.com/krishaanth5831/vinea.git
cd vinea
# third_party/ (the Fairino URDF and MuJoCo Menagerie) is gitignored there and
# has to be fetched separately — the scene will not compile without it.
python3 -m venv .venv
./.venv/bin/pip install mujoco glfw PyOpenGL mink opencv-python numpy imageio-ffmpeg
cp /path/to/this/repo/tools/sim/*.py tools/

MUJOCO_GL=egl ./.venv/bin/python tools/record.py --list
MUJOCO_GL=egl ./.venv/bin/python tools/record.py --probe        # framing only, seconds
MUJOCO_GL=egl ./.venv/bin/python tools/record.py --no-encode    # the masters, ~25 min
./.venv/bin/python tools/publish.py --dest /path/to/this/repo/public/video
```

`record.py` needs a GPU with EGL — it renders 1920×1080 offscreen once per
control cycle and the four-row house is about 90,000 geoms. `publish.py` needs
ffmpeg with libx264 and libvpx-vp9; `imageio-ffmpeg` ships a static build that
has both, so no system ffmpeg is required.

**The split matters.** `record.py` writes one near-lossless intermediate per
clip and stops. Every decision after that — where a clip starts and ends, how
hard it is compressed, whether it is darkened for the hero — lives in
`publish.py` and can be revised without paying for another twenty-minute
simulation run. Most of the trims and grades in there were arrived at by
looking at the output and going again.
