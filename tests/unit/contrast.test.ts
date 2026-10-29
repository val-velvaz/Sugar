import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkAll, checkTheme, MIN_TEXT } from '../../src/design/contrast';
import { syntaxRoles, themes, type ThemeSpec } from '../../src/design/tokens';

test('todos los temas cumplen el contraste WCAG', () => {
  const failures = checkAll(themes).filter((r) => !r.pass);
  assert.deepEqual(failures, []);
});

test('cada rol de sintaxis se verifica como texto (≥ 4.5)', () => {
  const results = checkTheme(themes[0] as ThemeSpec);
  for (const role of syntaxRoles) {
    const r = results.find((x) => x.check === `sintaxis.${role}`);
    assert.ok(r, `falta el chequeo de ${role}`);
    assert.equal(r.min, MIN_TEXT);
  }
});

test('el chequeo detecta un pastel puro sobre fondo claro', () => {
  const base = themes.find((t) => t.kind === 'light') as ThemeSpec;
  const broken: ThemeSpec = { ...base, syntax: { ...base.syntax, string: '#D7FBCB' } };
  const r = checkTheme(broken).find((x) => x.check === 'sintaxis.string');
  assert.equal(r?.pass, false);
});
