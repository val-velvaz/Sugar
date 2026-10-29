/** Genera themes/*.json, tokens.json y la sección contributes.themes de package.json. */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { designTokens, themes } from '../src/design/tokens';
import { buildTheme, themeFileName } from '../src/design/theme-builder';

const root = resolve(__dirname, '..');
const themesDir = join(root, 'themes');
mkdirSync(themesDir, { recursive: true });

const json = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;

for (const spec of themes) {
  writeFileSync(join(themesDir, themeFileName(spec)), json(buildTheme(spec)));
  console.log(`✦ themes/${themeFileName(spec)}`);
}

writeFileSync(join(root, 'tokens.json'), json(designTokens));
console.log('✦ tokens.json');

const pkgPath = join(root, 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
pkg.contributes.themes = themes.map((spec) => ({
  id: spec.label,
  label: spec.label,
  uiTheme: spec.kind === 'dark' ? 'vs-dark' : 'vs',
  path: `./themes/${themeFileName(spec)}`,
}));
writeFileSync(pkgPath, json(pkg));
console.log('✦ package.json (contributes.themes)');
