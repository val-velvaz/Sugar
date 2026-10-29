import { contrastRatio, flatten, withAlpha, type Hex } from './color';
import {
  syntaxRoles,
  washi,
  washiAlpha,
  washiTags,
  washiText,
  washiWordColor,
  type ThemeSpec,
} from './tokens';

/** Metas WCAG del proyecto. */
export const MIN_TEXT = 4.5;
export const MIN_UI = 3;

export interface ContrastResult {
  theme: string;
  check: string;
  fg: Hex;
  bg: Hex;
  ratio: number;
  min: number;
  pass: boolean;
}

const ANSI_NAMES = [
  'black',
  'red',
  'green',
  'yellow',
  'blue',
  'magenta',
  'cyan',
  'white',
  'brightBlack',
  'brightRed',
  'brightGreen',
  'brightYellow',
  'brightBlue',
  'brightMagenta',
  'brightCyan',
  'brightWhite',
] as const;

/** Los ANSI negro y blanco (y sus brillantes) se excluyen: son el fondo/primer plano. */
const ANSI_CHECKED = [1, 2, 3, 4, 5, 6, 9, 10, 11, 12, 13, 14];

export function checkTheme(spec: ThemeSpec): ContrastResult[] {
  const { ui } = spec;
  const out: ContrastResult[] = [];
  const add = (check: string, fg: Hex, bg: Hex, min: number) => {
    const ratio = contrastRatio(fg, bg);
    out.push({ theme: spec.label, check, fg, bg, ratio, min, pass: ratio >= min });
  };

  for (const role of syntaxRoles) add(`sintaxis.${role}`, spec.syntax[role], ui.editorBg, MIN_TEXT);

  add('texto/editor', ui.fg, ui.editorBg, MIN_TEXT);
  add('texto/sidebar', ui.fg, ui.sidebarBg, MIN_TEXT);
  add('texto/panel', ui.fg, ui.panelBg, MIN_TEXT);
  add('texto/widget', ui.fg, ui.widgetBg, MIN_TEXT);
  add('texto/selección', ui.fg, flatten(ui.selection, ui.editorBg), MIN_TEXT);
  add('variable/selección', spec.syntax.variable, flatten(ui.selection, ui.editorBg), MIN_TEXT);

  add('ui.activityBar', ui.activityFg, ui.activityBg, MIN_UI);
  add('ui.statusBar', ui.statusFg, ui.statusBg, MIN_UI);
  add('ui.botón', ui.accentFg, ui.accent, MIN_UI);
  add('ui.textoSecundario', ui.fgMuted, ui.sidebarBg, MIN_UI);
  add('ui.númeroDeLínea', ui.lineNumber, ui.editorBg, MIN_UI);
  add('ui.númeroDeLíneaActivo', ui.lineNumberActive, ui.editorBg, MIN_UI);
  for (const key of ['error', 'warning', 'info', 'success'] as const) {
    add(`ui.${key}`, ui[key], ui.editorBg, MIN_UI);
  }
  for (const key of ['gitAdded', 'gitModified', 'gitDeleted', 'gitUntracked'] as const) {
    add(`ui.${key}`, ui[key], ui.sidebarBg, MIN_UI);
  }
  spec.brackets.forEach((c, i) => add(`ui.corchete${i + 1}`, c, ui.editorBg, MIN_UI));
  for (const i of ANSI_CHECKED) {
    add(`ansi.${ANSI_NAMES[i]}`, spec.ansi[i] as Hex, ui.panelBg, MIN_UI);
  }
  // Cintas washi: el texto y la etiqueta en negrita siguen siendo texto de código.
  for (const tag of washiTags) {
    const w = washi[tag];
    const tape = flatten(withAlpha(w.tape, washiAlpha[spec.kind]), ui.editorBg);
    add(`washi.${tag}.texto`, washiText[spec.kind], tape, MIN_TEXT);
    add(`washi.${tag}.etiqueta`, washiWordColor(tag, spec.kind), tape, MIN_TEXT);
  }
  return out;
}

export function checkAll(specs: readonly ThemeSpec[]): ContrastResult[] {
  return specs.flatMap(checkTheme);
}
