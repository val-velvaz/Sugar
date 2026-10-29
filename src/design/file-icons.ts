/** File icon theme de Sugar Collage: definiciones, SVG y JSON del tema. */
import { mix, type Hex } from './color';
import {
  bead,
  button,
  cookie,
  emblems,
  glyphs,
  paint,
  sparklePath,
  stickyNote,
  svg,
  waxSeal,
  type Paint,
  type Variant,
} from './svg';
import { pastel } from './tokens';

type Draw = (variant: Variant) => string;

// ── Ilustraciones de una sola pieza ──────────────────────────────────────────

/** Pastel por capas (SQL: una base de datos es un pastel de capas). */
const layerCake: Draw = (v) => {
  const p = paint(pastel.bubblegum, v);
  const cream = paint(pastel.crema, v);
  return svg(
    `<path d="M6 13h20v11.5a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3z" fill="${p.fill}" stroke="${p.stroke}" stroke-width="2"/>` +
      `<path d="M7 17.5h18M7 22h18" stroke="${cream.fill}" stroke-width="2.4"/>` +
      `<path d="M5.5 13.5c0-2.5 4.5-3.5 10.5-3.5s10.5 1 10.5 3.5c0 1.4-1.2 1.4-1.7 2.6-.6 1.3-2 1.3-2.4 0-.5-1.4-2.2-1.4-2.7 0-.5 1.3-2 1.3-2.4 0-.5-1.4-2.3-1.4-2.8 0-.5 1.3-2 1.3-2.4 0-.5-1.2-2.2-1.4-2.6 0-.4 1.2-1.9 1.2-2.4 0-.3-.9-1.1-1.1-1.1-2.6z" fill="${cream.fill}" stroke="${cream.stroke}" stroke-width="1.4" stroke-linejoin="round"/>` +
      `<circle cx="16" cy="7" r="2.8" fill="${pastel.fresaLeche}" stroke="${mix(pastel.fresaLeche, pastel.carbon, 0.5)}" stroke-width="1.3"/>` +
      `<path d="M16.5 4.3c.6-1.2 1.6-1.9 2.8-2" fill="none" stroke="${mix(pastel.pistache, pastel.carbon, 0.5)}" stroke-width="1.2" stroke-linecap="round"/>`,
  );
};

/** Papel de libreta con margen rosa (Markdown). */
const notebookPaper: Draw = (v) => {
  const p = paint('#FFFDF8', v);
  return svg(
    `<rect x="6" y="3.5" width="20" height="25" rx="2.2" fill="${p.fill}" stroke="${mix(pastel.cielo, pastel.carbon, v === 'dark' ? 0.25 : 0.55)}" stroke-width="2"/>` +
      `<path d="M7 10.5h18M7 15h18M7 19.5h18M7 24h18" stroke="${pastel.cielo}" stroke-width="1.4"/>` +
      `<path d="M11 4.5v23" stroke="${pastel.bubblegum}" stroke-width="1.5"/>` +
      `<path d="${sparklePath(19.5, 7, 2.6)}" fill="${pastel.bubblegum}"/>`,
  );
};

/** Libreta de espiral (Jupyter notebooks). */
const spiralNotebook: Draw = (v) => {
  const p = paint(pastel.lavanda, v);
  return svg(
    `<rect x="8" y="3.5" width="19" height="25" rx="2.5" fill="${p.fill}" stroke="${p.stroke}" stroke-width="2"/>` +
      `<rect x="13" y="9" width="10" height="5" rx="1" fill="#FFFFFF" opacity=".75"/>` +
      [8, 13, 18, 23]
        .map(
          (y) =>
            `<path d="M5 ${y}h5" stroke="${p.stroke}" stroke-width="2" stroke-linecap="round"/><circle cx="10.5" cy="${y}" r="1" fill="${p.stroke}"/>`,
        )
        .join('') +
      `<path d="${sparklePath(18, 21, 3.4)}" fill="${pastel.mantequilla}" stroke="${p.stroke}" stroke-width="1"/>`,
  );
};

