// Staged screenshot support: ?shot=start|play|end&seed=1 renders a fixed
// scene from the game's own code so captures are deterministic.
export function parseShot() {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (!shot) return null;
  const seed = Number(params.get('seed') || '1') || 1;
  return { shot, seed };
}

// Tiny seeded RNG so staged scenes are reproducible.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Place actors for the mid-action cover shot: thief mid-room, guards on
// patrol with cones, cameras sweeping, loot in place, alarm part-filled.
// Seed 2 stages a second moment: the thief grabbing the diamond while a
// guard closes in.
export function stagePlayScene(game, seed) {
  const level = game.level;
  game.screen = 'play';
  if (seed === 2) {
    game.alarm = 62;
    game.time = 103;
    game.player.x = 190;
    game.player.y = 210;
    game.lootGot = 1;
    game.lootValue = 200;
    level.loot[2].taken = true;
    const spots = [
      [480, 420, 0],
      [800, 300, Math.PI],
    ];
    level.guards.forEach((g, i) => {
      const s = spots[i % spots.length];
      g.x = s[0];
      g.y = s[1];
      g.dir = s[2];
      g.mode = 'patrol';
    });
    level.cameras.forEach((c, i) => {
      c.angle = c.base + (i % 2 === 0 ? -0.5 : 0.5);
    });
    game.spotted = 0.6;
    return;
  }
  game.alarm = 35;
  game.time = 47;
  game.player.x = 500;
  game.player.y = 430;
  const spots = [
    [480, 300, Math.PI / 2],
    [800, 500, -Math.PI / 2],
  ];
  level.guards.forEach((g, i) => {
    const s = spots[i % spots.length];
    g.x = s[0];
    g.y = s[1];
    g.dir = s[2];
    g.mode = 'patrol';
  });
  level.cameras.forEach((c, i) => {
    c.angle = c.base + (i % 2 === 0 ? 0.4 : -0.4);
  });
  game.spotted = 0;
}

export function stageEndScene(game) {
  game.screen = 'victory';
  game.totalValue = 2900;
  game.time = 214;
  game.lootValue = 1800;
  game.lootGot = 5;
  game.lootTotal = 5;
}
