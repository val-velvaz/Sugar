/**
 * Sistema de diseño de Sugar Collage: única fuente de verdad.
 * Temas, webviews e íconos se generan desde aquí; `tokens.json` es la exportación
 * de este archivo (la genera `npm run generate:themes`).
 */
import type { Hex } from './color';

export const pastel = {
  bubblegum: '#FF99C9',
  rosaPolvo: '#F6B9DB',
  lavanda: '#E4C1F9',
  lilaNube: '#F5D2F0',
  durazno: '#FEC9C3',
  mantequilla: '#FCF5BF',
  pistache: '#D7FBCB',
  menta: '#D3F4DF',
  cielo: '#BFD4F2',
  crema: '#FFF6EA',
  algodon: '#FFECF2',
  fresaLeche: '#FFB7C3',
  nieblaLavanda: '#C5C6E4',
  chicle: '#F99DCE',
  carbon: '#414040',
} as const satisfies Record<string, Hex>;

/** Acentos fuertes de la columna saturada del moodboard. */
export const saturated = {
  moradoElectrico: '#6A00D9',
  violeta: '#8C25FF',
  lavandaViva: '#C38CFF',
  verdeLima: '#8CFF3A',
  vino: '#570E37',
  fucsia: '#B81F6D',
  magenta: '#E0569E',
  rosaNeon: '#F06BB0',
  amarilloLimon: '#FFF68F',
} as const satisfies Record<string, Hex>;

/** Versiones oscurecidas del mismo matiz: texto legible sobre fondos claros (≥ 4.5:1). */
export const deep = {
  frambuesa: '#C2185B',
  uva: '#8A2BD0',
  pino: '#2F7A1A',
  cobre: '#B04A26',
  azul: '#2563C0',
  miel: '#7A6A00',
  tintaNiebla: '#5E5F9E',
  fresa: '#C2364C',
  mentaProfunda: '#14784A',
  magenta: '#A8137A',
  malva: '#7D6670',
  ciruela: '#7A3F6E',
  rosaTinta: '#A8336E',
} as const satisfies Record<string, Hex>;

/** Sección "HIGHLIGHTING": se usan siempre con opacidad baja. */
export const highlight = {
  rosa: '#FFB3C6',
  amarillo: '#FFF7B0',
  azul: '#BCD3F5',
  verde: '#D9FCCB',
  lila: '#E5D5F0',
} as const satisfies Record<string, Hex>;

export const status = {
  coral: '#F08E9C',
  rojo: '#FF0024',
  rojoSuave: '#FF5A72',
  rojoTinta: '#D00020',
  coralTinta: '#B8435A',
} as const satisfies Record<string, Hex>;

export const neutral = {
  carbon: '#414040',
  grisMedio: '#A6A6A6',
  grisClaro: '#B9B2B6',
  blancoRosado: '#FFF0F5',
} as const satisfies Record<string, Hex>;

export const fonts = {
  code: "'Fira Code', Consolas, 'Courier New', monospace",
  body: "'Nunito Sans', 'Segoe UI', system-ui, sans-serif",
  editorial: "Tinos, 'Times New Roman', Georgia, serif",
} as const;

export const syntaxRoles = [
  'keyword',
  'string',
  'escape',
  'number',
  'function',
  'type',
  'variable',
  'parameter',
  'property',
  'constant',
  'comment',
  'tag',
  'attribute',
  'regex',
  'operator',
  'macro',
  'register',
  'instruction',
  'directive',
  'label',
  'heading',
  'link',
] as const;

export type SyntaxRole = (typeof syntaxRoles)[number];
export type SyntaxPalette = Record<SyntaxRole, Hex>;

export interface UiPalette {
  editorBg: Hex;
  sidebarBg: Hex;
  panelBg: Hex;
  titleBg: Hex;
  activityBg: Hex;
  activityFg: Hex;
  statusBg: Hex;
  statusFg: Hex;
  widgetBg: Hex;
  inputBg: Hex;
  tabInactiveBg: Hex;
  border: Hex;
  fg: Hex;
  fgMuted: Hex;
  lineNumber: Hex;
  lineNumberActive: Hex;
  accent: Hex;
  accentFg: Hex;
  accentSoft: Hex;
  selection: Hex;
  lineHighlight: Hex;
  findMatch: Hex;
  findMatchOther: Hex;
  wordHighlight: Hex;
  error: Hex;
  warning: Hex;
  info: Hex;
  success: Hex;
  gitAdded: Hex;
  gitModified: Hex;
  gitDeleted: Hex;
  gitUntracked: Hex;
  gitIgnored: Hex;
}