/** Dona glaseada con chispas (CSS). */
const donut: Draw = (v) => {
  const dough = paint(pastel.durazno, v);
  const glaze = paint(pastel.bubblegum, v);
  const sprinkles: [number, number, number, Hex][] = [
    [10, 11, 30, pastel.cielo],
    [20, 9, -20, pastel.mantequilla],
    [23, 17, 70, pastel.menta],
    [11, 20, -50, pastel.mantequilla],
    [17, 23, 15, pastel.cielo],
    [15.5, 8.5, 80, pastel.menta],
  ];
  return svg(
    `<mask id="h"><rect width="32" height="32" fill="#fff"/><circle cx="16" cy="16" r="3.6" fill="#000"/></mask>` +
      `<g mask="url(#h)"><circle cx="16" cy="16" r="13" fill="${dough.fill}" stroke="${dough.stroke}" stroke-width="2"/>` +
      `<path d="M16 5.5c3 0 4.5 1.8 6.5 2.3s3.6 3.2 3.5 5.6c-.1 2 1 3.4-.2 5.3s-2 3.8-4.4 4.6-3.8 2.2-6.2 1.6-4.1-.7-5.6-2.5-3.4-2.8-3.3-5.5.7-4.2 2.2-6S13 5.5 16 5.5z" fill="${glaze.fill}"/>` +
      sprinkles
        .map(
          ([x, y, a, c]) =>
            `<rect x="${x - 1.6}" y="${y - 0.6}" width="3.2" height="1.2" rx=".6" fill="${c}" transform="rotate(${a} ${x} ${y})"/>`,
        )
        .join('') +
      `</g><circle cx="16" cy="16" r="3.6" fill="none" stroke="${dough.stroke}" stroke-width="1.6"/>`,
  );
};

/** Taza de leche con vapor en corazón (Java). */
const milkMug: Draw = (v) => {
  const p = paint(pastel.cielo, v);
  return svg(
    `<path d="M22 14.5h2.2a3.3 3.3 0 0 1 0 6.6H22" fill="none" stroke="${p.stroke}" stroke-width="2.2"/>` +
      `<path d="M5.5 12h17v10.5a5 5 0 0 1-5 5h-7a5 5 0 0 1-5-5z" fill="${p.fill}" stroke="${p.stroke}" stroke-width="2"/>` +
      `<path d="M5.5 15h17" stroke="#FFFFFF" stroke-width="1.6" opacity=".7"/>` +
      `<path d="M14 9.2c-2.6-1.7-3.9-2.9-3.9-4.3a1.95 1.95 0 0 1 3.9-.6 1.95 1.95 0 0 1 3.9.6c0 1.4-1.3 2.6-3.9 4.3z" fill="${pastel.bubblegum}" stroke="${mix(pastel.bubblegum, pastel.carbon, 0.45)}" stroke-width="1"/>`,
  );
};

/** Cupcake (Makefile: "make" = hornear). */
const cupcake: Draw = (v) => {
  const wrap = paint(pastel.cielo, v);
  const frost = paint(pastel.rosaPolvo, v);
  return svg(
    `<path d="M7 17h18l-2.4 11H9.4z" fill="${wrap.fill}" stroke="${wrap.stroke}" stroke-width="2" stroke-linejoin="round"/>` +
      `<path d="M11.5 18l.8 9M16 18v9M20.5 18l-.8 9" stroke="${wrap.stroke}" stroke-width="1.2" opacity=".7"/>` +
      `<path d="M6 17.5c-1.6-3.2 1-5.6 3.6-5.2-.4-3.3 3-5.6 6.2-4 3-2.1 7 .2 6.6 3.8 2.8-.2 4.7 2.6 3.6 5.4z" fill="${frost.fill}" stroke="${frost.stroke}" stroke-width="1.8" stroke-linejoin="round"/>` +
      `<circle cx="16" cy="5.6" r="2.6" fill="${pastel.fresaLeche}" stroke="${mix(pastel.fresaLeche, pastel.carbon, 0.5)}" stroke-width="1.2"/>`,
  );
};

/** Cubos de azúcar apilados (Dockerfile: contenedores). */
const sugarCubes: Draw = (v) => {
  const p = paint('#FFFFFF', v);
  const edge = mix(pastel.cielo, pastel.carbon, v === 'dark' ? 0.2 : 0.55);
  const cube = (x: number, y: number) =>
    `<rect x="${x}" y="${y}" width="11" height="11" rx="2.2" fill="${p.fill}" stroke="${edge}" stroke-width="1.8"/>` +
    `<circle cx="${x + 3.5}" cy="${y + 4}" r=".8" fill="${pastel.cielo}"/><circle cx="${x + 7}" cy="${y + 7}" r=".8" fill="${pastel.cielo}"/>`;
  return svg(cube(4.5, 17.5) + cube(16.5, 17.5) + cube(10.5, 5.5));
};

/** Caja de regalo con moño (package.json). */
const giftBox: Draw = (v) => {
  const box = paint(pastel.mantequilla, v);
  const ribbon = paint(pastel.bubblegum, v);
  return svg(
    `<rect x="5" y="12" width="22" height="16" rx="2" fill="${box.fill}" stroke="${box.stroke}" stroke-width="2"/>` +
      `<rect x="4" y="10" width="24" height="5" rx="1.5" fill="${box.fill}" stroke="${box.stroke}" stroke-width="2"/>` +
      `<path d="M16 10v18" stroke="${ribbon.fill}" stroke-width="3.4"/>` +
      `<path d="M16 10c-2.5-4.5-8-4.5-6.8-1.4C10 10.4 13.5 10 16 10zM16 10c2.5-4.5 8-4.5 6.8-1.4C22 10.4 18.5 10 16 10z" fill="${ribbon.fill}" stroke="${ribbon.stroke}" stroke-width="1.4" stroke-linejoin="round"/>`,
  );
};

/** Gran destello ✦ (README). */
const readmeStar: Draw = (v) => {
  const p = paint(pastel.mantequilla, v);
  return svg(
    `<path d="${sparklePath(14.5, 16, 12, 0.3)}" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.8" stroke-linejoin="round"/>` +
      `<path d="${sparklePath(25.5, 7, 4)}" fill="${pastel.bubblegum}"/>` +
      `<path d="${sparklePath(26, 25, 2.6)}" fill="${pastel.lavanda}"/>`,
  );
};

/** Polaroid con colina y sol (imágenes). */
const polaroid: Draw = (v) => {
  const frame = paint('#FFFDF8', v);
  const edge = mix(pastel.rosaPolvo, pastel.carbon, v === 'dark' ? 0.2 : 0.55);
  return svg(
    `<rect x="5" y="4" width="22" height="24" rx="2" fill="${frame.fill}" stroke="${edge}" stroke-width="2" transform="rotate(-4 16 16)"/>` +
      `<g transform="rotate(-4 16 16)"><rect x="8" y="7" width="16" height="13" rx="1" fill="${pastel.cielo}"/>` +
      `<path d="M8 20v-3.5c3-3 6-3.5 9-1.5 2.5-1.8 5-1.5 7 .5V20z" fill="${pastel.pistache}"/>` +
      `<circle cx="19.5" cy="11" r="2.4" fill="${pastel.mantequilla}"/>` +
      `<path d="M13 24.2h6" stroke="${pastel.bubblegum}" stroke-width="1.5" stroke-linecap="round"/></g>`,
  );
};

// ── Catálogo ─────────────────────────────────────────────────────────────────

export const fileIcons = {
  file: (v: Variant) => button(paint(pastel.rosaPolvo, v), 4),
  c: (v: Variant) => bead('C', paint(pastel.cielo, v)),
  h: (v: Variant) => bead('H', paint(pastel.lilaNube, v)),
  cpp: (v: Variant) => bead('C++', paint(pastel.lavanda, v)),
  asm: (v: Variant) => waxSeal(paint(pastel.durazno, v), glyphs.chip),
  py: (v: Variant) => bead('Py', paint(pastel.pistache, v)),
  ts: (v: Variant) => bead('TS', paint(pastel.nieblaLavanda, v)),
  js: (v: Variant) => bead('JS', paint(pastel.mantequilla, v)),
  json: (v: Variant) => bead('{}', paint(pastel.menta, v)),
  md: notebookPaper,
  sql: layerCake,
  html: (v: Variant) => bead('<>', paint(pastel.fresaLeche, v)),
  css: donut,
  rs: (v: Variant) => cookie(paint(pastel.durazno, v), { scallop: true, letter: 'R' }),
  java: milkMug,
  ipynb: spiralNotebook,
  yml: (v: Variant) => bead('Y', paint(pastel.durazno, v)),
  env: (v: Variant) => waxSeal(paint(pastel.bubblegum, v), glyphs.keyhole),
  gitignore: (v: Variant) => button(paint(pastel.nieblaLavanda, v), 4, true),
  makefile: cupcake,
  dockerfile: sugarCubes,
  package: giftBox,
  readme: readmeStar,
  image: polaroid,
} satisfies Record<string, Draw>;

