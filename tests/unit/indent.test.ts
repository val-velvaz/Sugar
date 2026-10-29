import { test } from 'node:test';
import assert from 'node:assert/strict';
import { indentSegments, rainbowColors } from '../../src/features/indent/levels';

test('espacios: un nivel por cada tabSize', () => {
  assert.deepEqual(indentSegments('        x', 4), [
    { level: 0, start: 0, end: 4 },
    { level: 1, start: 4, end: 8 },
  ]);
});

test('resto de espacios cuenta como nivel parcial', () => {
  assert.deepEqual(
    indentSegments('      x', 4).map((s) => [s.start, s.end]),
    [
      [0, 4],
      [4, 6],
    ],
  );
});

test('tabuladores y mezcla', () => {
  assert.deepEqual(
    indentSegments('\t\tx', 4).map((s) => [s.start, s.end]),
    [
      [0, 1],
      [1, 2],
    ],
  );
  assert.deepEqual(
    indentSegments('  \tx', 4).map((s) => [s.start, s.end]),
    [
      [0, 2],
      [2, 3],
    ],
  );
});

test('líneas sin indentación o vacías no tienen segmentos', () => {
  assert.deepEqual(indentSegments('x = 1', 4), []);
  assert.deepEqual(indentSegments('', 4), []);
});

test('rainbowColors: 6 colores con la opacidad pedida', () => {
  const colors = rainbowColors('light', 'viva', 0.5);
  assert.equal(colors.length, 6);
  assert.ok(colors.every((c) => c.endsWith('80')));
  assert.notDeepEqual(rainbowColors('dark', 'suave', 0.5), rainbowColors('dark', 'viva', 0.5));
});
