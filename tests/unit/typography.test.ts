import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fontDirectories, isFontInstalled } from '../../src/features/typography/font-detect';
import {
  computeChanges,
  describeChange,
  recommendedSettings,
  renderSettings,
  TYPOGRAPHY_KEYS,
  type TypographySettings,
} from '../../src/features/typography/recommended';

const empty = Object.fromEntries(TYPOGRAPHY_KEYS.map((k) => [k, undefined])) as TypographySettings;

test('la recomendación usa Fira Code con ligaduras calt y liga', () => {
  const r = recommendedSettings();
  assert.match(String(r['editor.fontFamily']), /^'Fira Code'/);
  assert.match(String(r['terminal.integrated.fontFamily']), /^'Fira Code'/);
  assert.equal(r['editor.fontLigatures'], "'calt', 'liga'");
  assert.equal(
    recommendedSettings({ fontSize: 16, lineHeight: 1.5, letterSpacing: 0 })['editor.fontSize'],
    16,
  );
});

test('computeChanges solo lista lo que cambia', () => {
  const next = recommendedSettings();
  assert.equal(computeChanges(empty, next).length, TYPOGRAPHY_KEYS.length);
  assert.deepEqual(computeChanges(next, next), []);
  const partial = { ...next, 'editor.fontSize': 12 };
  assert.deepEqual(computeChanges(partial, next), [{ key: 'editor.fontSize', from: 12, to: 14 }]);
});

test('restaurar a "sin valor" elimina la clave (undefined)', () => {
  const changes = computeChanges(recommendedSettings(), empty);
  assert.ok(changes.every((c) => c.to === undefined));
  const [first] = changes;
  assert.ok(first);
  assert.match(describeChange(first), /→ \(por defecto\)$/);
});

test('renderSettings genera un JSONC legible para el diff', () => {
  const text = renderSettings({ ...empty, 'editor.fontSize': 14 }, 'Prueba');
  assert.match(text, /^\/\/ Prueba/);
  assert.match(text, /"editor\.fontSize": 14,/);
  assert.match(text, /\/\/ "editor\.fontFamily": \(valor por defecto/);
});

test('detecta Fira Code en carpetas de fuentes (también en subcarpetas)', () => {
  const dir = mkdtempSync(join(tmpdir(), 'sugar-fonts-'));
  try {
    assert.equal(isFontInstalled([dir]), false);
    mkdirSync(join(dir, 'truetype', 'firacode'), { recursive: true });
    writeFileSync(join(dir, 'truetype', 'firacode', 'FiraCode-Regular.ttf'), '');
    assert.equal(isFontInstalled([dir]), true);
    assert.equal(isFontInstalled([join(dir, 'no-existe')]), false);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('carpetas de fuentes por plataforma', () => {
  const win = fontDirectories(
    'win32',
    { WINDIR: 'C:\\Windows', LOCALAPPDATA: 'C:\\Local' },
    'C:\\U',
  );
  assert.equal(win.length, 2);
  assert.ok(win.every((d) => d.endsWith('Fonts')));
  assert.ok(win[1]?.startsWith('C:\\Local'));
  assert.ok(fontDirectories('darwin', {}, '/Users/v').includes('/Library/Fonts'));
  assert.ok(fontDirectories('linux', {}, '/home/v').includes('/usr/share/fonts'));
});
