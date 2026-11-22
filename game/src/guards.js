// Guard patrols, vision cones, camera sweeps and line-of-sight checks.

export function angleDiff(from, to) {
  let d = from - to;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

function segSeg(x1, y1, x2, y2, x3, y3, x4, y4) {
  const d = (x2 - x1) * (y4 - y3) - (y2 - y1) * (x4 - x3);
  if (d === 0) return false;
  const t = ((x3 - x1) * (y4 - y3) - (y3 - y1) * (x4 - x3)) / d;
  const u = ((x3 - x1) * (y2 - y1) - (y3 - y1) * (x2 - x1)) / d;
  return t >= 0 && t <= 1 && u >= 0 && u <= 1;
}

export function segmentHitsWall(x1, y1, x2, y2, walls) {
  for (const w of walls) {
    if (x1 > w.x && x1 < w.x + w.w && y1 > w.y && y1 < w.y + w.h) return true;
    if (x2 > w.x && x2 < w.x + w.w && y2 > w.y && y2 < w.y + w.h) return true;
    if (segSeg(x1, y1, x2, y2, w.x, w.y, w.x + w.w, w.y)) return true;
    if (segSeg(x1, y1, x2, y2, w.x + w.w, w.y, w.x + w.w, w.y + w.h)) return true;
    if (segSeg(x1, y1, x2, y2, w.x + w.w, w.y + w.h, w.x, w.y + w.h)) return true;
    if (segSeg(x1, y1, x2, y2, w.x, w.y + w.h, w.x, w.y)) return true;
  }
  return false;
}

// True when the watcher at (ox, oy) facing dir can see point (px, py).
export function canSee(px, py, ox, oy, dir, range, fov, walls) {
  const dx = px - ox;
  const dy = py - oy;
  const dist = Math.hypot(dx, dy);
  if (dist > range) return false;
  if (dist > 4 && Math.abs(angleDiff(Math.atan2(dy, dx), dir)) > fov / 2) return false;
  return !segmentHitsWall(ox, oy, px, py, walls);
}

function moveToward(g, tx, ty, speed, dt) {
  const dx = tx - g.x;
  const dy = ty - g.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 2) return true;
  const step = Math.min(dist, speed * dt);
  g.x += (dx / dist) * step;
  g.y += (dy / dist) * step;
  g.dir = Math.atan2(dy, dx);
  return dist - step < 2;
}

// Advance one guard. Returns 'seen' when this guard currently sees the player.
export function updateGuard(g, player, walls, dt, now, alarmRaised) {
  if (g.frozen > 0) {
    g.frozen -= dt;
    return false;
  }
  const seen = canSee(player.x, player.y, g.x, g.y, g.dir, g.range * (g.rangeScale || 1), g.fov, walls);
  if (alarmRaised && seen) {
    g.mode = 'chase';
    g.chaseLose = 0;
  }
  if (g.mode === 'chase') {
    moveToward(g, player.x, player.y, g.speed * 1.55, dt);
    if (!seen) {
      g.chaseLose += dt;
      if (g.chaseLose > 4) { g.mode = 'patrol'; g.chaseLose = 0; }
    } else {
      g.chaseLose = 0;
    }
    return seen;
  }
  if (g.mode === 'investigate') {
    if (now < g.investigateUntil) {
      const arrived = moveToward(g, g.targetX, g.targetY, g.speed * 1.2, dt);
      if (arrived) g.dir += dt * 1.5;
      return seen;
    }
    g.mode = 'patrol';
  }
  // Patrol: walk the waypoint loop, pausing briefly at each stop.
  if (g.wait > 0) {
    g.wait -= dt;
    return seen;
  }
  const target = g.path[g.wp];
  const arrived = moveToward(g, target[0], target[1], g.speed, dt);
  if (arrived) {
    g.wp = (g.wp + 1) % g.path.length;
    g.wait = 0.8;
  }
  return seen;
}

// Advance one camera sweep. Returns 'seen' when it currently spots the player.
export function updateCamera(c, player, walls, dt, time, now) {
  if (now < c.disabledUntil) return false;
  c.angle = c.base + Math.sin(time * 0.55) * c.sweep;
  return canSee(player.x, player.y, c.x, c.y, c.angle, c.range * (c.rangeScale || 1), 1.05, walls);
}