interface FolderSpec {
  fill: Hex;
  emblem?: (p: Paint) => string;
}

export const folderIcons = {
  folder: { fill: pastel.rosaPolvo },
  src: { fill: pastel.lavanda, emblem: emblems.code },
  test: { fill: pastel.pistache, emblem: emblems.check },
  docs: { fill: pastel.cielo, emblem: emblems.lines },
  assets: { fill: pastel.durazno, emblem: emblems.heart },
  vscode: { fill: pastel.nieblaLavanda, emblem: emblems.sparkle },
  git: { fill: pastel.fresaLeche, emblem: emblems.branch },
} satisfies Record<string, FolderSpec>;

export type FileIconId = keyof typeof fileIcons;
export type FolderIconId = keyof typeof folderIcons | 'node_modules';

export function drawFolder(id: FolderIconId, open: boolean, v: Variant): string {
  if (id === 'node_modules') {
    return cookie(paint(open ? '#F3D9B5' : '#EED0A6', v), { bitten: true });
  }
  const spec: FolderSpec = folderIcons[id];
  const p = paint(spec.fill, v);
  return stickyNote(p, open, spec.emblem ? spec.emblem(p) : '');
}

// ── Asociaciones ─────────────────────────────────────────────────────────────

export const fileExtensions: Record<string, FileIconId> = {
  c: 'c',
  h: 'h',
  hh: 'h',
  hpp: 'h',
  hxx: 'h',
  cpp: 'cpp',
  cc: 'cpp',
  cxx: 'cpp',
  'c++': 'cpp',
  asm: 'asm',
  s: 'asm',
  nasm: 'asm',
  inc: 'asm',
  py: 'py',
  pyw: 'py',
  pyi: 'py',
  ts: 'ts',
  mts: 'ts',
  cts: 'ts',
  tsx: 'ts',
  'd.ts': 'ts',
  js: 'js',
  mjs: 'js',
  cjs: 'js',
  jsx: 'js',
  json: 'json',
  jsonc: 'json',
  json5: 'json',
  md: 'md',
  markdown: 'md',
  mdx: 'md',
  sql: 'sql',
  psql: 'sql',
  mysql: 'sql',
  sqlite: 'sql',
  db: 'sql',
  html: 'html',
  htm: 'html',
  xhtml: 'html',
  css: 'css',
  scss: 'css',
  sass: 'css',
  less: 'css',
  rs: 'rs',
  java: 'java',
  jar: 'java',
  class: 'java',
  ipynb: 'ipynb',
  yml: 'yml',
  yaml: 'yml',
  env: 'env',
  mk: 'makefile',
  png: 'image',
  jpg: 'image',
  jpeg: 'image',
  gif: 'image',
  webp: 'image',
  avif: 'image',
  bmp: 'image',
  ico: 'image',
  svg: 'image',
  tiff: 'image',
};

export const fileNames: Record<string, FileIconId> = {
  '.gitignore': 'gitignore',
  '.gitattributes': 'gitignore',
  '.gitmodules': 'gitignore',
  '.gitkeep': 'gitignore',
  '.dockerignore': 'dockerfile',
  '.env': 'env',
  '.env.local': 'env',
  '.env.example': 'env',
  '.env.development': 'env',
  '.env.production': 'env',
  makefile: 'makefile',
  gnumakefile: 'makefile',
  dockerfile: 'dockerfile',
  'docker-compose.yml': 'dockerfile',
  'docker-compose.yaml': 'dockerfile',
  'compose.yml': 'dockerfile',
  'package.json': 'package',
  'package-lock.json': 'package',
  readme: 'readme',
  'readme.md': 'readme',
  'readme.txt': 'readme',
};

