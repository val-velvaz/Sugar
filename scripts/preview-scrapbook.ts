/**
 * Genera .preview/scrapbook*.html: el bundle real del Scrapbook con un acquireVsCodeApi simulado,
 * las variables --vscode-* de cada tema y datos de ejemplo. Requiere `npm run build` antes.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fontFaceCss } from '../src/design/fonts';
import { buildColors } from '../src/design/theme-builder';
import { themes } from '../src/design/tokens';
import { tokenCss } from '../src/webviews/shared/page';
import type { ScrapbookState, TodoItem } from '../src/webviews/scrapbook/protocol';

const sample: ScrapbookState = {
  hasWorkspace: true,
  background: 'cuadricula',
  sparkleLevel: 2,
  notes: [
    {
      id: 'n1',
      text: 'Revisar el planificador de la cola circular antes del viernes ✦',
      color: 'mantequilla',
      pinned: true,
      scope: 'workspace',
      rotation: -1.2,
      createdAt: 1,
      updatedAt: 3,
    },
    {
      id: 'n2',
      text: 'Comprar galletas de mantequilla 🍪',
      color: 'bubblegum',
      pinned: false,
      scope: 'global',
      rotation: 1.6,
      createdAt: 1,
      updatedAt: 2,
    },
    {
      id: 'n3',
      text: 'idea: modo pastel para el tracer de syscalls',
      color: 'lavanda',
      pinned: false,
      scope: 'workspace',
      rotation: -0.6,
      createdAt: 1,
      updatedAt: 1,
    },
  ],
  tasks: [
    { id: 't1', text: 'Terminar la práctica de NASM', done: true, createdAt: 1 },
    { id: 't2', text: 'Índices de la tabla pomodoros', done: false, createdAt: 2 },
    { id: 't3', text: 'Escribir tests del parser', done: false, createdAt: 3 },
  ],
};
const todos: TodoItem[] = [
  {
    tag: 'TODO',
    text: 'crecer el buffer cuando se llene',
    file: 'src/queue.c',
    line: 41,
    uri: 'x',
    tagStart: 0,
    end: 0,
  },
  {
    tag: 'FIXME',
    text: 'esto pierde el último elemento',
    file: 'src/queue.c',
    line: 57,
    uri: 'x',
    tagStart: 0,
    end: 0,
  },
  {
    tag: 'HACK',
    text: 'temporal hasta tener el planificador',
    file: 'boot/boot.asm',
    line: 12,
    uri: 'x',
    tagStart: 0,
    end: 0,
  },
  {
    tag: '?',
    text: 'por qué funciona con 0',
    file: 'db/query.sql',
    line: 3,
    uri: 'x',
    tagStart: 0,
    end: 0,
  },
];

/** Mock mínimo: responde a "ready" y aplica los cambios en memoria para poder jugar con la UI. */
const mock = (state: ScrapbookState) => `
window.acquireVsCodeApi = () => {
  const state = ${JSON.stringify(state)};
  const todos = ${JSON.stringify(todos)};
  const emit = (msg) => window.postMessage(msg, '*');
  return {
    getState: () => undefined,
    setState: () => {},
    postMessage(msg) {
      if (msg.type === 'ready') { emit({ type: 'state', state }); emit({ type: 'todos', todos, scanning: false }); }
      if (msg.type === 'note/update') { Object.assign(state.notes.find((n) => n.id === msg.id), msg.patch); if (msg.patch.text === undefined) emit({ type: 'state', state }); }
      if (msg.type === 'task/toggle') { const t = state.tasks.find((t) => t.id === msg.id); t.done = !t.done; emit({ type: 'state', state }); }
      if (msg.type === 'background/set') { state.background = msg.value; emit({ type: 'state', state }); }
    },
  };
};`;

function page(themeId: string, state: ScrapbookState): string {
  const spec = themes.find((t) => t.id === themeId);
  if (!spec) throw new Error(themeId);
  const vars = Object.entries(buildColors(spec))
    .map(([k, v]) => `--vscode-${k.replace(/\./g, '-')}:${v}`)
    .join(';');
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${spec.label}</title>
<style>${fontFaceCss((p) => `../${p}`)}\n${tokenCss()}\n:root{${vars}}</style>
<style>html{width:300px;overflow-x:hidden;outline:1px solid #0003}</style><link rel="stylesheet" href="../media/webviews/common.css"><link rel="stylesheet" href="../media/webviews/scrapbook.css">
</head><body class="vscode-${spec.kind}"><div id="app"></div>
<script>${mock(state)}</script><script src="../dist/webviews/scrapbook.js"></script></body></html>`;
}

const out = resolve(__dirname, '..', '.preview');
mkdirSync(out, { recursive: true });
const variants: [string, string, ScrapbookState][] = [
  ['dark', 'sugar-collage-dark', sample],
  ['algodon', 'sugar-collage-light-algodon', { ...sample, background: 'gingham' }],
  ['maximal', 'sugar-collage-maximal', { ...sample, sparkleLevel: 3 }],
  ['minimal', 'sugar-collage-light-crema', { ...sample, sparkleLevel: 0 }],
];
for (const [name, id, state] of variants)
  writeFileSync(join(out, `scrapbook-${name}.html`), page(id, state));
writeFileSync(
  join(out, 'scrapbook.html'),
  `<!doctype html><meta charset="utf-8"><title>Scrapbook</title><style>body{margin:0;display:flex;gap:0}iframe{border:0;width:320px;height:900px}</style>` +
    variants.map(([name]) => `<iframe src="scrapbook-${name}.html"></iframe>`).join(''),
);
console.log('✦ .preview/scrapbook.html');
