# gta6-trophy-guide-01

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/xavier015869/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/xavier015869/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

**Leonida Legend** is an offline trophy guide and tracker for Grand Theft Auto VI on PlayStation 5. It covers all 55 trophies with their official names, descriptions and grades, and a guide to each one written for this app with its sources named beside it (the official PlayStation descriptions, PowerPyx, Push Square, PSNProfiles, GTABase and EGamers.io). A six-stage roadmap orders the run — story first, stranger strands before their windows close, then feats and robberies, the tracked grinds, collectibles and exploration, and the money and 100% endgame — and the six missable trophies (the Andy, Kenton, Billy, Randy and Tyrone finales, plus Positive Mental Attitude) carry unmissable red warnings in the list, in a warning strip, and in their detail views. The tracker ticks trophies off, keeps progress counters for the twenty trophies PlayStation tracks to a number (250 stunts, 42 range golds, 500 choices, $250,000 laundered and the rest), shows per-grade and overall completion, saves everything in localStorage, and exports and imports progress as a file. A spoiler shield masks the names and descriptions of the 28 hidden trophies until they are earned. The app is plain static files under `app/` — no build step, no network, it runs from any static server with the network off.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

That validates `app/data/trophies.json` (55 trophies, each with a guide), copies `app/` and `screenshots/` to `out/` and writes `out/dossier.json`. To use the guide, serve `app/` with any static file server (for example `npx serve app`) and open `index.html` in a browser.

---

Entered on [make.fun](https://make.fun/?ref=9d3wsaqp&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards
