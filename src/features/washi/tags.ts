/** Detección de etiquetas TODO/FIXME/NOTE/HACK/IDEA/? dentro de comentarios (sin dependencias de vscode). */
import { washiTags, type WashiTag } from '../../design/tokens';

const SLASH = ['//', '/*'];
const HASH = ['#'];
const DASH = ['--'];

/** Marcadores de comentario por languageId. Los no listados usan FALLBACK. */
const MARKERS: Record<string, string[]> = {
  c: SLASH,
  cpp: SLASH,
  csharp: SLASH,
  java: SLASH,
  javascript: SLASH,
  javascriptreact: SLASH,
  typescript: SLASH,
  typescriptreact: SLASH,
  rust: SLASH,
  go: SLASH,
  kotlin: SLASH,
  swift: SLASH,
  dart: SLASH,
  php: [...SLASH, '#'],
  css: ['/*'],
  scss: SLASH,
  less: SLASH,
  jsonc: SLASH,
  python: HASH,
  shellscript: HASH,
  powershell: HASH,
  ruby: HASH,
  perl: HASH,
  r: HASH,
  yaml: HASH,
  toml: HASH,
  makefile: HASH,
  dockerfile: HASH,
  dotenv: HASH,
  ignore: HASH,
  properties: ['#', '!'],
  sql: DASH,
  lua: DASH,
  haskell: DASH,
  asm: [';', '#', '//', '/*'],
  nasm: [';'],
  'asm-intel-x86-generic': [';', '#'],
  ini: [';', '#'],
  bat: ['REM ', '::'],
  vb: ["'"],
  latex: ['%'],
  tex: ['%'],
  matlab: ['%'],
  erlang: ['%'],
  html: ['<!--'],
  xml: ['<!--'],
  markdown: ['<!--'],
  vue: ['//', '/*', '<!--'],
  svelte: ['//', '/*', '<!--'],
};

const FALLBACK = ['//', '/*', '#', '--', ';'];

export function commentMarkers(languageId: string): string[] {
  return MARKERS[languageId] ?? FALLBACK;
}

/** languageId aproximado a partir de la extensión (para escanear archivos sin abrirlos). */
const EXT_LANG: Record<string, string> = {
  c: 'c',
  h: 'c',
  cpp: 'cpp',
  cc: 'cpp',
  cxx: 'cpp',
  hpp: 'cpp',
  hh: 'cpp',
  cs: 'csharp',
  java: 'java',
  js: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  jsx: 'javascriptreact',
  ts: 'typescript',
  mts: 'typescript',
  cts: 'typescript',
  tsx: 'typescriptreact',
  rs: 'rust',
  go: 'go',
  kt: 'kotlin',
  swift: 'swift',
  dart: 'dart',
  php: 'php',
  css: 'css',
  scss: 'scss',
  less: 'less',
  jsonc: 'jsonc',
  py: 'python',
  pyi: 'python',
  sh: 'shellscript',
  bash: 'shellscript',
  zsh: 'shellscript',
  ps1: 'powershell',
  rb: 'ruby',
  pl: 'perl',
  r: 'r',
  yml: 'yaml',
  yaml: 'yaml',
  toml: 'toml',
  mk: 'makefile',
  sql: 'sql',
  lua: 'lua',
  hs: 'haskell',
  asm: 'asm',
  s: 'asm',
  nasm: 'nasm',
  inc: 'asm',
  ini: 'ini',
  cfg: 'ini',
  bat: 'bat',
  cmd: 'bat',
  vb: 'vb',
  tex: 'latex',
  m: 'matlab',
  erl: 'erlang',
  html: 'html',
  htm: 'html',
  xml: 'xml',
  svg: 'xml',
  md: 'markdown',
  vue: 'vue',
  svelte: 'svelte',
};

const NAME_LANG: Record<string, string> = {
  makefile: 'makefile',
  gnumakefile: 'makefile',
  dockerfile: 'dockerfile',
  '.env': 'dotenv',
  '.gitignore': 'ignore',
};

export function languageForPath(path: string): string | undefined {
  const name = (path.split(/[\\/]/).pop() ?? '').toLowerCase();
  if (NAME_LANG[name]) return NAME_LANG[name];
  if (name.startsWith('.env')) return 'dotenv';
  const dot = name.lastIndexOf('.');
  return dot > 0 ? EXT_LANG[name.slice(dot + 1)] : undefined;
}

export interface TagMatch {
  tag: WashiTag;
  /** Línea (0-based). */
  line: number;
  /** Columna donde empieza la etiqueta. */
  tagStart: number;
  tagEnd: number;
  /** Fin del texto del comentario en la línea (sin cierres de bloque ni espacios finales). */
  end: number;
  /** Texto después de la etiqueta, sin dos puntos iniciales. */
  text: string;
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const TAG_ALT = washiTags.map(escapeRe).join('|');
const regexCache = new Map<string, RegExp>();

function lineRegex(languageId: string): RegExp {
  let re = regexCache.get(languageId);
  if (!re) {
    const markers = commentMarkers(languageId).map(escapeRe);
    // La continuación de un bloque /* … */ (" * TODO") solo cuenta al inicio de la línea.
    const starts = commentMarkers(languageId).includes('/*') ? [...markers, '^\\s*\\*'] : markers;
    re = new RegExp(`(?:${starts.join('|')})[\\s*!/#;-]*?(${TAG_ALT})(?=[\\s:(]|$)`);
    regexCache.set(languageId, re);
  }
  return re;
}

export function findTagInLine(
  lineText: string,
  line: number,
  languageId: string,
): TagMatch | undefined {
  const m = lineRegex(languageId).exec(lineText);
  if (!m || m[1] === undefined) return undefined;
  const tag = m[1] as WashiTag;
  const tagStart = m.index + m[0].length - tag.length;
  const tagEnd = tagStart + tag.length;
  let end = lineText.length;
  for (const close of ['*/', '-->']) {
    const i = lineText.indexOf(close, tagEnd);
    if (i !== -1 && i < end) end = i;
  }
  while (end > tagEnd && /\s/.test(lineText[end - 1] ?? '')) end--;
  const text = lineText
    .slice(tagEnd, end)
    .replace(/^\([^)]*\)/, '')
    .replace(/^\s*:?\s*/, '')
    .trim();
  return { tag, line, tagStart, tagEnd, end, text };
}

export function findTags(
  source: string,
  languageId: string,
  enabled: readonly WashiTag[] = washiTags,
  maxLines = 50_000,
): TagMatch[] {
  const allowed = new Set(enabled);
  const out: TagMatch[] = [];
  const lines = source.split(/\r?\n/, maxLines);
  lines.forEach((text, i) => {
    const m = findTagInLine(text, i, languageId);
    if (m && allowed.has(m.tag)) out.push(m);
  });
  return out;
}
