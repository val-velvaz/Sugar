import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isDaytime, msUntilNextSwitch, parseClock } from '../../src/features/theme/schedule';

const at = (h: number, m = 0) => new Date(2026, 9, 29, h, m, 0, 0);
const schedule = { dayStart: '07:00', nightStart: '19:30' };

test('parseClock acepta HH:MM y rechaza lo demás', () => {
  assert.equal(parseClock('07:30'), 450);
  assert.equal(parseClock('7:05'), 425);
  assert.throws(() => parseClock('25:00'));
  assert.throws(() => parseClock('siete'));
});

test('día y noche con horario normal', () => {
  assert.equal(isDaytime(at(6, 59), schedule), false);
  assert.equal(isDaytime(at(7), schedule), true);
  assert.equal(isDaytime(at(19, 29), schedule), true);
  assert.equal(isDaytime(at(19, 30), schedule), false);
});

test('horario que cruza la medianoche', () => {
  const owl = { dayStart: '20:00', nightStart: '04:00' };
  assert.equal(isDaytime(at(23), owl), true);
  assert.equal(isDaytime(at(3, 59), owl), true);
  assert.equal(isDaytime(at(12), owl), false);
});

test('tiempo hasta el próximo cambio', () => {
  assert.equal(msUntilNextSwitch(at(6, 0), schedule), 60 * 60_000);
  assert.equal(msUntilNextSwitch(at(19, 0), schedule), 30 * 60_000);
  assert.equal(msUntilNextSwitch(at(23, 0), schedule), 8 * 60 * 60_000);
});
