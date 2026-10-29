/**
 * Genera .preview/themes.html: una maqueta de VS Code por tema con código de ejemplo,
 * para revisar los colores a ojo (y, más adelante, para las capturas del README).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { buildTheme, scopeRules } from '../src/design/theme-builder';
import { themes, type SyntaxRole, type ThemeSpec } from '../src/design/tokens';

type Piece = [SyntaxRole | 'plain', string];

/** Muestras tokenizadas a mano: cada línea es una lista de [rol, texto]. */
const samples: Record<string, Piece[][]> = {
  'main.c': [
    [['comment', '// ✦ cola circular para el planificador']],
    [
      ['macro', '#include'],
      ['plain', ' '],
      ['string', '<stdint.h>'],
    ],
    [
      ['macro', '#define'],
      ['plain', ' '],
      ['constant', 'QUEUE_CAP'],
      ['plain', ' '],
      ['number', '64'],
    ],
    [],
    [
      ['keyword', 'typedef struct'],
      ['plain', ' '],
      ['operator', '{'],
    ],
    [
      ['plain', '  '],
      ['type', 'uint32_t'],
      ['plain', ' '],
      ['property', 'head'],
      ['operator', ','],
      ['plain', ' '],
      ['property', 'tail'],
      ['operator', ';'],
    ],
    [
      ['operator', '}'],
      ['plain', ' '],
      ['type', 'Queue'],
      ['operator', ';'],
    ],
    [],
    [
      ['keyword', 'static'],
      ['plain', ' '],
      ['type', 'int'],
      ['plain', ' '],
      ['function', 'push'],
      ['operator', '('],
      ['type', 'Queue'],
      ['plain', ' '],
      ['operator', '*'],
      ['parameter', 'q'],
      ['operator', ','],
      ['plain', ' '],
      ['type', 'int'],
      ['plain', ' '],
      ['parameter', 'v'],
      ['operator', ')'],
      ['plain', ' '],
      ['operator', '{'],
    ],
    [
      ['plain', '  '],
      ['keyword', 'if'],
      ['plain', ' '],
      ['operator', '(('],
      ['parameter', 'q'],
      ['operator', '->'],
      ['property', 'tail'],
      ['plain', ' '],
      ['operator', '+'],
      ['plain', ' '],
      ['number', '1'],
      ['operator', ')'],
      ['plain', ' '],
      ['operator', '%'],
      ['plain', ' '],
      ['constant', 'QUEUE_CAP'],
      ['plain', ' '],
      ['operator', '=='],
      ['plain', ' '],
      ['parameter', 'q'],
      ['operator', '->'],
      ['property', 'head'],
      ['operator', ')'],
    ],
    [
      ['plain', '    '],
      ['keyword', 'return'],
      ['plain', ' '],
      ['operator', '-'],
      ['number', '1'],
      ['operator', ';'],
      ['plain', ' '],
      ['comment', '// TODO: crecer el buffer'],
    ],
    [
      ['plain', '  '],
      ['function', 'printf'],
      ['operator', '('],
      ['string', '"push %d'],
      ['escape', '\\n'],
      ['string', '"'],
      ['operator', ','],
      ['plain', ' '],
      ['parameter', 'v'],
      ['operator', ');'],
    ],
    [['operator', '}']],
  ],
  'boot.asm': [
    [['comment', '; ✦ arranque en modo largo']],
    [
      ['directive', 'section'],
      ['plain', ' '],
      ['variable', '.text'],
    ],
    [
      ['directive', 'global'],
      ['plain', ' '],
      ['label', '_start'],
    ],
    [['label', '_start:']],
    [
      ['plain', '    '],
      ['instruction', 'mov'],
      ['plain', ' '],
      ['register', 'rax'],
      ['operator', ','],
      ['plain', ' '],
      ['number', '0x3C'],
    ],
    [
      ['plain', '    '],
      ['instruction', 'xor'],
      ['plain', ' '],
      ['register', 'rdi'],
      ['operator', ','],
      ['plain', ' '],
      ['register', 'rdi'],
    ],
    [
      ['plain', '    '],
      ['instruction', 'syscall'],
    ],
    [
      ['directive', 'msg'],
      ['plain', ' '],
      ['directive', 'db'],
      ['plain', ' '],
      ['string', '"hola"'],
      ['operator', ','],
      ['plain', ' '],
      ['number', '10'],
    ],
  ],
  'query.sql': [
    [['comment', '-- galletas ganadas por día']],
    [
      ['keyword', 'SELECT'],
      ['plain', ' '],
      ['property', 'dia'],
      ['operator', ','],
      ['plain', ' '],
      ['function', 'COUNT'],
      ['operator', '(*)'],
      ['plain', ' '],
      ['keyword', 'AS'],
      ['plain', ' '],
      ['variable', 'galletas'],
    ],
    [
      ['keyword', 'FROM'],
      ['plain', ' '],
      ['type', 'pomodoros'],
    ],
    [
      ['keyword', 'WHERE'],
      ['plain', ' '],
      ['property', 'estado'],
      ['plain', ' '],
      ['operator', '='],
      ['plain', ' '],
      ['string', "'completo'"],
      ['plain', ' '],
      ['keyword', 'AND'],
      ['plain', ' '],
      ['property', 'min'],
      ['plain', ' '],
      ['operator', '>='],
      ['plain', ' '],
      ['number', '25'],
    ],
    [
      ['keyword', 'GROUP BY'],
      ['plain', ' '],
      ['property', 'dia'],
      ['plain', ' '],
      ['keyword', 'LIMIT'],
      ['plain', ' '],
      ['constant', 'NULL'],
      ['operator', ';'],
    ],
  ],
  'notes.ts': [
    [
      ['keyword', 'import'],
      ['plain', ' '],
      ['operator', '{'],
      ['plain', ' '],
      ['variable', 'window'],
      ['plain', ' '],
      ['operator', '}'],
      ['plain', ' '],
      ['keyword', 'from'],
      ['plain', ' '],
      ['string', "'vscode'"],
      ['operator', ';'],
    ],
    [
      ['keyword', 'const'],
      ['plain', ' '],
      ['constant', 'SPARKLE'],
      ['plain', ' '],
      ['operator', '='],
      ['plain', ' '],
      ['regex', '/✦+/g'],
      ['operator', ';'],
    ],
    [
      ['keyword', 'export'],
      ['plain', ' '],
      ['keyword', 'class'],
      ['plain', ' '],
      ['type', 'StickyNote'],
      ['plain', ' '],
      ['operator', '{'],
    ],
    [
      ['plain', '  '],
      ['function', 'pin'],
      ['operator', '('],
      ['parameter', 'color'],
      ['operator', ':'],
      ['plain', ' '],
      ['type', 'string'],
      ['operator', ')'],
      ['plain', ' '],
      ['operator', '{'],
      ['plain', ' '],
      ['keyword', 'this'],
      ['operator', '.'],
      ['property', 'color'],
      ['plain', ' '],
      ['operator', '='],
      ['plain', ' '],
      ['parameter', 'color'],
      ['operator', ';'],
      ['plain', ' '],
      ['operator', '}'],
    ],
    [['operator', '}']],
    [
      ['tag', '<div'],
      ['plain', ' '],
      ['attribute', 'class'],
      ['operator', '='],
      ['string', '"nota"'],
      ['tag', '>'],
      ['plain', 'hola'],
      ['tag', '</div>'],
    ],
  ],
};

