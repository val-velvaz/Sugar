/** Genera media/icons/{dark,light}/*.svg, media/decorations/*.svg, el icon theme y contributes.iconThemes. */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { ACTIVITY_ICON, activityIcon } from '../src/design/brand-icons';
import { allDecorationIcons, DECORATION_DIR } from '../src/design/decoration-icons';
import { allIconFiles, buildIconTheme, ICON_DIR } from '../src/design/file-icons';

const root = resolve(__dirname, '..');
const json = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;

rmSync(join(root, ICON_DIR), { recursive: true, force: true });
rmSync(join(root, DECORATION_DIR), { recursive: true, force: true });
const files = new Map([
  ...allIconFiles(),
  ...allDecorationIcons(),
  [ACTIVITY_ICON, activityIcon()],
]);
for (const [path, content] of files) {
  mkdirSync(dirname(join(root, path)), { recursive: true });
  writeFileSync(join(root, path), content);
}
console.log(`✦ ${files.size} SVG en ${ICON_DIR}/, ${DECORATION_DIR}/ y ${ACTIVITY_ICON}`);

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
