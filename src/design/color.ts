/** Utilidades de color sin dependencias: hex, mezcla, alfa y contraste WCAG 2.x. */

export type Hex = `#${string}`;

export interface Rgb {
  r: number;
  g: number;
  b: number;
  a: number;
}

const HEX_RE = /^#([0-9a-f]{6}|[0-9a-f]{8})$/i;

export function isHex(value: string): value is Hex {
  return HEX_RE.test(value);
}

export function parseHex(hex: string): Rgb {
  if (!isHex(hex)) throw new Error(`Color hex inválido: ${hex}`);
  const n = (i: number) => parseInt(hex.slice(i, i + 2), 16);
  return { r: n(1), g: n(3), b: n(5), a: hex.length === 9 ? n(7) / 255 : 1 };
}

function byte(v: number): string {
  return Math.round(Math.min(255, Math.max(0, v)))
    .toString(16)
    .padStart(2, '0')
    .toUpperCase();
}

export function toHex({ r, g, b, a }: Rgb): Hex {
  const base = `#${byte(r)}${byte(g)}${byte(b)}` as Hex;
  return a >= 1 ? base : (`${base}${byte(a * 255)}` as Hex);
}

/** Devuelve el color con opacidad `alpha` (0–1) en formato #RRGGBBAA. */
export function withAlpha(hex: Hex, alpha: number): Hex {
  return toHex({ ...parseHex(hex), a: alpha });
}

/** Interpolación lineal en sRGB: t=0 → a, t=1 → b. */
export function mix(a: Hex, b: Hex, t: number): Hex {
  const x = parseHex(a);
  const y = parseHex(b);
  const lerp = (p: number, q: number) => p + (q - p) * t;
  return toHex({ r: lerp(x.r, y.r), g: lerp(x.g, y.g), b: lerp(x.b, y.b), a: 1 });
}

/** Compone un color semitransparente sobre un fondo opaco. */
export function flatten(fg: Hex, bg: Hex): Hex {
  const f = parseHex(fg);
  if (f.a >= 1) return toHex({ ...f, a: 1 });
  const b = parseHex(bg);
  const c = (p: number, q: number) => p * f.a + q * (1 - f.a);
  return toHex({ r: c(f.r, b.r), g: c(f.g, b.g), b: c(f.b, b.b), a: 1 });
}

export function relativeLuminance(hex: Hex): number {
  const { r, g, b } = parseHex(hex);
  const lin = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** Razón de contraste WCAG; los colores con alfa se componen sobre `bg`. */
export function contrastRatio(fg: Hex, bg: Hex): number {
  const l1 = relativeLuminance(flatten(fg, bg));
  const l2 = relativeLuminance(flatten(bg, '#FFFFFF'));
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}
