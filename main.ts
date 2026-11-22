import { existsSync, mkdirSync, writeFileSync, cpSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath as urlToPath } from 'node:url';
import { buildDossier } from "./vendor/makefun-game.ts";

const here = dirname(urlToPath(import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(out, { recursive: true }); // ensure the target folder exists
for (const dir of ["game", "screenshots"]) {
  const from = join(here, dir);
  if (existsSync(from)) cpSync(from, join(out, dir), { recursive: true });
}
const dossier = await buildDossier(
  out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, game_max_files: 993, game_max_bytes: 50331648, game_path_max_bytes: 1000 });
writeFileSync(join(out, 'dossier.json'), dossier);
