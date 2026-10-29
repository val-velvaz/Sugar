import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { allIconFiles, buildIconTheme } from '../../src/design/file-icons';

const root = join(__dirname, '..', '..');
const theme = buildIconTheme();

/** Verifica que las etiquetas estén balanceadas (sin depender de un parser XML). */
function wellFormed(svg: string): boolean {
  const stack: string[] = [];
  for (const m of svg.matchAll(/<(\/?)([a-zA-Z]+)\b[^>]*?(\/?)>/g)) {
    const [, closing, name, selfClosing] = m;
    if (selfClosing) continue;
    if (closing) {
      if (stack.pop() !== name) return false;
    } else stack.push(name as string);
  }
  return stack.length === 0;
}

test('los SVG son válidos, originales y de 32×32', () => {
  for (const [path, svg] of allIconFiles()) {
    assert.ok(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">'), path);
    assert.ok(wellFormed(svg), `${path} mal formado`);
    assert.ok(!/<image|href=|<script/i.test(svg), `${path} no debe incrustar recursos`);
  }
});

test('los SVG generados en disco están al día', () => {
  for (const [path, svg] of allIconFiles()) {
    assert.equal(readFileSync(join(root, path), 'utf8'), svg, path);
  }
  const onDisk = JSON.parse(
    readFileSync(join(root, 'themes/sugar-collage-icon-theme.json'), 'utf8'),
  );
  assert.deepEqual(onDisk, theme);
});

test('cada iconPath apunta a un archivo existente', () => {
  for (const [id, def] of Object.entries(theme.iconDefinitions)) {
    assert.ok(existsSync(resolve(root, 'themes', def.iconPath)), `${id}: ${def.iconPath}`);
  }
});

test('todas las asociaciones (dark y light) usan íconos definidos', () => {
  for (const set of [theme, theme.light]) {
    const ids = [
      set.file,
      set.folder,
      set.folderExpanded,
      ...Object.values(set.fileExtensions),
      ...Object.values(set.fileNames),
      ...Object.values(set.languageIds),
      ...Object.values(set.folderNames),
      ...Object.values(set.folderNamesExpanded),
    ];
    for (const id of ids) assert.ok(theme.iconDefinitions[id], `falta ${id}`);
  }
  assert.ok(Object.values(theme.light.fileExtensions).every((id) => id.endsWith('_light')));
});

test('cubre las extensiones, nombres y carpetas pedidos', () => {
  for (const ext of [
    'c',
    'h',
    'cpp',
    'asm',
    's',
    'py',
    'ts',
    'js',
    'json',
    'md',
    'sql',
    'html',
    'css',
    'rs',
    'java',
    'ipynb',
    'yml',
    'env',
    'png',
    'jpg',
    'svg',
  ]) {
    assert.ok(theme.fileExtensions[ext], `extensión .${ext}`);
  }
  for (const name of [
    '.gitignore',
    'makefile',
    'dockerfile',
    'package.json',
    'readme.md',
    '.env',
  ]) {
    assert.ok(theme.fileNames[name], `archivo ${name}`);
  }
  for (const dir of ['src', 'test', 'docs', 'assets', '.vscode', 'node_modules', '.git']) {
    assert.ok(theme.folderNames[dir] && theme.folderNamesExpanded[dir], `carpeta ${dir}`);
  }
  assert.notEqual(theme.folder, theme.folderExpanded);
});

test('las variantes light y dark son distintas', () => {
  const files = allIconFiles();
  assert.notEqual(files.get('media/icons/dark/c.svg'), files.get('media/icons/light/c.svg'));
});

test('package.json declara el icon theme', () => {
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  assert.equal(pkg.contributes.iconThemes[0].path, './themes/sugar-collage-icon-theme.json');
});