function styleFor(role: SyntaxRole): string {
  // La primera regla de cada rol es la "principal" (las siguientes son casos de Markdown, logs…).
  const style = scopeRules.find((r) => r.role === role)?.fontStyle ?? '';
  return [
    style.includes('italic') ? 'font-style:italic' : '',
    style.includes('bold') ? 'font-weight:700' : '',
    style.includes('underline') ? 'text-decoration:underline' : '',
  ]
    .filter(Boolean)
    .join(';');
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function renderCode(spec: ThemeSpec, lines: Piece[][], c: Record<string, string>): string {
  const italicComment = new Set<SyntaxRole>(['comment', 'parameter']);
  return lines
    .map((line, i) => {
      const code = line
        .map(([role, text]) =>
          role === 'plain'
            ? esc(text)
            : `<span style="color:${spec.syntax[role]};${italicComment.has(role) ? 'font-style:italic' : styleFor(role)}">${esc(text)}</span>`,
        )
        .join('');
      const current = i === 2;
      const selected = i === 5;
      const bg = current
        ? c['editor.lineHighlightBackground']
        : selected
          ? c['editor.selectionBackground']
          : 'transparent';
      const numColor = current
        ? c['editorLineNumber.activeForeground']
        : c['editorLineNumber.foreground'];
      return `<div class="ln" style="background:${bg}"><span class="num" style="color:${numColor}">${i + 1}</span>${code || '&nbsp;'}</div>`;
    })
    .join('');
}

function renderTheme(spec: ThemeSpec): string {
  const c = buildTheme(spec).colors;
  const files = Object.keys(samples);
  const git = [
    ['main.c', c['gitDecoration.modifiedResourceForeground'], 'M'],
    ['boot.asm', c['gitDecoration.addedResourceForeground'], 'A'],
    ['query.sql', c['gitDecoration.untrackedResourceForeground'], 'U'],
    ['notes.ts', c['sideBar.foreground'], ''],
    ['old.h', c['gitDecoration.deletedResourceForeground'], 'D'],
    ['dist/', c['gitDecoration.ignoredResourceForeground'], ''],
  ];
  const ansi = Object.entries(c)
    .filter(([k]) => k.startsWith('terminal.ansi'))
    .map(([k, v]) => `<span title="${k}" style="color:${v}">■</span>`)
    .join('');
  const brackets = [1, 2, 3, 4, 5, 6]
    .map((i) => `<span style="color:${c[`editorBracketHighlight.foreground${i}`]}">(</span>`)
    .join('');
  const panes = files
    .map(
      (
        f,
      ) => `<div class="code" style="background:${c['editor.background']};color:${c['editor.foreground']}">
        <div class="tabbar" style="background:${c['editorGroupHeader.tabsBackground']};border-bottom:1px solid ${c['editorGroupHeader.tabsBorder']}">
          <span class="tab" style="background:${c['tab.activeBackground']};color:${c['tab.activeForeground']};border-top:2px solid ${c['tab.activeBorderTop']}">${f}</span>
          <span class="tab" style="background:${c['tab.inactiveBackground']};color:${c['tab.inactiveForeground']};border-top:2px solid ${c['tab.inactiveModifiedBorder']}">otro.md ●</span>
        </div>
        <div class="crumbs" style="color:${c['breadcrumb.foreground']}">src › ${f}</div>
        ${renderCode(spec, samples[f] ?? [], c)}
      </div>`,
    )
    .join('');
  return `<section class="theme">
  <h2>${spec.label} <small>${spec.swatch}</small></h2>
  <div class="win" style="border:1px solid ${c['editorGroup.border']}">
    <div class="title" style="background:${c['titleBar.activeBackground']};color:${c['titleBar.activeForeground']}">Sugar — ${spec.description}</div>
    <div class="body">
      <div class="activity" style="background:${c['activityBar.background']};color:${c['activityBar.foreground']}">
        <span style="border-left:2px solid ${c['activityBar.activeBorder']}">▤</span><span style="opacity:.6">⌕</span><span style="opacity:.6">⑂</span>
        <span class="badge" style="background:${c['activityBarBadge.background']};color:${c['activityBarBadge.foreground']}">3</span>
      </div>
      <div class="side" style="background:${c['sideBar.background']};color:${c['sideBar.foreground']};border-right:1px solid ${c['sideBar.border']}">
        <div class="hdr">EXPLORADOR</div>
        ${git.map(([n, col, l], i) => `<div class="item" style="color:${col};background:${i === 0 ? c['list.activeSelectionBackground'] : 'transparent'}">${n}<b>${l}</b></div>`).join('')}
        <button style="background:${c['button.background']};color:${c['button.foreground']}">Confirmar</button>
        <input value="buscar…" style="background:${c['input.background']};color:${c['input.foreground']};border:1px solid ${c['input.border']}">
      </div>
      <div class="main">
        <div class="grid">${panes}</div>
        <div class="hover" style="background:${c['editorHoverWidget.background']};border:1px solid ${c['editorHoverWidget.border']};color:${c['editorWidget.foreground']}">
          <b style="color:${spec.syntax.function}">push</b>(q, v) — sugerencia <span style="background:${c['editorSuggestWidget.selectedBackground']}">seleccionada</span>
          · <span style="background:${c['editor.findMatchBackground']};outline:1px solid ${c['editor.findMatchBorder']}">coincidencia</span>
          · <span style="background:${c['editor.findMatchHighlightBackground']}">otra</span>
          · <span style="background:${c['editor.wordHighlightBackground']}">palabra</span>
          · <span style="text-decoration:wavy underline ${c['editorError.foreground']}">error</span>
          · <span style="text-decoration:wavy underline ${c['editorWarning.foreground']}">warning</span>
          · ${brackets}
        </div>
        <div class="panel" style="background:${c['panel.background']};color:${c['terminal.foreground']};border-top:1px solid ${c['panel.border']}">
          <span style="color:${c['panelTitle.activeForeground']};border-bottom:1px solid ${c['panelTitle.activeBorder']}">TERMINAL</span>
          <span style="color:${c['terminal.ansiGreen']}">valeria</span>@<span style="color:${c['terminal.ansiBlue']}">sugar</span> $ make run ${ansi}
          <span style="color:${c['terminal.ansiRed']}">error: falta ;</span>
        </div>
      </div>
    </div>
    <div class="status" style="background:${c['statusBar.background']};color:${c['statusBar.foreground']}">⑂ main · 🍪 24:13 · Ln 3, Col 8 · UTF-8 · C</div>
  </div>
</section>`;
}

const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Sugar Collage · temas</title>
<style>
body{margin:0;padding:16px;background:#ddd;font-family:'Segoe UI',system-ui,sans-serif}
.theme{margin-bottom:28px} h2{font-size:15px;margin:0 0 6px}
.win{border-radius:8px;overflow:hidden;font-size:12px}
.title{padding:4px 10px;font-size:11px}
.body{display:flex;min-height:300px}
.activity{width:36px;display:flex;flex-direction:column;align-items:center;gap:12px;padding-top:10px;font-size:16px}
.badge{font-size:9px;border-radius:8px;padding:0 4px}
.side{width:150px;padding:6px 0}
.hdr{font-size:10px;padding:0 10px 6px;opacity:.8}
.item{padding:2px 10px;display:flex;justify-content:space-between}
.side button{margin:10px;border:0;border-radius:4px;padding:4px 10px}
.side input{margin:0 10px;width:110px;border-radius:3px;padding:3px}
.main{flex:1;display:flex;flex-direction:column;min-width:0}
.grid{display:grid;grid-template-columns:1fr 1fr;flex:1}
.code{font-family:'Fira Code',Consolas,monospace;font-size:12px;line-height:1.55;padding-bottom:6px;overflow:hidden}
.tabbar{display:flex}.tab{padding:4px 10px;font-family:'Segoe UI',sans-serif;font-size:11px}
.crumbs{padding:2px 10px;font-size:10px;font-family:'Segoe UI',sans-serif}
.ln{white-space:pre;padding-right:8px}.num{display:inline-block;width:28px;text-align:right;margin-right:12px}
.hover{margin:4px 8px;padding:5px 8px;border-radius:4px}
.panel{padding:6px 10px;font-family:'Fira Code',Consolas,monospace;display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.status{padding:3px 10px;font-size:11px}
</style><script>addEventListener("DOMContentLoaded",()=>{const o=location.hash.slice(1);if(o)document.querySelectorAll(".theme").forEach((s,i)=>{if(String(i)!==o)s.remove()})})</script></head><body>${themes.map(renderTheme).join('\n')}</body></html>`;

const outDir = resolve(__dirname, '..', '.preview');
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'themes.html'), html);
console.log('✦ .preview/themes.html');
