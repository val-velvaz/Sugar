/** Copia los .woff2 (OFL) desde @fontsource a media/fonts/, junto con sus licencias. */
import { copyFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { FONT_DIR, fontFaces } from '../src/design/fonts';

const root = resolve(__dirname, '..');
const out = join(root, FONT_DIR);
mkdirSync(out, { recursive: true });

for (const f of fontFaces) {
  copyFileSync(join(root, 'node_modules/@fontsource', f.pkg, 'files', f.file), join(out, f.file));
}
for (const pkg of new Set(fontFaces.map((f) => f.pkg))) {
  copyFileSync(join(root, 'node_modules/@fontsource', pkg, 'LICENSE'), join(out, `OFL-${pkg}.txt`));
}
console.log(`✦ ${fontFaces.length} fuentes en ${FONT_DIR}/`);