export const languageIds: Record<string, FileIconId> = {
  c: 'c',
  cpp: 'cpp',
  python: 'py',
  typescript: 'ts',
  typescriptreact: 'ts',
  javascript: 'js',
  javascriptreact: 'js',
  json: 'json',
  jsonc: 'json',
  markdown: 'md',
  sql: 'sql',
  html: 'html',
  css: 'css',
  scss: 'css',
  rust: 'rs',
  java: 'java',
  yaml: 'yml',
  makefile: 'makefile',
  dockerfile: 'dockerfile',
  dotenv: 'env',
  ignore: 'gitignore',
  asm: 'asm',
  nasm: 'asm',
  'asm-intel-x86-generic': 'asm',
};

export const folderNames: Record<string, FolderIconId> = {
  src: 'src',
  source: 'src',
  lib: 'src',
  test: 'test',
  tests: 'test',
  __tests__: 'test',
  spec: 'test',
  docs: 'docs',
  doc: 'docs',
  assets: 'assets',
  media: 'assets',
  images: 'assets',
  img: 'assets',
  '.vscode': 'vscode',
  node_modules: 'node_modules',
  '.git': 'git',
  '.github': 'git',
};

// ── JSON del tema ────────────────────────────────────────────────────────────

export const ICON_DIR = 'media/icons';

export function iconFile(name: string, v: Variant): string {
  return `${ICON_DIR}/${v}/${name}.svg`;
}

export function folderIconName(id: FolderIconId, open: boolean): string {
  const base = id === 'folder' ? 'folder' : `folder-${id}`;
  return open ? `${base}-open` : base;
}

/** Todos los SVG a escribir, por ruta relativa a la raíz del proyecto. */
export function allIconFiles(): Map<string, string> {
  const out = new Map<string, string>();
  const folders = [...(Object.keys(folderIcons) as FolderIconId[]), 'node_modules' as const];
  for (const v of ['dark', 'light'] as const) {
    for (const [name, draw] of Object.entries(fileIcons)) out.set(iconFile(name, v), draw(v));
    for (const id of folders) {
      for (const open of [false, true]) {
        out.set(iconFile(folderIconName(id, open), v), drawFolder(id, open, v));
      }
    }
  }
  return out;
}

interface Associations {
  file: string;
  folder: string;
  folderExpanded: string;
  rootFolder: string;
  rootFolderExpanded: string;
  fileExtensions: Record<string, string>;
  fileNames: Record<string, string>;
  languageIds: Record<string, string>;
  folderNames: Record<string, string>;
  folderNamesExpanded: Record<string, string>;
}

export interface IconTheme extends Associations {
  iconDefinitions: Record<string, { iconPath: string }>;
  hidesExplorerArrows: boolean;
  light: Associations;
}

function associations(suffix: string): Associations {
  const id = (name: string) => `${name}${suffix}`;
  const map = <T extends string>(rec: Record<string, T>, fn: (v: T) => string) =>
    Object.fromEntries(Object.entries(rec).map(([k, v]) => [k, id(fn(v))]));
  return {
    file: id('file'),
    folder: id('folder'),
    folderExpanded: id('folder-open'),
    rootFolder: id('folder'),
    rootFolderExpanded: id('folder-open'),
    fileExtensions: map(fileExtensions, (v) => v),
    fileNames: map(fileNames, (v) => v),
    languageIds: map(languageIds, (v) => v),
    folderNames: map(folderNames, (v) => folderIconName(v, false)),
    folderNamesExpanded: map(folderNames, (v) => folderIconName(v, true)),
  };
}

/** `relFromTheme` lleva de la carpeta del JSON (themes/) a la raíz: VS Code resuelve iconPath relativo al JSON. */
export function buildIconTheme(relFromTheme = '..'): IconTheme {
  const iconDefinitions: IconTheme['iconDefinitions'] = {};
  for (const path of allIconFiles().keys()) {
    const [, , v, file] = path.split('/') as [string, string, Variant, string];
    const name = file.replace(/\.svg$/, '');
    iconDefinitions[v === 'dark' ? name : `${name}_light`] = {
      iconPath: `${relFromTheme}/${path}`,
    };
  }
  return {
    iconDefinitions,
    hidesExplorerArrows: false,
    ...associations(''),
    light: associations('_light'),
  };
}
