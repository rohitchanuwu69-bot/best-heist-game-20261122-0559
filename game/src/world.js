// Night Vault — level layouts: walls, patrols, cameras, loot, exits.
// The playfield is the full 1280x800 canvas minus a 64px HUD strip.
export const PLAY = {
  x: 20, y: 76, w: 1240, h: 704,
};

export const LEVELS = [ // one entry per room, difficulty rising
  {
    name: 'Room 1 — The Art Gallery',
    intro: 'Slip past the patrols, lift every prize, then reach the green exit.',
    walls: [
      { y: 76, x: 300, h: 260, w: 24 },
      { y: 500, x: 300, h: 280, w: 24 },
      { y: 76, x: 640, h: 180, w: 24 },
      { y: 420, x: 640, h: 360, w: 24 },
      { y: 180, x: 940, h: 300, w: 24 },
      { y: 620, x: 940, h: 160, w: 24 },
      { y: 420, x: 120, h: 24, w: 180 },
      { y: 420, x: 1060, h: 24, w: 180 },
    ],
    guards: [
      { fov: 1.25, range: 230, speed: 70, path: [[480, 200], [480, 640]] },
      { fov: 1.25, range: 230, speed: 78, path: [[800, 620], [800, 180]] },
    ],
    cameras: [
      { x: 324, y: 300, base: 0, sweep: 0.9, range: 240 },
      { range: 240, sweep: 0.9, base: Math.PI, y: 600, x: 664 },
    ],
    loot: [
      { value: 500, kind: 'diamond', y: 160, x: 180 },
      { value: 300, kind: 'gold', y: 140, x: 1120 },
      { value: 200, kind: 'cash', y: 700, x: 1120 },
    ],
    exit: { h: 56, w: 56, y: 84, x: 1200 },
    player: { y: 720, x: 70 },
  },
  {
    name: 'Room 2 — The Vault Floor',
    intro: 'Three guards, three cameras. The diamond sits under a sweeping lens.',
    walls: [
      { x: 220, y: 76, w: 24, h: 220 },
      { x: 220, y: 460, w: 24, h: 320 },
      { x: 520, y: 200, w: 24, h: 340 },
      { x: 520, y: 660, w: 24, h: 120 },
      { x: 820, y: 76, w: 24, h: 260 },
      { x: 820, y: 500, w: 24, h: 280 },
      { x: 1060, y: 220, w: 24, h: 300 },
      { x: 120, y: 560, w: 120, h: 24 },
      { x: 1160, y: 300, w: 80, h: 24 },
    ],
    guards: [
      { path: [[380, 180], [380, 680]], speed: 85, range: 240, fov: 1.3 },
      { path: [[680, 640], [680, 160]], speed: 90, range: 240, fov: 1.3 },
      { path: [[980, 160], [1140, 160], [1140, 700], [980, 700]], speed: 80, range: 240, fov: 1.3 },
    ],
    cameras: [
      { x: 244, y: 300, base: 0, sweep: 1.0, range: 250 },
      { x: 544, y: 540, base: Math.PI, sweep: 1.0, range: 250 },
      { x: 844, y: 340, base: Math.PI / 2, sweep: 0.8, range: 250 },
    ],
    loot: [
      { x: 140, y: 150, kind: 'gold', value: 300 },
      { x: 1200, y: 150, kind: 'diamond', value: 500 },
      { x: 680, y: 740, kind: 'cash', value: 200 },
      { x: 1200, y: 420, kind: 'gold', value: 300 },
    ],
    exit: { x: 60, y: 84, w: 56, h: 56 },
    player: { x: 1210, y: 720 },
  },
  {
    name: 'Room 3 — The High-Roller Suite',
    intro: 'Four guards, four cameras, five prizes. One clean run to the getaway.',
    walls: [
      { x: 260, y: 76, w: 24, h: 240 },
      { x: 260, y: 480, w: 24, h: 300 },
      { x: 560, y: 180, w: 24, h: 320 },
      { x: 560, y: 640, w: 24, h: 140 },
      { x: 860, y: 76, w: 24, h: 280 },
      { x: 860, y: 520, w: 24, h: 260 },
      { x: 1120, y: 240, w: 24, h: 320 },
      { x: 120, y: 560, w: 160, h: 24 },
      { x: 1000, y: 600, w: 140, h: 24 },
    ],
    guards: [
      { path: [[420, 180], [420, 680]], speed: 95, range: 250, fov: 1.35 },
      { path: [[720, 660], [720, 480], [1000, 480], [1000, 160]], speed: 100, range: 250, fov: 1.35 },
      { path: [[1000, 180], [1000, 580], [1180, 580], [1180, 680]], speed: 90, range: 250, fov: 1.35 },
      { path: [[90, 700], [90, 140]], speed: 85, range: 250, fov: 1.35 },
    ],
    cameras: [
      { x: 284, y: 200, base: 0, sweep: 1.1, range: 260 },
      { x: 584, y: 500, base: Math.PI, sweep: 1.1, range: 260 },
      { x: 884, y: 340, base: Math.PI / 2, sweep: 1.0, range: 260 },
      { x: 1144, y: 540, base: Math.PI, sweep: 1.0, range: 260 },
    ],
    loot: [
      { x: 140, y: 140, kind: 'diamond', value: 500 },
      { x: 1220, y: 140, kind: 'gold', value: 300 },
      { x: 420, y: 740, kind: 'cash', value: 200 },
      { x: 700, y: 120, kind: 'gold', value: 300 },
      { x: 1220, y: 720, kind: 'diamond', value: 500 },
    ],
    exit: { x: 60, y: 84, w: 56, h: 56 },
    player: { x: 1210, y: 720 },
  },
];

// Fresh mutable runtime copies of a level definition.
export function buildLevel(index) {
  const def = LEVELS[index];
  return {
    def,
    index,
    guards: def.guards.map((g) => ({
      path: g.path.map((p) => [p[0], p[1]]),
      speed: g.speed,
      range: g.range,
      fov: g.fov,
      x: g.path[0][0],
      y: g.path[0][1],
      wp: 1 % g.path.length,
      wait: 0,
      dir: Math.atan2(g.path[1][1] - g.path[0][1], g.path[1][0] - g.path[0][0]),
      mode: 'patrol',
      frozen: 0,
      investigateUntil: 0,
      targetX: 0,
      targetY: 0,
      chaseLose: 0,
    })),
    cameras: def.cameras.map((c) => ({
      x: c.x, y: c.y, base: c.base, sweep: c.sweep, range: c.range,
      angle: c.base, disabledUntil: 0,
    })),
    loot: def.loot.map((l) => ({ x: l.x, y: l.y, kind: l.kind, value: l.value, taken: false })),
  };
}
