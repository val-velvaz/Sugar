import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { isHex } from '../../src/design/color';
import { buildTheme, scopeRules, themeFileName } from '../../src/design/theme-builder';
import { designTokens, themes } from '../../src/design/tokens';

const root = join(__dirname, '..', '..');

test('hay 6 temas con ids únicos', () => {
  assert.equal(themes.length, 6);
  assert.equal(new Set(themes.map((t) => t.id)).size, 6);
});

for (const spec of themes) {
  test(`${spec.label}: colores válidos y completos`, () => {
    const theme = buildTheme(spec);
    for (const [key, value] of Object.entries(theme.colors)) {
      assert.ok(isHex(value), `${key} = ${value}`);
    }
    for (const key of [
      'editor.background',
      'sideBar.background',
      'activityBar.background',
      'statusBar.background',
      'tab.activeBackground',
      'tab.inactiveBackground',
      'tab.activeModifiedBorder',
      'breadcrumb.foreground',
      'minimap.background',
      'scrollbarSlider.background',
      'peekView.border',
      'diffEditor.insertedTextBackground',
      'notifications.background',
      'quickInput.background',
      'menu.background',
      'button.background',
      'input.background',
      'badge.background',
      'gitDecoration.addedResourceForeground',
      'editorSuggestWidget.background',
      'editorHoverWidget.background',
      'editor.selectionBackground',
      'editor.findMatchBackground',
    ]) {
      assert.ok(theme.colors[key], `falta ${key}`);
    }
    const ansi = Object.keys(theme.colors).filter((k) => k.startsWith('terminal.ansi'));
    assert.equal(ansi.length, 16);
    const brackets = Object.keys(theme.colors).filter((k) =>
      /^editorBracketHighlight\.foreground\d$/.test(k),
    );
    assert.equal(brackets.length, 6);
  });

  test(`${spec.label}: el archivo generado está al día`, () => {
    const onDisk = JSON.parse(readFileSync(join(root, 'themes', themeFileName(spec)), 'utf8'));
    assert.deepEqual(onDisk, JSON.parse(JSON.stringify(buildTheme(spec))));
  });
}

test('el mapeo de scopes es el mismo en todos los temas', () => {
  const shapes = themes.map((t) => buildTheme(t).tokenColors.map((c) => c.scope.join(',')));
  for (const s of shapes) assert.deepEqual(s, shapes[0]);
});

test('los comentarios van en itálica', () => {
  const rule = scopeRules.find((r) => r.role === 'comment');
  assert.equal(rule?.fontStyle, 'italic');
});

test('tokens.json está sincronizado con tokens.ts', () => {
  const onDisk = JSON.parse(readFileSync(join(root, 'tokens.json'), 'utf8'));
  assert.deepEqual(onDisk, JSON.parse(JSON.stringify(designTokens)));
});

test('package.json declara los 6 temas', () => {
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  assert.equal(pkg.contributes.themes.length, 6);
});
