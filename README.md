# gta6-trophy-guide-01

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/xavier015869/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/xavier015869/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Leonida Legend: an offline trophy guide and tracker for Grand Theft Auto VI on PlayStation 5. All 55 official trophies with their names, descriptions and grades; a guide to each in our own words with its sources named beside it; a six-stage roadmap to the platinum built from the official descriptions, with the missable trophies flagged (the five stranger-chain finales and Positive Mental Attitude); and a tracker whose progress is saved in the browser, can be exported to a JSON file and imported back, filters by kind (story, missable, collectibles, activities, online), and offers a spoiler setting that masks hidden trophies until they are earned.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 — the guide is the static app in `app/` (no build step, no network needed). To hand the entry in the way the grader does: `MAKEFUN_OUTPUT_DIR=out node main.ts` copies `app/` and `screenshots/` to `out/` and writes `out/dossier.json`.

---

<sub>Entered on [make.fun](https://make.fun/?ref=9d3wsaqp&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
