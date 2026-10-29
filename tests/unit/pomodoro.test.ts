import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  addCookie,
  dayKey,
  lastDays,
  pick,
  prune,
  SWEET_MESSAGES,
} from '../../src/features/pomodoro/stats';
import {
  DEFAULT_DURATIONS,
  formatClock,
  INITIAL_STATE,
  pause,
  remaining,
  reset,
  start,
  tick,
  type TimerState,
} from '../../src/features/pomodoro/timer';

const d = DEFAULT_DURATIONS;
const MIN = 60_000;

test('empezar, pausar y reanudar conservan el tiempo restante', () => {
  let s = start(INITIAL_STATE, 0, d);
  assert.equal(s.status, 'running');
  assert.equal(remaining(s, 10 * MIN, d), 15 * MIN);
  s = pause(s, 10 * MIN, d);
  assert.equal(s.status, 'paused');
  assert.equal(remaining(s, 99 * MIN, d), 15 * MIN, 'en pausa el tiempo no corre');
  s = start(s, 100 * MIN, d);
  assert.equal(remaining(s, 105 * MIN, d), 10 * MIN);
});

test('reiniciar vuelve a la duración completa de la fase', () => {
  const s = reset(pause(start(INITIAL_STATE, 0, d), 5 * MIN, d));
  assert.equal(s.status, 'idle');
  assert.equal(remaining(s, 0, d), 25 * MIN);
});

test('al terminar el trabajo pasa a descanso y avisa', () => {
  const s = start(INITIAL_STATE, 0, d);
  assert.equal(tick(s, 24 * MIN, d).finished, undefined);
  const r = tick(s, 25 * MIN, d);
  assert.equal(r.finished, 'trabajo');
  assert.equal(r.state.phase, 'descanso');
  assert.equal(r.state.status, 'idle');
  assert.equal(r.state.completedWork, 1);
});

test('cada 4 rondas toca descanso largo y luego el ciclo se reinicia', () => {
  let s: TimerState = { ...INITIAL_STATE, completedWork: 3 };
  s = tick(start(s, 0, d), 25 * MIN, d).state;
  assert.equal(s.phase, 'descansoLargo');
  assert.equal(remaining(s, 0, d), 15 * MIN);
  s = tick(start(s, 0, d), 15 * MIN, d).state;
  assert.equal(s.phase, 'trabajo');
  assert.equal(s.completedWork, 0);
});

test('autoStart encadena la siguiente fase corriendo', () => {
  const r = tick(start(INITIAL_STATE, 0, d), 25 * MIN, d, true);
  assert.equal(r.state.status, 'running');
  assert.equal(remaining(r.state, 26 * MIN, d), 4 * MIN);
});

test('formatClock', () => {
  assert.equal(formatClock(25 * MIN), '25:00');
  assert.equal(formatClock(61_000), '01:01');
  assert.equal(
    formatClock(500),
    '00:01',
    'redondea hacia arriba: nunca muestra 00:00 antes de tiempo',
  );
  assert.equal(formatClock(90 * MIN), '1:30:00');
});

test('galletas por día y semana con iniciales en español', () => {
  const now = new Date(2026, 9, 29, 15, 0); // jueves 29 de octubre de 2026
  let h = addCookie({}, now);
  h = addCookie(h, now);
  h = addCookie(h, new Date(2026, 9, 26));
  const week = lastDays(h, now);
  assert.equal(week.length, 7);
  assert.deepEqual(
    week.map((x) => x.label),
    ['V', 'S', 'D', 'L', 'M', 'X', 'J'],
  );
  assert.equal(week.at(-1)?.count, 2);
  assert.equal(week.at(-1)?.today, true);
  assert.equal(week.find((x) => x.key === '2026-10-26')?.count, 1);
  assert.equal(dayKey(now), '2026-10-29');
});

test('prune descarta días viejos', () => {
  const now = new Date(2026, 9, 29);
  const pruned = prune({ '2025-01-01': 4, '2026-10-28': 2 }, now, 30);
  assert.deepEqual(pruned, { '2026-10-28': 2 });
});

test('los mensajes dulces se eligen de la lista', () => {
  assert.ok(SWEET_MESSAGES.includes(pick(SWEET_MESSAGES, () => 0.99)));
  assert.equal(
    pick(SWEET_MESSAGES, () => 0),
    SWEET_MESSAGES[0],
  );
});
