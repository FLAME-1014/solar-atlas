import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'dist');
const version = (process.env.GITHUB_SHA || Date.now().toString(36)).slice(0, 12);
process.env.SOLAR_CACHE_VERSION = version;

const sharp = createRequire(path.join(root, 'package.json'))('sharp');
const icon = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="116" fill="#050708"/><circle cx="256" cy="256" r="97" fill="#edbd82"/><ellipse cx="256" cy="256" rx="220" ry="112" transform="rotate(-28 256 256)" fill="none" stroke="#9d805e" stroke-width="8"/><circle cx="450" cy="165" r="22" fill="#e6e1d6"/></svg>');
await sharp(icon).resize(512, 512).png().toFile(path.join(root, 'assets', 'app-icon.png'));

await import('./build-app.mjs');

await fs.rm(output, { recursive: true, force: true });
await fs.mkdir(output, { recursive: true });
for (const file of ['index.html', 'styles.css', 'favicon.svg', 'ATTRIBUTION.md', 'bootstrap.js', 'lite.html', 'manifest.webmanifest', 'sw.js']) {
  await fs.copyFile(path.join(root, file), path.join(output, file));
}
const page = await fs.readFile(path.join(output, 'index.html'), 'utf8');
await fs.writeFile(
  path.join(output, 'index.html'),
  page.replace('./styles.css"', `./styles.css?v=${version}`).replace(/bootstrap\.js\?v=[^"']+/, `bootstrap.js?v=${version}`),
);
for (const file of ['bootstrap.js', 'sw.js']) {
  const target = path.join(output, file);
  const content = await fs.readFile(target, 'utf8');
  await fs.writeFile(target, content.replaceAll('__SOLAR_BUILD_VERSION__', version));
}
for (const directory of ['src', 'assets']) {
  await fs.cp(path.join(root, directory), path.join(output, directory), { recursive: true });
}
await fs.writeFile(
  path.join(output, 'config.js'),
  "window.SOLAR_ATLAS_CONFIG = Object.freeze({ dataTransport: 'direct', deployment: 'github-pages' });\n",
);
await fs.writeFile(
  path.join(output, 'build-info.json'),
  JSON.stringify({ commit: process.env.GITHUB_SHA || 'local', builtAt: new Date().toISOString(), sitePath: '/solar-atlas/' }, null, 2),
);
console.log('Solar atlas site ready: dist/');