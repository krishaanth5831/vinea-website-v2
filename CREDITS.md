# Credits

## Photography

Every photograph on this site is free stock from [Pexels](https://www.pexels.com),
used under the [Pexels licence](https://www.pexels.com/license/). All of them were
downloaded, graded toward the site palette by `tools/images.mjs` and are served
from this domain — **nothing is hotlinked.**

The graded files live in `public/images/`; the manifest that carries their alt
text, dimensions and credits is generated into `src/lib/images.ts`.

| File | Photographer | Original |
|---|---|---|
| `pipe-rail-aisle.jpg` | Lyn Ong | [Fresh cherry tomatoes growing in a greenhouse](https://www.pexels.com/photo/fresh-cherry-tomatoes-growing-on-a-greenhouse-5005518/) |
| `diffuse-row.jpg` | Anna Tarazevich | [Flower buds on branches](https://www.pexels.com/photo/flower-buds-on-branches-7299952/) |
| `dutch-glasshouse.jpg` | Igor Passchier | [Modern greenhouse with tomato plants in South Holland](https://www.pexels.com/photo/modern-greenhouse-with-tomato-plants-in-south-holland-36917505/) |
| `truss-on-the-vine.jpg` | Cá Bảo | [Ripe and unripe cherry tomatoes on the vine](https://www.pexels.com/photo/ripe-and-unripe-cherry-tomatoes-on-the-vine-37443334/) |
| `high-wire-row.jpg` | Fer Martinez Gonzalez | [Plantation of tomatoes](https://www.pexels.com/photo/plantation-of-tomatoes-8180574/) |
| `stacked-crates.jpg` | Fatih Kopcal | [Worker in large greenhouse farm setting](https://www.pexels.com/photo/worker-in-large-greenhouse-farm-setting-32738498/) |
| `hand-at-the-vine.jpg` | Anna Tarazevich | [A hand touching the fruits on a plant](https://www.pexels.com/photo/a-hand-touching-the-fruits-on-a-plant-7299950/) |

## Video

**None of the video is stock, and none of it shows hardware.** Every clip in
`public/video/` was rendered from Vinea's own MuJoCo simulation
([krishaanth5831/vinea](https://github.com/krishaanth5831/vinea), `dev` branch)
in August 2026, using the recorder documented in the README. There is no
physical robot to film.

| Clip | What it is |
|---|---|
| `hero.mp4` | The four-row house, trolley driving the pipe rail, both arms working. Graded dark at encode time for the hero. |
| `single-pick.mp4` | One arm cradling a truss from below and cutting the stem. |
| `row-load.mp4` | A full row worked pick by pick, each stem detaching under measured load. |
| `wrist-eye.mp4` | The robot's own wrist camera, unannotated, on a run with perception in the loop. |
| `replan.mp4` | Fruit placed at arbitrary positions, more added mid-run, the route thrown away and rebuilt. |
| `whole-house.mp4` | The establishing shot: the trolley on the rail, two arms, four rows. |
| `module-loop.mp4` | A seamless 360° turntable of the machine, for the module viewer. |

## Typefaces

| Face | Use | Licence |
|---|---|---|
| [General Sans](https://www.fontshare.com/fonts/general-sans) by Frode Helland | Display and body | Fontshare free licence |
| [IBM Plex Mono](https://github.com/IBM/plex) | Data labels, units and measurement tags only | SIL Open Font Licence 1.1 |

Both are self-hosted from `src/fonts/` — no font CDN is contacted at runtime.
IBM Plex Mono is subset to Latin, two weights.
