// All drawing for Night Vault: floor, walls, cones, loot, HUD and screens.
import { PLAY } from './world.js';

const LOOT_STYLE = {
  diamond: { color: '#7ee7ff', label: '◆' },
  gold: { color: '#ffd34d', label: '●' },
  cash: { color: '#7dff8a', label: '$' },
};

function drawCone(ctx, x, y, dir, range, fov, color, alpha) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, dir - fov / 2, dir + fov / 2);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

function drawFloor(ctx) {
  ctx.fillStyle = '#14161d';
  ctx.fillRect(PLAY.x, PLAY.y, PLAY.w, PLAY.h);
  ctx.strokeStyle = 'rgba(255,255,255,0.045)';
  ctx.lineWidth = 1;
  for (let x = PLAY.x; x <= PLAY.x + PLAY.w; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, PLAY.y); ctx.lineTo(x, PLAY.y + PLAY.h); ctx.stroke();
  }
  for (let y = PLAY.y; y <= PLAY.y + PLAY.h; y += 40) {
    ctx.beginPath(); ctx.moveTo(PLAY.x, y); ctx.lineTo(PLAY.x + PLAY.w, y); ctx.stroke();
  }
  ctx.strokeStyle = '#3a3f52';
  ctx.lineWidth = 3;
  ctx.strokeRect(PLAY.x, PLAY.y, PLAY.w, PLAY.h);
}

function drawWalls(ctx, walls) {
  for (const w of walls) {
    ctx.fillStyle = '#2c3142';
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.fillStyle = '#454c66';
    ctx.fillRect(w.x, w.y, w.w, 4);
    ctx.strokeStyle = '#171a24';
    ctx.lineWidth = 2;
    ctx.strokeRect(w.x, w.y, w.w, w.h);
  }
}

function drawExit(ctx, exit, open) {
  ctx.save();
  ctx.fillStyle = open ? '#1f7a37' : '#274d33';
  ctx.fillRect(exit.x, exit.y, exit.w, exit.h);
  ctx.strokeStyle = open ? '#7dff8a' : '#4d7a5c';
  ctx.lineWidth = 3;
  ctx.strokeRect(exit.x, exit.y, exit.w, exit.h);
  ctx.fillStyle = open ? '#b6ffc4' : '#8fb89a';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('EXIT', exit.x + exit.w / 2, exit.y + exit.h / 2);
  ctx.restore();
}

function drawLoot(ctx, loot, time) {
  for (const l of loot) {
    if (l.taken) continue;
    const s = LOOT_STYLE[l.kind];
    const bob = Math.sin(time * 3 + l.x) * 3;
    ctx.save();
    ctx.beginPath();
    ctx.arc(l.x, l.y + bob, 15, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(l.x, l.y + bob, 13, 0, Math.PI * 2);
    ctx.fillStyle = s.color;
    ctx.fill();
    ctx.fillStyle = '#14161d';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(s.label, l.x, l.y + bob + 1);
    ctx.restore();
  }
}

function drawGuards(ctx, guards, now) {
  for (const g of guards) {
    const alert = g.mode === 'chase';
    const frozen = g.frozen > 0;
    drawCone(ctx, g.x, g.y, g.dir, g.range, g.fov,
      alert ? '#ff5252' : '#ffd34d', alert ? 0.22 : 0.13);
    ctx.save();
    ctx.beginPath();
    ctx.arc(g.x, g.y, 15, 0, Math.PI * 2);
    ctx.fillStyle = frozen ? '#7ec8ff' : alert ? '#ff5252' : '#e8b13c';
    ctx.fill();
    ctx.strokeStyle = '#14161d';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Facing tick.
    ctx.beginPath();
    ctx.moveTo(g.x, g.y);
    ctx.lineTo(g.x + Math.cos(g.dir) * 20, g.y + Math.sin(g.dir) * 20);
    ctx.strokeStyle = '#14161d';
    ctx.lineWidth = 3;
    ctx.stroke();
    // Eyes.
    const ex = Math.cos(g.dir);
    const ey = Math.sin(g.dir);
    ctx.fillStyle = '#14161d';
    ctx.beginPath();
    ctx.arc(g.x + ex * 5 - ey * 5, g.y + ey * 5 + ex * 5, 2.2, 0, Math.PI * 2);
    ctx.arc(g.x + ex * 5 + ey * 5, g.y + ey * 5 - ex * 5, 2.2, 0, Math.PI * 2);
    ctx.fill();
    if (alert) {
      ctx.fillStyle = '#ff5252';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('!', g.x, g.y - 24);
    }
    ctx.restore();
  }
}

function drawCameras(ctx, cameras, now) {
  for (const c of cameras) {
    const off = now < c.disabledUntil;
    if (!off) drawCone(ctx, c.x, c.y, c.angle, c.range, 1.05, '#ff7a7a', 0.12);
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(c.angle);
    ctx.fillStyle = off ? '#5a6b8a' : '#ff5252';
    ctx.fillRect(-7, -5, 14, 10);
    ctx.beginPath();
    ctx.arc(8, 0, 4, 0, Math.PI * 2);
    ctx.fillStyle = off ? '#3a4763' : '#ff8a8a';
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#8a90a5';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(off ? 'OFF' : 'CAM', c.x, c.y + 20);
  }
}

function drawPlayer(ctx, p, sneaking) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(p.x, p.y, 14, 0, Math.PI * 2);
  ctx.fillStyle = sneaking ? '#5b4a8a' : '#7a5cff';
  ctx.fill();
  ctx.strokeStyle = '#e8e8ff';
  ctx.lineWidth = 2;
  ctx.stroke();
  // Mask stripe.
  ctx.beginPath();
  ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
  ctx.fillStyle = '#14161d';
  ctx.fill();
  ctx.fillStyle = '#e8e8ff';
  ctx.fillRect(p.x - 6, p.y - 2, 12, 4);
  ctx.restore();
}

