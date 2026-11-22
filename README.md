[![make.fun · best-heist-game-20261122-0559](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/rohitchanuwu69-bot/best-heist-game-20261122-0559/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/rohitchanuwu69-bot/best-heist-game-20261122-0559/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)

# Night Vault — Top-Down Heist

A top-down 2D canvas heist game. You are the thief crossing three guarded
rooms: read the patrols and their vision cones, slip past the sweeping
cameras, lift every prize, and reach the green EXIT before the alarm meter
fills. Getting spotted raises the alarm; at 100% the guards chase you down.

Tools cost you: an EMP (2 per room) freezes guards and kills cameras, and a
noisemaker (3 per room) lures patrols away from your route. Hold Shift to
sneak — slower, but watchers spot you at half range.

## Run it

```sh
node serve.mjs
# open http://localhost:8080/ in desktop Chrome
```

No build step, no network requests, no audio files — all sounds are
synthesised with WebAudio.

## Controls

- **WASD / arrows** — move
- **Shift** — sneak (half speed, half detection range)
- **E** — EMP · **Q** — noisemaker (thrown toward the mouse)
- **R** — restart · **M** — mute · **Enter / click** — start and continue

## Staged screenshots

`?shot=start`, `?shot=play` and `?shot=end` (with `&seed=1`) render fixed
scenes from the game's own code for deterministic captures.
