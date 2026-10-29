/** Genera media/icons/{dark,light}/*.svg, el icon theme y contributes.iconThemes. */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { allIconFiles, buildIconTheme, ICON_DIR } from '../src/design/file-icons';

const root = resolve(__dirname, '..');
const json = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;

rmSync(join(root, ICON_DIR), { recursive: true, force: true });
const files = allIconFiles();
for (const [path, content] of files) {
  mkdirSync(dirname(join(root, path)), { recursive: true });
  writeFileSync(join(root, path), content);
}
console.log(`✦ ${files.size} SVG en ${ICON_DIR}/`);

const themePath = 'themes/sugar-collage-icon-theme.json';
writeFileSync(join(root, themePath), json(buildIconTheme()));
console.log(`✦ ${themePath}`);

const pkgPath = join(root, 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
pkg.contributes.iconThemes = [
  { id: 'sugar-collage-icons', label: 'Sugar Collage Icons', path: `./${themePath}` },
];
writeFileSync(pkgPath, json(pkg));
console.log('✦ package.json (contributes.iconThemes)');
