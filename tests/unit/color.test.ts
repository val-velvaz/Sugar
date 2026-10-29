import { test } from 'node:test';
import assert from 'node:assert/strict';
import { contrastRatio, flatten, mix, parseHex, withAlpha } from '../../src/design/color';

test('contraste negro/blanco es 21:1', () => {
  assert.equal(Number(contrastRatio('#000000', '#FFFFFF').toFixed(2)), 21);
});

test('el contraste es simétrico', () => {
  assert.equal(contrastRatio('#FF99C9', '#414040'), contrastRatio('#414040', '#FF99C9'));
});

test('withAlpha produce #RRGGBBAA y flatten lo compone', () => {
  assert.equal(withAlpha('#FFFFFF', 0.5), '#FFFFFF80');
  assert.equal(flatten('#FFFFFF80', '#000000'), '#808080');
});

test('mix interpola en sRGB', () => {
  assert.equal(mix('#000000', '#FFFFFF', 0.5), '#808080');
});

test('parseHex rechaza valores inválidos', () => {
  assert.throws(() => parseHex('rosa'));
  assert.throws(() => parseHex('#FFF'));
});