export interface ThemeSpec {
  id: string;
  label: string;
  description: string;
  /** Swatch en emoji para el selector de temas. */
  swatch: string;
  kind: 'dark' | 'light';
  ui: UiPalette;
  syntax: SyntaxPalette;
  /** 16 colores ANSI: negro, rojo, verde, amarillo, azul, magenta, cian, blanco y sus brillantes. */
  ansi: readonly [Hex, Hex, Hex, Hex, Hex, Hex, Hex, Hex, Hex, Hex, Hex, Hex, Hex, Hex, Hex, Hex];
  brackets: readonly [Hex, Hex, Hex, Hex, Hex, Hex];
}

const darkSyntax: SyntaxPalette = {
  keyword: pastel.lavanda,
  string: pastel.pistache,
  escape: pastel.chicle,
  number: pastel.durazno,
  function: pastel.cielo,
  type: pastel.bubblegum,
  variable: neutral.blancoRosado,
  parameter: pastel.lilaNube,
  property: pastel.rosaPolvo,
  constant: pastel.mantequilla,
  comment: pastel.nieblaLavanda,
  tag: pastel.fresaLeche,
  attribute: pastel.menta,
  regex: pastel.chicle,
  operator: neutral.grisClaro,
  macro: pastel.chicle,
  register: pastel.durazno,
  instruction: pastel.lavanda,
  directive: pastel.chicle,
  label: pastel.cielo,
  heading: pastel.bubblegum,
  link: pastel.cielo,
};

const maximalSyntax: SyntaxPalette = {
  ...darkSyntax,
  keyword: saturated.lavandaViva,
  string: saturated.verdeLima,
  escape: saturated.amarilloLimon,
  type: saturated.rosaNeon,
  constant: saturated.amarilloLimon,
  instruction: saturated.lavandaViva,
  heading: saturated.rosaNeon,
};

const lightSyntax: SyntaxPalette = {
  keyword: deep.uva,
  string: deep.pino,
  escape: deep.magenta,
  number: deep.cobre,
  function: deep.azul,
  type: deep.frambuesa,
  variable: pastel.carbon,
  parameter: deep.ciruela,
  property: deep.rosaTinta,
  constant: deep.miel,
  comment: deep.tintaNiebla,
  tag: deep.fresa,
  attribute: deep.mentaProfunda,
  regex: deep.magenta,
  operator: deep.malva,
  macro: deep.magenta,
  register: deep.cobre,
  instruction: deep.uva,
  directive: deep.magenta,
  label: deep.azul,
  heading: deep.frambuesa,
  link: deep.azul,
};

const lightAnsi: ThemeSpec['ansi'] = [
  pastel.carbon,
  status.rojoTinta,
  deep.pino,
  deep.miel,
  deep.azul,
  deep.magenta,
  deep.mentaProfunda,
  '#9A8A91',
  deep.malva,
  deep.fresa,
  '#1E8A3A',
  '#8F7D00',
  '#4A6FD0',
  deep.uva,
  '#1F8A6B',
  '#B5A8AE',
];

const lightBrackets: ThemeSpec['brackets'] = [
  deep.frambuesa,
  deep.uva,
  deep.azul,
  deep.mentaProfunda,
  deep.miel,
  deep.cobre,
];

interface LightBase {
  id: string;
  label: string;
  description: string;
  swatch: string;
  editorBg: Hex;
  sidebarBg: Hex;
  panelBg: Hex;
  activityBg: Hex;
  statusBg: Hex;
  accent: Hex;
  accentSoft: Hex;
  border: Hex;
  selection: Hex;
}

