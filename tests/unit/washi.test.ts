import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { allDecorationIcons } from '../../src/design/decoration-icons';
import { washiTags } from '../../src/design/tokens';
import {
  commentMarkers,
  findTagInLine,
  findTags,
  languageForPath,
} from '../../src/features/washi/tags';

const tagOf = (line: string, lang: string) => findTagInLine(line, 0, lang)?.tag;

test('detecta las 6 etiquetas en comentarios de distintos lenguajes', () => {
  assert.equal(tagOf('int x; // TODO: crecer el buffer', 'c'), 'TODO');
  assert.equal(tagOf(' * FIXME(vale) arreglar */', 'cpp'), 'FIXME');
  assert.equal(tagOf('SELECT 1; -- NOTE índice', 'sql'), 'NOTE');
  assert.equal(tagOf('mov rax, 1 ; HACK temporal', 'nasm'), 'HACK');
  assert.equal(tagOf('x = 1  # IDEA: caché', 'python'), 'IDEA');
  assert.equal(tagOf('# ? por qué funciona', 'python'), '?');
  assert.equal(tagOf('<!-- TODO: menú -->', 'html'), 'TODO');
});

test('ignora código que no es comentario y palabras parecidas', () => {
  assert.equal(tagOf('x = a ? b : c;', 'c'), undefined);
  assert.equal(tagOf('#include <TODO.h>', 'c'), undefined);
  assert.equal(tagOf('const TODO = 1;', 'typescript'), undefined);
  assert.equal(tagOf('// TODOS los días', 'typescript'), undefined);
  assert.equal(tagOf('i-- ; x', 'javascript'), undefined);
  assert.equal(tagOf('// todo en minúsculas', 'javascript'), undefined);
});

test('el rango termina antes del cierre de bloque y el texto queda limpio', () => {
  const line = '/* TODO(vale): revisar */ int x;';
  const m = findTagInLine(line, 3, 'c');
  assert.ok(m);
  assert.equal(m.line, 3);
  assert.equal(line.slice(m.tagStart, m.tagEnd), 'TODO');
  assert.equal(line.slice(m.tagStart, m.end), 'TODO(vale): revisar');
  assert.equal(m.text, 'revisar');
});

test('findTags respeta las etiquetas habilitadas y numera líneas', () => {
  const src = '// TODO a\nint x;\r\n// FIXME b\n// IDEA c';
  assert.deepEqual(
    findTags(src, 'c').map((m) => [m.tag, m.line]),
    [
      ['TODO', 0],
      ['FIXME', 2],
      ['IDEA', 3],
    ],
  );
  assert.deepEqual(
    findTags(src, 'c', ['FIXME']).map((m) => m.tag),
    ['FIXME'],
  );
});

test('lenguajes desconocidos usan marcadores genéricos', () => {
  assert.ok(commentMarkers('no-existe').includes('//'));
  assert.equal(tagOf('; TODO algo', 'no-existe'), 'TODO');
});

test('languageForPath reconoce extensiones y nombres especiales', () => {
  assert.equal(languageForPath('src/main.c'), 'c');
  assert.equal(languageForPath('C:\\proj\\boot.ASM'), 'asm');
  assert.equal(languageForPath('db/query.sql'), 'sql');
  assert.equal(languageForPath('Makefile'), 'makefile');
  assert.equal(languageForPath('.env.local'), 'dotenv');
  assert.equal(languageForPath('foto.png'), undefined);
});

test('hay un ícono de gutter por etiqueta y está generado en disco', () => {
  const icons = allDecorationIcons();
  assert.equal(icons.size, washiTags.length);
  const root = join(__dirname, '..', '..');
  for (const [path, svg] of icons) {
    assert.equal(readFileSync(join(root, path), 'utf8'), svg, path);
    assert.ok(!/<image|href=|<script/i.test(svg), path);
  }
});
