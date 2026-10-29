/** Primitivas SVG originales de Sugar Collage (viewBox 32×32). */
import { mix, type Hex } from './color';
import { pastel } from './tokens';

export type Variant = 'dark' | 'light';

export interface Paint {
  fill: Hex;
  stroke: Hex;
  ink: Hex;
}

/** En claro el contorno es más oscuro para que el pastel no se pierda sobre fondos pálidos. */
export function paint(fill: Hex, variant: Variant): Paint {
  return {
    fill,
    stroke: variant === 'dark' ? mix(fill, '#2E2D2D', 0.38) : mix(fill, pastel.carbon, 0.6),
    ink: pastel.carbon,
  };
}

export function svg(body: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">${body}</svg>\n`;
}

const r1 = (n: number) => Math.round(n * 100) / 100;

export function escapeXml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Contorno orgánico y suave: círculo con `n` ondulaciones de amplitud `amp`. */
export function blobPath(
  cx: number,
  cy: number,
  r: number,
  amp: number,
  n: number,
  phase = 0,
): string {
  const steps = n * 2;
  const pts = Array.from({ length: steps }, (_, i) => {
    const a = (i / steps) * Math.PI * 2 + phase;
    const rr = r + (i % 2 === 0 ? amp : -amp);
    return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)] as const;
  });
  const mid = (i: number) => {
    const a = pts[i % steps] as readonly [number, number];
    const b = pts[(i + 1) % steps] as readonly [number, number];
    return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] as const;
  };
  const start = mid(0);
  let d = `M${r1(start[0])} ${r1(start[1])}`;
  for (let i = 1; i <= steps; i++) {
    const p = pts[i % steps] as readonly [number, number];
    const m = mid(i);
    d += `Q${r1(p[0])} ${r1(p[1])} ${r1(m[0])} ${r1(m[1])}`;
  }
  return `${d}Z`;
}

/** Estrella de 4 puntas (destello ✦). */
export function sparklePath(cx: number, cy: number, r: number, waist = 0.28): string {
  const w = r * waist;
  return (
    `M${cx} ${cy - r}Q${cx + w} ${cy - w} ${cx + r} ${cy}` +
    `Q${cx + w} ${cy + w} ${cx} ${cy + r}Q${cx - w} ${cy + w} ${cx - r} ${cy}` +
    `Q${cx - w} ${cy - w} ${cx} ${cy - r}Z`
  );
}

const shine = (cx: number, cy: number, rx: number, ry: number) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#FFFFFF" opacity=".55" transform="rotate(-35 ${cx} ${cy})"/>`;

/** Cuenta de pulsera con letras. */
export function bead(text: string, p: Paint): string {
  const size = text.length <= 1 ? 17 : text.length === 2 ? 13 : 10.5;
  return svg(
    `<path d="M0 16h4M28 16h4" stroke="${p.stroke}" stroke-width="1.6" stroke-linecap="round"/>` +
      `<circle cx="16" cy="16" r="12.5" fill="${p.fill}" stroke="${p.stroke}" stroke-width="2"/>` +
      shine(11, 10, 3.2, 1.6) +
      `<text x="16" y="16.5" text-anchor="middle" dominant-baseline="central" ` +
      `font-family="'Nunito Sans','Segoe UI',Arial,sans-serif" font-weight="900" ` +
      `font-size="${size}" fill="${p.ink}">${escapeXml(text)}</text>`,
  );
}

/** Botón de costura con 2 o 4 agujeritos; `stitch` cose una X entre los 4 agujeros. */
export function button(p: Paint, holes: 2 | 4, stitch = false): string {
  const pos: [number, number][] =
    holes === 2
      ? [
          [12.5, 16],
          [19.5, 16],
        ]
      : [
          [12.8, 12.8],
          [19.2, 12.8],
          [12.8, 19.2],
          [19.2, 19.2],
        ];
  const thread = stitch
    ? `<path d="M12.8 12.8L19.2 19.2M19.2 12.8L12.8 19.2" stroke="${p.ink}" stroke-width="1.8" stroke-linecap="round"/>`
    : '';
  return svg(
    `<circle cx="16" cy="16" r="13" fill="${p.fill}" stroke="${p.stroke}" stroke-width="2"/>` +
      `<circle cx="16" cy="16" r="9.5" fill="none" stroke="${p.stroke}" stroke-width="1.2" opacity=".55"/>` +
      shine(10, 9, 3, 1.4) +
      pos.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2" fill="${p.stroke}"/>`).join('') +
      thread,
  );
}

/** Galleta con chispas; `bitten` le da una mordida (node_modules). */
export function cookie(
  p: Paint,
  opts: { bitten?: boolean; letter?: string; scallop?: boolean } = {},
): string {
  const edge = opts.scallop ? blobPath(16, 16, 12.5, 1.4, 9) : blobPath(16, 16, 12.8, 0.6, 11, 0.3);
  const bite = opts.bitten
    ? `<mask id="m"><rect width="32" height="32" fill="#fff"/>` +
      `<circle cx="28.5" cy="5.5" r="6.5" fill="#000"/><circle cx="31" cy="13" r="3.5" fill="#000"/></mask>`
    : '';
  const chips = opts.letter
    ? `<text x="16" y="16.5" text-anchor="middle" dominant-baseline="central" font-family="'Nunito Sans','Segoe UI',Arial,sans-serif" font-weight="900" font-size="15" fill="${p.ink}">${escapeXml(opts.letter)}</text>`
    : [
        [11, 12, 0],
        [18, 10, 30],
        [20, 18, 70],
        [12, 20, 120],
        [16, 15.5, 45],
        [21.5, 23, 10],
      ]
        .map(
          ([x, y, a]) =>
            `<rect x="${(x ?? 0) - 1.4}" y="${(y ?? 0) - 1.1}" width="2.8" height="2.2" rx="1" fill="${p.ink}" transform="rotate(${a} ${x} ${y})"/>`,
        )
        .join('');
  const crumbs = opts.bitten
    ? `<circle cx="25" cy="13.5" r=".9" fill="${p.stroke}"/><circle cx="22.5" cy="6" r=".7" fill="${p.stroke}"/>`
    : '';
  return svg(
    `${bite}<g${opts.bitten ? ' mask="url(#m)"' : ''}>` +
      `<path d="${edge}" fill="${p.fill}" stroke="${p.stroke}" stroke-width="2"/>${chips}</g>${crumbs}`,
  );
}

