/** Íconos del gutter para las etiquetas washi (originales, viewBox 32×32). */
import { mix, type Hex } from './color';
import { sparklePath, svg } from './svg';
import { pastel, washi, washiTags, type WashiTag } from './tokens';

const edge = (c: Hex) => mix(c, pastel.carbon, 0.5);

/** Tira de cinta con bordes en zigzag (cortada a mano). */
function tapeStrip(fill: Hex, angle: number): string {
  const outline = 'M4 11L5.6 13L4 15L5.6 17L4 19L5.6 21H26.4L28 19L26.4 17L28 15L26.4 13L28 11Z';
  return (
    `<g transform="rotate(${angle} 16 16)">` +
    `<path d="${outline}" fill="${fill}" stroke="${edge(fill)}" stroke-width="1.4" stroke-linejoin="round" opacity=".95"/>` +
    `<path d="M9 11v10M14 11v10M19 11v10M24 11v10" stroke="#FFFFFF" stroke-width="1.6" opacity=".55"/></g>`
  );
}

const draw: Record<WashiTag, () => string> = {
  TODO: () => tapeStrip(washi.TODO.tape, -18),
  FIXME: () => {
    const c = washi.FIXME.tape;
    return (
      `<g transform="rotate(-40 16 16)"><rect x="3" y="10.5" width="26" height="11" rx="5.5" fill="${c}" stroke="${edge(c)}" stroke-width="1.4"/>` +
      `<rect x="11.5" y="11.5" width="9" height="9" rx="1.5" fill="${pastel.crema}"/>` +
      [13.5, 16, 18.5]
        .flatMap((x) =>
          [13.5, 16, 18.5].map((y) => `<circle cx="${x}" cy="${y}" r=".7" fill="${edge(c)}"/>`),
        )
        .join('') +
      `</g>`
    );
  },
  NOTE: () => {
    const c = washi.NOTE.tape;
    return (
      `<path d="M5 7h22v14l-6 6H5z" fill="${c}" stroke="${edge(c)}" stroke-width="1.6" stroke-linejoin="round"/>` +
      `<path d="M27 21h-6v6" fill="${mix(c, '#FFFFFF', 0.5)}" stroke="${edge(c)}" stroke-width="1.4" stroke-linejoin="round"/>` +
      `<path d="M9.5 14h13M9.5 18h8" stroke="${edge(c)}" stroke-width="1.6" stroke-linecap="round"/>` +
      `<circle cx="16" cy="7" r="3" fill="${pastel.bubblegum}" stroke="${edge(pastel.bubblegum)}" stroke-width="1.2"/>`
    );
  },
  HACK: () =>
    tapeStrip(washi.HACK.tape, 35) + tapeStrip(mix(washi.HACK.tape, '#FFFFFF', 0.25), -35),
  IDEA: () => {
    const c = washi.IDEA.tape;
    return (
      `<path d="${sparklePath(14.5, 17, 12, 0.3)}" fill="${c}" stroke="${edge(c)}" stroke-width="1.6" stroke-linejoin="round"/>` +
      `<path d="${sparklePath(25.5, 6.5, 4)}" fill="${pastel.mantequilla}" stroke="${edge(pastel.mantequilla)}" stroke-width="1"/>`
    );
  },
  '?': () => {
    const c = washi['?'].tape;
    return (
      `<path d="M16 4C9 4 4 8.4 4 14c0 3.1 1.6 5.9 4.2 7.7L7 28l6.2-3.6c.9.2 1.8.3 2.8.3 7 0 12-4.4 12-10.4S23 4 16 4z" fill="${c}" stroke="${edge(c)}" stroke-width="1.6" stroke-linejoin="round"/>` +
      `<text x="16" y="15" text-anchor="middle" dominant-baseline="central" font-family="'Nunito Sans','Segoe UI',Arial,sans-serif" font-weight="900" font-size="15" fill="${pastel.carbon}">?</text>`
    );
  },
};

export const DECORATION_DIR = 'media/decorations';

export function decorationIconName(tag: WashiTag): string {
  return tag === '?' ? 'question' : tag.toLowerCase();
}

export function allDecorationIcons(): Map<string, string> {
  return new Map(
    washiTags.map((tag) => [`${DECORATION_DIR}/${decorationIconName(tag)}.svg`, svg(draw[tag]())]),
  );
}
