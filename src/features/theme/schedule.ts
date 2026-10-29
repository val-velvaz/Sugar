/** Cálculo del tema según la hora del día (sin dependencias de vscode). */

/** Convierte "HH:MM" en minutos desde medianoche; lanza error si el formato no es válido. */
export function parseClock(value: string): number {
  const m = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(value.trim());
  if (!m) throw new Error(`Hora inválida: "${value}" (usa HH:MM, por ejemplo 07:30)`);
  return Number(m[1]) * 60 + Number(m[2]);
}

export interface DaySchedule {
  dayStart: string;
  nightStart: string;
}

const minutesOf = (d: Date) => d.getHours() * 60 + d.getMinutes();

/** ¿Es de día? Soporta horarios que cruzan la medianoche (p. ej. día 20:00–04:00). */
export function isDaytime(now: Date, { dayStart, nightStart }: DaySchedule): boolean {
  const t = minutesOf(now);
  const day = parseClock(dayStart);
  const night = parseClock(nightStart);
  if (day === night) return true;
  return day < night ? t >= day && t < night : t >= day || t < night;
}

/** Milisegundos hasta el próximo cambio de día a noche o viceversa (mínimo 1 s). */
export function msUntilNextSwitch(now: Date, { dayStart, nightStart }: DaySchedule): number {
  const t = minutesOf(now) * 60_000 + now.getSeconds() * 1000 + now.getMilliseconds();
  const dayMinute = 24 * 60 * 60_000;
  const until = (clock: string) => {
    const target = parseClock(clock) * 60_000;
    const diff = target - t;
    return diff > 0 ? diff : diff + dayMinute;
  };
  return Math.max(1000, Math.min(until(dayStart), until(nightStart)));
}