/** Sello de cera con un glifo central. */
export function waxSeal(p: Paint, glyph: (p: Paint) => string): string {
  return svg(
    `<path d="${blobPath(16, 16, 12.6, 1.1, 7, 0.4)}" fill="${p.fill}" stroke="${p.stroke}" stroke-width="2"/>` +
      `<circle cx="16" cy="16" r="8.4" fill="none" stroke="${p.stroke}" stroke-width="1.4"/>` +
      glyph(p),
  );
}

export const glyphs = {
  chip: (p: Paint) =>
    `<rect x="12" y="12" width="8" height="8" rx="1.2" fill="${p.ink}"/>` +
    `<path d="M14 10v2M18 10v2M14 20v2M18 20v2M10 14h2M10 18h2M20 14h2M20 18h2" stroke="${p.ink}" stroke-width="1.3" stroke-linecap="round"/>`,
  keyhole: (p: Paint) =>
    `<circle cx="16" cy="14.2" r="2.6" fill="${p.ink}"/><path d="M14.6 15.5h2.8l.9 5.3h-4.6z" fill="${p.ink}"/>`,
};

/** Nota adhesiva con chincheta (carpeta). Abierta: una hoja crema asoma por detrás. */
export function stickyNote(p: Paint, open: boolean, emblem = ''): string {
  const pin = (x: number, y: number) =>
    `<circle cx="${x}" cy="${y + 0.8}" r="3.2" fill="#000000" opacity=".15"/>` +
    `<circle cx="${x}" cy="${y}" r="3.2" fill="${pastel.bubblegum}" stroke="${mix(pastel.bubblegum, pastel.carbon, 0.45)}" stroke-width="1.2"/>` +
    `<circle cx="${x - 1}" cy="${y - 1}" r="1" fill="#FFFFFF" opacity=".8"/>`;
  if (!open) {
    return svg(
      `<path d="M5 7.5h22v15.5l-5 5H5z" fill="${p.fill}" stroke="${p.stroke}" stroke-width="2" stroke-linejoin="round"/>` +
        `<path d="M27 23h-5v5" fill="${mix(p.fill, '#FFFFFF', 0.5)}" stroke="${p.stroke}" stroke-width="1.6" stroke-linejoin="round"/>` +
        `<g transform="translate(0 1.5)">${emblem}</g>` +
        pin(16, 7),
    );
  }
  return svg(
    `<rect x="9" y="3.5" width="17" height="14" rx="1" fill="${pastel.crema}" stroke="${p.stroke}" stroke-width="1.6" transform="rotate(8 17 10)"/>` +
      `<path d="M13 8.5l9 1.3M12.6 11.5l9 1.3" stroke="${p.stroke}" stroke-width="1" opacity=".6"/>` +
      `<path d="M4 12.5h24v11.5l-4 4H4z" fill="${p.fill}" stroke="${p.stroke}" stroke-width="2" stroke-linejoin="round"/>` +
      `<path d="M28 24h-4v4" fill="${mix(p.fill, '#FFFFFF', 0.5)}" stroke="${p.stroke}" stroke-width="1.6" stroke-linejoin="round"/>` +
      `<g transform="translate(0 4.5)">${emblem}</g>` +
      pin(8.5, 12.5),
  );
}

/** Emblemas pequeños para carpetas especiales; centrados en (16, 17). */
export const emblems = {
  code: (p: Paint) =>
    `<path d="M12.5 13.5l-3 3.5 3 3.5M19.5 13.5l3 3.5-3 3.5M17.2 12.5l-2.4 9" fill="none" stroke="${p.stroke}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>`,
  check: (p: Paint) =>
    `<path d="M11 17.2l3.4 3.3 6.6-7" fill="none" stroke="${p.stroke}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`,
  lines: (p: Paint) =>
    `<path d="M10 13.5h12M10 17h12M10 20.5h8" stroke="${p.stroke}" stroke-width="1.8" stroke-linecap="round"/>`,
  heart: (p: Paint) =>
    `<path d="M16 21.5c-4-2.6-6-4.5-6-6.7a3 3 0 0 1 6-1 3 3 0 0 1 6 1c0 2.2-2 4.1-6 6.7z" fill="${p.stroke}"/>`,
  sparkle: (p: Paint) => `<path d="${sparklePath(16, 17, 5.5)}" fill="${p.stroke}"/>`,
  branch: (p: Paint) =>
    `<path d="M12.5 13v8M12.5 18c0-2.5 7-1.5 7-4" fill="none" stroke="${p.stroke}" stroke-width="1.7" stroke-linecap="round"/>` +
    `<circle cx="12.5" cy="12.5" r="1.8" fill="${p.stroke}"/><circle cx="12.5" cy="21.5" r="1.8" fill="${p.stroke}"/><circle cx="19.5" cy="13.5" r="1.8" fill="${p.stroke}"/>`,
} satisfies Record<string, (p: Paint) => string>;