function lightTheme(b: LightBase): ThemeSpec {
  return {
    id: b.id,
    label: b.label,
    description: b.description,
    swatch: b.swatch,
    kind: 'light',
    ui: {
      editorBg: b.editorBg,
      sidebarBg: b.sidebarBg,
      panelBg: b.panelBg,
      titleBg: b.sidebarBg,
      activityBg: b.activityBg,
      activityFg: pastel.carbon,
      statusBg: b.statusBg,
      statusFg: pastel.carbon,
      widgetBg: '#FFFFFF',
      inputBg: '#FFFFFF',
      tabInactiveBg: b.sidebarBg,
      border: b.border,
      fg: pastel.carbon,
      fgMuted: deep.malva,
      lineNumber: '#94828A',
      lineNumberActive: b.accent,
      accent: b.accent,
      accentFg: '#FFFFFF',
      accentSoft: b.accentSoft,
      selection: b.selection,
      lineHighlight: '#FFFFFF99',
      findMatch: '#FCE97A99',
      findMatchOther: '#FFF7B0AA',
      wordHighlight: '#BCD3F580',
      error: status.rojoTinta,
      warning: status.coralTinta,
      info: deep.azul,
      success: deep.pino,
      gitAdded: deep.pino,
      gitModified: deep.azul,
      gitDeleted: status.rojoTinta,
      gitUntracked: deep.mentaProfunda,
      gitIgnored: '#A08E96',
    },
    syntax: lightSyntax,
    ansi: lightAnsi,
    brackets: lightBrackets,
  };
}

