/** Fuentes OFL incluidas en media/fonts/ para webviews y la vista previa de Markdown. */

export interface FontFace {
  family: 'Fira Code' | 'Nunito Sans' | 'Tinos';
  weight: number;
  style: 'normal' | 'italic';
  /** Paquete de @fontsource del que se copia. */
  pkg: 'fira-code' | 'nunito-sans' | 'tinos';
  file: string;
}

const face = (
  family: FontFace['family'],
  pkg: FontFace['pkg'],
  weight: number,
  style: FontFace['style'] = 'normal',
): FontFace => ({ family, pkg, weight, style, file: `${pkg}-latin-${weight}-${style}.woff2` });

export const fontFaces: readonly FontFace[] = [
  face('Fira Code', 'fira-code', 400),
  face('Fira Code', 'fira-code', 600),
  face('Nunito Sans', 'nunito-sans', 400),
  face('Nunito Sans', 'nunito-sans', 400, 'italic'),
  face('Nunito Sans', 'nunito-sans', 700),
  face('Nunito Sans', 'nunito-sans', 800),
  face('Tinos', 'tinos', 400),
  face('Tinos', 'tinos', 400, 'italic'),
  face('Tinos', 'tinos', 700),
];

export const FONT_DIR = 'media/fonts';

/** @font-face para todas las fuentes; `url` convierte la ruta relativa en una URI del webview. */
export function fontFaceCss(url: (relativePath: string) => string): string {
  return fontFaces
    .map(
      (f) =>
        `@font-face{font-family:'${f.family}';font-style:${f.style};font-weight:${f.weight};` +
        `font-display:swap;src:url('${url(`${FONT_DIR}/${f.file}`)}') format('woff2');}`,
    )
    .join('\n');
}
