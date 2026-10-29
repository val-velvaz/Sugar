/** Contador de "galletas ganadas" por día y mensajes dulces (sin dependencias de vscode). */

/** Historial: fecha local "AAAA-MM-DD" → galletas ganadas ese día. */
export type CookieHistory = Record<string, number>;

export interface CookieDay {
  key: string;
  /** Inicial del día de la semana en español (L, M, X, J, V, S, D). */
  label: string;
  count: number;
  today: boolean;
}

const pad = (n: number) => String(n).padStart(2, '0');

export function dayKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

const WEEKDAY = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

export function addCookie(history: CookieHistory, date: Date): CookieHistory {
  const key = dayKey(date);
  return { ...history, [key]: (history[key] ?? 0) + 1 };
}

/** Últimos `days` días, del más antiguo a hoy. */
export function lastDays(history: CookieHistory, now: Date, days = 7): CookieDay[] {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1 - i));
    const key = dayKey(d);
    return {
      key,
      label: WEEKDAY[d.getDay()] ?? '',
      count: history[key] ?? 0,
      today: i === days - 1,
    };
  });
}

/** Conserva solo los últimos `keepDays` días para que globalState no crezca sin fin. */
export function prune(history: CookieHistory, now: Date, keepDays = 120): CookieHistory {
  const limit = dayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - keepDays));
  return Object.fromEntries(Object.entries(history).filter(([k]) => k >= limit));
}

export const SWEET_MESSAGES = [
  '¡Galleta recién horneada! Te la ganaste.',
  'Otra galletita al frasco. Qué dulce constancia.',
  'Ronda terminada: huele a mantequilla y a progreso.',
  'Tu código y tú merecen una pausa con chispas de chocolate.',
  'Cada ronda es una capa más del pastel. ✦',
  '¡Ding! El horno dice que eres increíble.',
  'Pausa de azúcar: estira los brazos y toma agua.',
  'Ronda dulce completada. Las estrellas lo notaron ✦',
  'Una galleta más para la colección. Sigue así, sin prisa.',
  'Trabajo hecho con cariño: se nota en cada línea.',
] as const;

export const BREAK_OVER_MESSAGES = [
  'Se acabó el descanso. ¿Horneamos otra?',
  'Ya hay masa lista para la siguiente ronda.',
  'Descanso terminado. Vuelve cuando quieras ✦',
] as const;

export function pick<T>(list: readonly T[], random: () => number = Math.random): T {
  return list[Math.floor(random() * list.length) % list.length] as T;
}
