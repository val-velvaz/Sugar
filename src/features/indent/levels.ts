/** Segmentos de indentación de una línea (sin dependencias de vscode). */
import { mix, withAlpha, type Hex } from '../../design/color';
import { rainbow } from '../../design/tokens';

export interface Segment {
  level: number;
  start: number;
  end: number;
}

/**
 * Divide el espacio inicial en niveles: cada tabulador es un nivel y los espacios
 * se agrupan de `tabSize` en `tabSize`. Un resto de espacios cuenta como nivel parcial.
 */
export function indentSegments(lineText: string, tabSize: number): Segment[] {
  const size = Math.max(1, tabSize);
  const out: Segment[] = [];
  let start = 0;
  let width = 0;
  let i = 0;
  for (; i < lineText.length; i++) {
    const ch = lineText[i];
    if (ch === '\t') {
      if (i > start) out.push({ level: out.length, start, end: i });
      out.push({ level: out.length, start: i, end: i + 1 });
      start = i + 1;
      width = 0;
    } else if (ch === ' ') {
      width++;
      if (width === size) {
        out.push({ level: out.length, start, end: i + 1 });
        start = i + 1;
        width = 0;
      }
    } else break;
  }
  if (i > start) out.push({ level: out.length, start, end: i });
  return out;
}

export type Intensity = 'suave' | 'media' | 'viva';

const MIX: Record<Intensity, { dark: number; light: number }> = {
  suave: { dark: 0, light: 0.35 },
  media: { dark: 0.2, light: 0.65 },
  viva: { dark: 0.4, light: 1 },
};

/** Colores de la rotación para un tipo de tema, con intensidad y opacidad aplicadas. */
export function rainbowColors(
  kind: 'dark' | 'light',
  intensity: Intensity,
  opacity: number,
): Hex[] {
  const t = MIX[intensity][kind];
  const alpha = Math.min(1, Math.max(0.02, opacity));
  return rainbow.pastel.map((p, i) => withAlpha(mix(p, rainbow.deep[i] as Hex, t), alpha));
}
