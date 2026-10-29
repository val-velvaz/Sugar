/** Máquina de estados del Pomodoro "Galletita" (sin dependencias de vscode). */

export type Phase = 'trabajo' | 'descanso' | 'descansoLargo';
export type Status = 'idle' | 'running' | 'paused';

export interface Durations {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  /** Cada cuántas rondas de trabajo toca descanso largo. */
  longBreakEvery: number;
}

export const DEFAULT_DURATIONS: Durations = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakEvery: 4,
};

/** Estado serializable (se guarda en globalState para sobrevivir a una recarga de ventana). */
export interface TimerState {
  phase: Phase;
  status: Status;
  /** Fin previsto, en ms epoch (solo si status = running). */
  endsAt?: number;
  /** Lo que quedaba al pausar (solo si status = paused). */
  remainingMs?: number;
  /** Rondas de trabajo completadas en el ciclo actual. */
  completedWork: number;
}

export const INITIAL_STATE: TimerState = { phase: 'trabajo', status: 'idle', completedWork: 0 };

export function phaseMs(phase: Phase, d: Durations): number {
  const minutes =
    phase === 'trabajo'
      ? d.workMinutes
      : phase === 'descanso'
        ? d.shortBreakMinutes
        : d.longBreakMinutes;
  return Math.max(1, minutes) * 60_000;
}

export function remaining(s: TimerState, now: number, d: Durations): number {
  if (s.status === 'running' && s.endsAt !== undefined) return Math.max(0, s.endsAt - now);
  if (s.status === 'paused' && s.remainingMs !== undefined) return s.remainingMs;
  return phaseMs(s.phase, d);
}

export function start(s: TimerState, now: number, d: Durations): TimerState {
  if (s.status === 'running') return s;
  return {
    phase: s.phase,
    status: 'running',
    endsAt: now + remaining(s, now, d),
    completedWork: s.completedWork,
  };
}

export function pause(s: TimerState, now: number, d: Durations): TimerState {
  if (s.status !== 'running') return s;
  return {
    phase: s.phase,
    status: 'paused',
    remainingMs: remaining(s, now, d),
    completedWork: s.completedWork,
  };
}

/** Reinicia la fase actual a su duración completa, sin correr. */
export function reset(s: TimerState): TimerState {
  return { phase: s.phase, status: 'idle', completedWork: s.completedWork };
}

/** Siguiente fase después de terminar `s.phase`. */
export function nextPhase(s: TimerState, d: Durations): { phase: Phase; completedWork: number } {
  if (s.phase !== 'trabajo')
    return { phase: 'trabajo', completedWork: s.phase === 'descansoLargo' ? 0 : s.completedWork };
  const done = s.completedWork + 1;
  return {
    phase: done % Math.max(1, d.longBreakEvery) === 0 ? 'descansoLargo' : 'descanso',
    completedWork: done,
  };
}

export interface TickResult {
  state: TimerState;
  /** Fase que acaba de terminar, si terminó en este tick. */
  finished?: Phase;
}

/** Avanza el reloj: si la fase terminó, pasa a la siguiente (detenida, o corriendo si `autoStart`). */
export function tick(s: TimerState, now: number, d: Durations, autoStart = false): TickResult {
  if (s.status !== 'running' || remaining(s, now, d) > 0) return { state: s };
  const next = nextPhase(s, d);
  const idle: TimerState = { phase: next.phase, status: 'idle', completedWork: next.completedWork };
  return { state: autoStart ? start(idle, now, d) : idle, finished: s.phase };
}

/** "mm:ss" (o "h:mm:ss" si pasa de una hora). */
export function formatClock(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export const PHASE_LABEL: Record<Phase, string> = {
  trabajo: 'Horneando',
  descanso: 'Descanso corto',
  descansoLargo: 'Descanso largo',
};
