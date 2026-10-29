import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSemanticTokenColors, buildTheme, scopeRules } from '../../src/design/theme-builder';
import { themes, type ThemeSpec } from '../../src/design/tokens';

test('ningún scope TextMate aparece en dos reglas', () => {
  const seen = new Map<string, string>();
  const dupes: string[] = [];
  for (const rule of scopeRules) {
    for (const scope of rule.scope) {
      const prev = seen.get(scope);
      if (prev) dupes.push(`${scope} (${prev} / ${rule.name})`);
      seen.set(scope, rule.name);
    }
  }
  assert.deepEqual(dupes, []);
});

test('ensamblador distingue registros, instrucciones, directivas y etiquetas', () => {
  for (const spec of themes) {
    const { register, instruction, directive, label } = spec.syntax;
    assert.equal(new Set([register, instruction, directive, label]).size, 4, spec.label);
  }
  for (const role of ['register', 'instruction', 'directive', 'label'] as const) {
    assert.ok(
      scopeRules.some((r) => r.role === role),
      `sin reglas para ${role}`,
    );
  }
});

test('tipos y macros no comparten color', () => {
  for (const spec of themes) assert.notEqual(spec.syntax.type, spec.syntax.macro, spec.label);
});

test('semanticTokenColors cubre C/C++, Rust, Python, Java, TS/JS y SQL', () => {
  const keys = Object.keys(buildSemanticTokenColors(themes[0] as ThemeSpec));
  for (const lang of ['c', 'cpp', 'rust', 'python', 'java', 'sql']) {
    assert.ok(
      keys.some((k) => k.endsWith(`:${lang}`)),
      `faltan tokens para ${lang}`,
    );
  }
  for (const k of ['function', 'type', 'variable.readonly', 'parameter', 'macro', 'label']) {
    assert.ok(keys.includes(k), `falta ${k}`);
  }
});

test('hay reglas para Markdown, JSON, YAML, CSS, logs y SQL', () => {
  const scopes = scopeRules.flatMap((r) => r.scope);
  for (const s of [
    'markup.heading',
    'support.type.property-name.json',
    'entity.name.tag.yaml',
    'support.type.property-name.css',
    'log.error',
    'token.error-token',
    'support.function.aggregate.sql',
  ]) {
    assert.ok(scopes.includes(s), `falta ${s}`);
  }
});

for (const spec of themes) {
  test(`${spec.label}: debug, testing, merge, notebooks y charts`, () => {
    const c = buildTheme(spec).colors;
    for (const k of [
      'debugToolBar.background',
      'debugIcon.breakpointForeground',
      'testing.iconPassed',
      'testing.iconFailed',
      'merge.currentHeaderBackground',
      'merge.incomingContentBackground',
      'notebook.cellEditorBackground',
      'notebook.outputContainerBackgroundColor',
      'charts.red',
      'charts.purple',
      'symbolIcon.functionForeground',
      'keybindingLabel.background',
      'settings.modifiedItemIndicator',
    ]) {
      assert.ok(c[k], `falta ${k}`);
    }
  });
}