export const themes: readonly ThemeSpec[] = [
  {
    id: 'sugar-collage-dark',
    label: 'Sugar Collage Dark',
    description: 'Carbón cálido con sintaxis en pastel puro.',
    swatch: '🩷💜🩵🖤',
    kind: 'dark',
    ui: {
      editorBg: pastel.carbon,
      sidebarBg: '#383737',
      panelBg: '#333232',
      titleBg: '#333232',
      activityBg: '#2E2D2D',
      activityFg: pastel.rosaPolvo,
      statusBg: pastel.rosaPolvo,
      statusFg: pastel.carbon,
      widgetBg: '#4A4849',
      inputBg: '#353434',
      tabInactiveBg: '#383737',
      border: '#2A2929',
      fg: neutral.blancoRosado,
      fgMuted: neutral.grisClaro,
      lineNumber: '#9A9497',
      lineNumberActive: pastel.bubblegum,
      accent: pastel.bubblegum,
      accentFg: pastel.carbon,
      accentSoft: pastel.lavanda,
      selection: '#E4C1F94D',
      lineHighlight: '#FFECF20F',
      findMatch: '#FCF5BF66',
      findMatchOther: '#FCF5BF33',
      wordHighlight: '#BFD4F233',
      error: status.rojoSuave,
      warning: status.coral,
      info: pastel.cielo,
      success: pastel.pistache,
      gitAdded: pastel.pistache,
      gitModified: pastel.cielo,
      gitDeleted: status.rojoSuave,
      gitUntracked: pastel.menta,
      gitIgnored: '#8A8487',
    },
    syntax: darkSyntax,
    ansi: [
      '#2E2D2D',
      status.rojoSuave,
      pastel.pistache,
      pastel.mantequilla,
      pastel.cielo,
      pastel.bubblegum,
      pastel.menta,
      '#E8E2E5',
      '#8A8487',
      pastel.fresaLeche,
      '#E9FFE0',
      '#FFFBE0',
      '#DCE7F8',
      pastel.lilaNube,
      '#E8FAEF',
      neutral.blancoRosado,
    ],
    brackets: [
      pastel.bubblegum,
      pastel.lavanda,
      pastel.cielo,
      pastel.menta,
      pastel.mantequilla,
      pastel.durazno,
    ],
  },
  lightTheme({
    id: 'sugar-collage-light-algodon',
    label: 'Sugar Collage Light – Algodón',
    description: 'Rosa algodón de azúcar con acentos frambuesa.',
    swatch: '🩷🤍🩷',
    editorBg: '#FFF3F7',
    sidebarBg: pastel.algodon,
    panelBg: '#FFE4EE',
    activityBg: pastel.bubblegum,
    statusBg: pastel.rosaPolvo,
    accent: deep.frambuesa,
    accentSoft: pastel.bubblegum,
    border: '#F6B9DB',
    selection: '#F6B9DB80',
  }),
  lightTheme({
    id: 'sugar-collage-light-pistache',
    label: 'Sugar Collage Light – Pistache',
    description: 'Menta y pistache, fresco como un helado.',
    swatch: '💚🤍💚',
    editorBg: '#F1FCEC',
    sidebarBg: '#E6FADD',
    panelBg: '#DDF6D2',
    activityBg: pastel.pistache,
    statusBg: '#BCEBAB',
    accent: deep.pino,
    accentSoft: pastel.pistache,
    border: '#C3EDB4',
    selection: '#E4C1F980',
  }),
  lightTheme({
    id: 'sugar-collage-light-lavanda',
    label: 'Sugar Collage Light – Lavanda',
    description: 'Lila nube y cielo, suave y onírico.',
    swatch: '💜🩵🤍',
    editorBg: '#F7F0FD',
    sidebarBg: '#F1E4FB',
    panelBg: '#EADCF8',
    activityBg: pastel.lavanda,
    statusBg: pastel.cielo,
    accent: deep.uva,
    accentSoft: pastel.lavanda,
    border: '#E0CCF5',
    selection: '#BFD4F2A0',
  }),
  lightTheme({
    id: 'sugar-collage-light-crema',
    label: 'Sugar Collage Light – Crema',
    description: 'Crema y mantequilla, como papel de libreta.',
    swatch: '💛🤍🧡',
    editorBg: '#FFF8EE',
    sidebarBg: '#FFF2DF',
    panelBg: '#FFEED2',
    activityBg: pastel.mantequilla,
    statusBg: '#F8E9A0',
    accent: deep.miel,
    accentSoft: pastel.durazno,
    border: '#F3E3C2',
    selection: '#FEC9C399',
  }),
  {
    id: 'sugar-collage-maximal',
    label: 'Sugar Collage Maximal',
    description: 'Noche de ciruela con morado eléctrico, magenta y lima.',
    swatch: '💜💗💚✦',
    kind: 'dark',
    ui: {
      editorBg: '#2A2232',
      sidebarBg: '#221B29',
      panelBg: '#1D1723',
      titleBg: '#1D1723',
      activityBg: saturated.moradoElectrico,
      activityFg: '#FFFFFF',
      statusBg: saturated.magenta,
      statusFg: '#1D1723',
      widgetBg: '#352B3F',
      inputBg: '#1D1723',
      tabInactiveBg: '#221B29',
      border: '#3D2F4A',
      fg: neutral.blancoRosado,
      fgMuted: '#B7A9C4',
      lineNumber: '#7E6E8C',
      lineNumberActive: saturated.verdeLima,
      accent: saturated.verdeLima,
      accentFg: '#1D1723',
      accentSoft: saturated.lavandaViva,
      selection: '#6A00D980',
      lineHighlight: '#C38CFF14',
      findMatch: '#FFF68F59',
      findMatchOther: '#FFF68F2E',
      wordHighlight: '#C38CFF40',
      error: status.rojoSuave,
      warning: status.coral,
      info: pastel.cielo,
      success: saturated.verdeLima,
      gitAdded: saturated.verdeLima,
      gitModified: saturated.lavandaViva,
      gitDeleted: status.rojoSuave,
      gitUntracked: pastel.menta,
      gitIgnored: '#7E6E8C',
    },
    syntax: maximalSyntax,
    ansi: [
      '#1D1723',
      status.rojoSuave,
      saturated.verdeLima,
      saturated.amarilloLimon,
      pastel.cielo,
      saturated.rosaNeon,
      pastel.menta,
      '#E8E2E5',
      '#6E6478',
      '#FF8FA3',
      '#C5FF94',
      '#FFFAB6',
      '#DCE7F8',
      saturated.lavandaViva,
      '#E8FAEF',
      neutral.blancoRosado,
    ],
    brackets: [
      saturated.rosaNeon,
      saturated.lavandaViva,
      pastel.cielo,
      saturated.verdeLima,
      saturated.amarilloLimon,
      pastel.durazno,
    ],
  },
];

/** Objeto serializable que se exporta a `tokens.json`. */
export const designTokens = {
  pastel,
  saturated,
  deep,
  highlight,
  status,
  neutral,
  fonts,
  syntaxRoles,
  themes,
} as const;
