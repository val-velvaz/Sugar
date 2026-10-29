import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { themes } from '../../src/design/tokens';

const root = join(__dirname, '..', '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? sources(p) : p.endsWith('.ts') ? [p] : [];
  });
}

test('cada comando registrado está declarado en package.json (y viceversa)', () => {
  const registered = new Set(
    sources(join(root, 'src')).flatMap((f) =>
      [...readFileSync(f, 'utf8').matchAll(/registerCommand\(\s*'([^']+)'/g)].map((m) => m[1]),
    ),
  );
  const declared = new Set(pkg.contributes.commands.map((c: { command: string }) => c.command));
  assert.deepEqual([...registered].sort(), [...declared].sort());
});

test('los comandos tienen categoría Sugar Collage', () => {
  for (const c of pkg.contributes.commands) assert.equal(c.category, 'Sugar Collage');
});

test('la configuración está documentada', () => {
  for (const section of pkg.contributes.configuration) {
    for (const [key, prop] of Object.entries<Record<string, unknown>>(section.properties)) {
      assert.ok(prop.description || prop.markdownDescription, `${key} sin descripción`);
    }
  }
});

test('los temas del modo automático existen', () => {
  const props = pkg.contributes.configuration.flatMap((s: { properties: object }) =>
    Object.entries(s.properties),
  );
  const auto = Object.fromEntries(props);
  assert.deepEqual(
    auto['sugarCollage.autoTheme.lightTheme'].enum,
    themes.filter((t) => t.kind === 'light').map((t) => t.label),
  );
  assert.deepEqual(
    auto['sugarCollage.autoTheme.darkTheme'].enum,
    themes.filter((t) => t.kind === 'dark').map((t) => t.label),
  );
});

test('activación perezosa', () => {
  assert.deepEqual(pkg.activationEvents, ['onStartupFinished']);
});
