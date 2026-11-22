// Night Vault — game loop, state machine, alarm, tools and collisions.
import { buildLevel, LEVELS, PLAY } from './world.js';
import { updateGuard, updateCamera } from './guards.js';
import { draw as drawGame } from './render.js';
import { createInput as makeInput } from './input.js';
import { createAudio as makeAudio } from './audio.js';
import { stageEndScene, stagePlayScene, parseShot } from './shots.js';

const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d', { willReadFrequently: false });
const input = makeInput(canvas);
const audio = makeAudio();

const game = { // live match state
  ctx,
  screen: 'title',
  levelIndex: 0,
  level: buildLevel(0), // room one
  player: { x: 70, y: 720, r: 14 },
  alarm: 0,
  alarmRaised: false,
  time: 0,
  now: 0,
  tools: { emp: 2, noise: 3 },
  noise: null,
  noiseUntil: 0,
  spotted: 0,
  sneaking: false,
  lootGot: 0,
  lootTotal: 3,
  lootValue: 0,
  totalValue: 0,
  levelName: LEVELS[0].name,
};

function loadLevel(index) {
  game.levelIndex = index;
  game.level = buildLevel(index);
  const def = LEVELS[index];
  game.player.x = def.player.x;
  game.player.y = def.player.y;
  game.alarm = 0;
  game.alarmRaised = false;
  game.time = 0;
  game.tools = { emp: 2, noise: 3 };
  game.noise = null;
  game.spotted = 0;
  game.lootGot = 0;
  game.lootTotal = def.loot.length;
  game.lootValue = 0;
  game.levelName = def.name;
  game.screen = 'play';
}

function startGame() {
  game.totalValue = 0;
  loadLevel(0);
}

function circleHitsWall(x, y, r, walls) {
  for (const w of walls) {
    const cx = Math.max(w.x, Math.min(x, w.x + w.w));
    const cy = Math.max(w.y, Math.min(y, w.y + w.h));
    const dx = x - cx;
    const dy = y - cy;
    if (dx * dx + dy * dy < r * r) return w;
  }
  return null;
}

function movePlayer(dx, dy) {
  const p = game.player;
  const walls = game.level.def.walls;
  const nx = p.x + dx;
  if (!circleHitsWall(nx, p.y, p.r, walls)) p.x = nx;
  const ny = p.y + dy;
  if (!circleHitsWall(p.x, ny, p.r, walls)) p.y = ny;
  p.x = Math.max(PLAY.x + p.r, Math.min(PLAY.x + PLAY.w - p.r, p.x));
  p.y = Math.max(PLAY.y + p.r, Math.min(PLAY.y + PLAY.h - p.r, p.y));
}

function useEmp() {
  if (game.tools.emp <= 0 || game.screen !== 'play') return;
  game.tools.emp -= 1;
  for (const g of game.level.guards) g.frozen = 3;
  for (const c of game.level.cameras) c.disabledUntil = game.now + 8;
  game.alarm = Math.max(0, game.alarm - 25);
  audio.emp();
}

function useNoise() {
  if (game.tools.noise <= 0 || game.screen !== 'play') return;
  game.tools.noise -= 1;
  const p = game.player;
  const mx = input.mouse.x || p.x + 100;
  const my = input.mouse.y || p.y;
  const dx = mx - p.x;
  const dy = my - p.y;
  const len = Math.hypot(dx, dy) || 1;
  const tx = Math.max(PLAY.x + 20, Math.min(PLAY.x + PLAY.w - 20, p.x + (dx / len) * 150));
  const ty = Math.max(PLAY.y + 20, Math.min(PLAY.y + PLAY.h - 20, p.y + (dy / len) * 150));
  for (const g of game.level.guards) {
    if (g.mode !== 'chase') {
      g.mode = 'investigate';
      g.targetX = tx;
      g.targetY = ty;
      g.investigateUntil = game.now + 4;
    }
  }
  game.noise = { x: tx, y: ty, r: 12 };
  game.noiseUntil = game.now + 1.2;
  audio.noise();
}