function drawNoise(ctx, noise) {
  if (!noise) return;
  ctx.save();
  ctx.strokeStyle = '#7ee7ff';
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.arc(noise.x, noise.y, noise.r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(noise.x, noise.y, noise.r * 0.6, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#7ee7ff';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('?!', noise.x, noise.y - noise.r - 6);
  ctx.restore();
}

function drawHud(ctx, game) {
  const { alarm, lootGot, lootTotal, lootValue, time, tools, levelName } = game;
  ctx.fillStyle = '#0d0f16';
  ctx.fillRect(0, 0, 1280, 64);
  ctx.strokeStyle = '#2c3142';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, 64); ctx.lineTo(1280, 64); ctx.stroke();

  ctx.fillStyle = '#e8e8ff';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('NIGHT VAULT', 24, 24);
  ctx.fillStyle = '#8a90a5';
  ctx.font = '14px sans-serif';
  ctx.fillText(levelName, 24, 48);

  // Alarm meter.
  ctx.fillStyle = '#8a90a5';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('ALARM', 300, 20);
  ctx.fillStyle = '#232839';
  ctx.fillRect(300, 30, 260, 18);
  const frac = Math.max(0, Math.min(1, alarm / 100));
  ctx.fillStyle = frac < 0.5 ? '#ffd34d' : frac < 0.8 ? '#ff9a3c' : '#ff5252';
  ctx.fillRect(300, 30, 260 * frac, 18);
  ctx.strokeStyle = '#454c66';
  ctx.strokeRect(300, 30, 260, 18);
  ctx.fillStyle = '#e8e8ff';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText(Math.round(alarm) + '%', 570, 39);

  ctx.fillStyle = '#ffd34d';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('◆ Loot ' + lootGot + '/' + lootTotal + '  ·  $' + lootValue, 660, 24);
  ctx.fillStyle = '#8a90a5';
  ctx.font = '14px sans-serif';
  const mins = Math.floor(time / 60);
  const secs = Math.floor(time % 60);
  ctx.fillText('Time ' + mins + ':' + String(secs).padStart(2, '0'), 660, 48);

  ctx.fillStyle = '#7ee7ff';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('E EMP ×' + tools.emp + '    Q Noise ×' + tools.noise + '    Shift sneak', 1256, 24);
  ctx.fillStyle = '#8a90a5';
  ctx.font = '13px sans-serif';
  ctx.fillText('M mute · R restart', 1256, 48);
  ctx.textAlign = 'left';
}

function panel(ctx, x, y, w, h) {
  ctx.fillStyle = 'rgba(10, 12, 20, 0.88)';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#ffd34d';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
}

function centerText(ctx, text, y, size, color, bold) {
  ctx.fillStyle = color;
  ctx.font = (bold ? 'bold ' : '') + size + 'px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 640, y);
}

export function draw(game) {
  const { ctx, time, now, screen, level } = game;
  ctx.clearRect(0, 0, 1280, 800);

  if (screen === 'title') {
    drawFloor(ctx);
    drawWalls(ctx, level.def.walls);
    drawExit(ctx, level.def.exit, false);
    drawLoot(ctx, level.loot, time);
    drawGuards(ctx, level.guards, now);
    drawCameras(ctx, level.cameras, now);
    ctx.fillStyle = 'rgba(10, 12, 20, 0.72)';
    ctx.fillRect(0, 0, 1280, 800);
    panel(ctx, 340, 150, 600, 420);
    centerText(ctx, 'NIGHT VAULT', 210, 52, '#ffd34d', true);
    centerText(ctx, 'A top-down heist in three rooms', 260, 20, '#e8e8ff', false);
    centerText(ctx, 'Lift every prize. Dodge the cones.', 320, 18, '#b9bdd1', false);
    centerText(ctx, 'Reach the green EXIT before the alarm fills.', 348, 18, '#b9bdd1', false);
    centerText(ctx, 'WASD / arrows — move      Shift — sneak', 400, 17, '#8a90a5', false);
    centerText(ctx, 'E — EMP (freezes guards, kills cameras)', 428, 17, '#8a90a5', false);
    centerText(ctx, 'Q — noisemaker (lures guards away)', 456, 17, '#8a90a5', false);
    centerText(ctx, 'Click or press Enter to start', 520, 22, '#7ee7ff', true);
    return;
  }

  drawFloor(ctx);
  drawWalls(ctx, level.def.walls);
  const allLoot = level.loot.every((l) => l.taken);
  drawExit(ctx, level.def.exit, allLoot);
  drawLoot(ctx, level.loot, time);
  drawGuards(ctx, level.guards, now);
  drawCameras(ctx, level.cameras, now);
  drawNoise(ctx, game.noise);
  drawPlayer(ctx, game.player, game.sneaking);
  drawHud(ctx, game);

  if (game.spotted > 0) {
    ctx.fillStyle = 'rgba(255, 82, 82, ' + Math.min(0.25, game.spotted * 0.25) + ')';
    ctx.fillRect(0, 64, 1280, 736);
    centerText(ctx, 'SPOTTED!', 120, 30, '#ff5252', true);
  }

  if (screen === 'levelclear') {
    ctx.fillStyle = 'rgba(10, 12, 20, 0.72)';
    ctx.fillRect(0, 0, 1280, 800);
    panel(ctx, 390, 260, 500, 240);
    centerText(ctx, 'ROOM CLEARED', 320, 40, '#7dff8a', true);
    centerText(ctx, 'Loot banked: $' + game.lootValue, 375, 20, '#e8e8ff', false);
    centerText(ctx, 'Click or press Enter for the next room', 440, 18, '#7ee7ff', false);
  } else if (screen === 'caught') {
    ctx.fillStyle = 'rgba(20, 4, 8, 0.78)';
    ctx.fillRect(0, 0, 1280, 800);
    panel(ctx, 390, 260, 500, 240);
    centerText(ctx, 'CAUGHT!', 320, 44, '#ff5252', true);
    centerText(ctx, 'The alarm hit 100% and a guard grabbed you.', 375, 18, '#e8e8ff', false);
    centerText(ctx, 'Press R or click to try the room again', 440, 18, '#7ee7ff', false);
  } else if (screen === 'victory') {
    ctx.fillStyle = 'rgba(10, 12, 20, 0.72)';
    ctx.fillRect(0, 0, 1280, 800);
    panel(ctx, 340, 200, 600, 340);
    centerText(ctx, 'CLEAN GETAWAY!', 270, 48, '#ffd34d', true);
    centerText(ctx, 'All three rooms cleared. The vault is empty', 330, 20, '#e8e8ff', false);
    centerText(ctx, 'and the crew is already gone.', 358, 20, '#e8e8ff', false);
    centerText(ctx, 'Total loot: $' + game.totalValue, 410, 24, '#7dff8a', true);
    const mins = Math.floor(game.time / 60);
    const secs = Math.floor(game.time % 60);
    centerText(ctx, 'Total time: ' + mins + ':' + String(secs).padStart(2, '0'), 446, 18, '#b9bdd1', false);
    centerText(ctx, 'Press R or click to run it again', 496, 18, '#7ee7ff', false);
  }
}