function update(dt) {
  const level = game.level;
  const p = game.player;
  const keys = input.keys;

  game.sneaking = keys.has('shift');
  const speed = game.sneaking ? 95 : 190;
  let dx = 0;
  let dy = 0;
  if (keys.has('a') || keys.has('arrowleft')) dx -= 1;
  if (keys.has('d') || keys.has('arrowright')) dx += 1;
  if (keys.has('w') || keys.has('arrowup')) dy -= 1;
  if (keys.has('s') || keys.has('arrowdown')) dy += 1;
  if (dx !== 0 || dy !== 0) {
    const len = Math.hypot(dx, dy);
    movePlayer((dx / len) * speed * dt, (dy / len) * speed * dt);
  }

  if (input.wasPressed('e')) useEmp();
  if (input.wasPressed('q')) useNoise();
  if (input.wasPressed('m')) audio.toggleMute();
  if (input.wasPressed('r')) startGame();

  // Sneaking halves the range at which watchers can spot the thief.
  const scale = game.sneaking ? 0.55 : 1;
  for (const g of level.guards) g.rangeScale = scale;
  for (const c of level.cameras) c.rangeScale = scale;

  let guardSeen = false;
  let cameraSeen = false;
  for (const g of level.guards) {
    if (updateGuard(g, p, level.def.walls, dt, game.now, game.alarmRaised)) guardSeen = true;
  }
  for (const c of level.cameras) {
    if (updateCamera(c, p, level.def.walls, dt, game.time, game.now)) cameraSeen = true;
  }

  const seen = guardSeen || cameraSeen;
  if (seen) {
    game.alarm += (guardSeen ? 45 : 30) * dt;
    game.spotted = 1;
    if (Math.random() < dt * 2) audio.spotted();
  } else {
    game.alarm = Math.max(0, game.alarm - 12 * dt);
    game.spotted = Math.max(0, game.spotted - dt * 2);
  }
  if (game.alarm >= 100) {
    game.alarm = 100;
    if (!game.alarmRaised) audio.alarm();
    game.alarmRaised = true;
  }
  if (game.alarmRaised && !level.guards.some((g) => g.mode === 'chase')) {
    game.alarmRaised = false;
    game.alarm = 50;
  }

  // Caught: a chasing guard touches the thief.
  for (const g of level.guards) {
    if (g.mode === 'chase' && Math.hypot(g.x - p.x, g.y - p.y) < 30) {
      game.screen = 'caught';
      audio.caught();
      return;
    }
  }

  if (game.noise && game.now > game.noiseUntil) game.noise = null;
  if (game.noise) game.noise.r += dt * 30;

  // Loot pickup.
  for (const l of level.loot) {
    if (!l.taken && Math.hypot(l.x - p.x, l.y - p.y) < 28) {
      l.taken = true;
      game.lootGot += 1;
      game.lootValue += l.value;
      audio.pickup();
    }
  }

  // Exit opens once every prize is lifted.
  const allLoot = level.loot.every((l) => l.taken);
  const ex = level.def.exit;
  if (allLoot && p.x > ex.x - 10 && p.x < ex.x + ex.w + 10 && p.y > ex.y - 10 && p.y < ex.y + ex.h + 10) {
    game.totalValue += game.lootValue;
    if (game.levelIndex + 1 >= LEVELS.length) {
      game.screen = 'victory';
      audio.win();
    } else {
      game.screen = 'levelclear';
      audio.win();
    }
    return;
  }

  game.time += dt;
}

function handleClicks() {
  const clicked = input.mouse.clicked;
  const enter = input.wasPressed('enter');
  if (game.screen === 'title' && (clicked || enter)) {
    audio.unlock();
    audio.click();
    startGame();
  } else if (game.screen === 'levelclear' && (clicked || enter)) {
    audio.click();
    loadLevel(game.levelIndex + 1);
  } else if (game.screen === 'caught' && (clicked || input.wasPressed('r'))) {
    audio.click();
    loadLevel(game.levelIndex);
  } else if (game.screen === 'victory' && (clicked || input.wasPressed('r'))) {
    audio.click();
    startGame();
  } else if (game.screen === 'play' && input.wasPressed('r')) {
    startGame();
  }
}

let last = 0;
function frame(ts) {
  const dt = Math.min(0.05, (ts - last) / 1000 || 0.016);
  last = ts;
  game.now += dt;
  handleClicks();
  if (game.screen === 'play') update(dt);
  drawGame(game);
  input.endFrame();
  requestAnimationFrame(frame);
}

// Staged deterministic screenshots (?shot=start|play|end).
const staged = parseShot();
if (staged) {
  if (staged.shot === 'play') stagePlayScene(game, staged.seed);
  else if (staged.shot === 'end') stageEndScene(game);
  drawGame(game);
  window.__nightVault = game;
} else {
  window.__nightVault = game;
  requestAnimationFrame(frame);
}
