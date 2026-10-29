/** Genera .preview/decorations.html: cintas washi e indentación arcoíris sobre cada tema. */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { withAlpha } from '../src/design/color';
import { allDecorationIcons, decorationIconName } from '../src/design/decoration-icons';
import { themes, washi, washiAlpha, washiText, washiWordColor } from '../src/design/tokens';
import { indentSegments, rainbowColors } from '../src/features/indent/levels';
import { findTagInLine } from '../src/features/washi/tags';

const code = [
  'static int push(Queue *q, int v) {',
  '    // TODO: crecer el buffer cuando se llene',
  '    if (full(q)) {',
  '        // FIXME(vale) esto pierde el último elemento',
  '        return -1;',
  '    }',
  '    // NOTE: la cola es circular',
  '    for (int i = 0; i < 4; i++) {',
  '        if (i % 2) {',
  '            // HACK temporal hasta tener el planificador',
  '            q->data[i] = v; // IDEA: usar memcpy',
  '        }',
  '    }',
  '    // ? por qué funciona con 0',
  '}',
];

const icons = new Map(
  [...allDecorationIcons()].map(([p, s]) => [
    p,
    `data:image/svg+xml;base64,${Buffer.from(s).toString('base64')}`,
  ]),
);
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function render(spec: (typeof themes)[number], mode: 'guias' | 'fondo'): string {
  const ui = spec.ui;
  const colors = rainbowColors(spec.kind, 'suave', mode === 'guias' ? 0.45 : 0.15);
  const rows = code.map((text, line) => {
    const m = findTagInLine(text, line, 'c');
    const segs = indentSegments(text, 4);
    const indentEnd = segs.at(-1)?.end ?? 0;
    const indent = segs
      .map((s) => {
        const c = colors[s.level % colors.length];
        const style = mode === 'guias' ? `border-left:2px solid ${c}` : `background:${c}`;
        return `<span style="${style}">${' '.repeat(s.end - s.start)}</span>`;
      })
      .join('');
    let body = esc(text.slice(indentEnd));
    let gutter = '';
    if (m) {
      const w = washi[m.tag];
      const before = esc(text.slice(indentEnd, m.tagStart));
      const tape = withAlpha(w.tape, washiAlpha[spec.kind]);
      body =
        `<span style="color:${spec.syntax.comment}">${before}</span>` +
        `<span style="background:${tape};border-radius:4px;color:${washiText[spec.kind]}">` +
        `<b style="color:${washiWordColor(m.tag, spec.kind)}">${esc(m.tag)}</b>${esc(text.slice(m.tagEnd, m.end))}</span>` +
        esc(text.slice(m.end));
      gutter = `<img src="${icons.get(`media/decorations/${decorationIconName(m.tag)}.svg`)}" width="14">`;
    }
    return `<div class="ln"><span class="g">${gutter}</span><span class="n" style="color:${ui.lineNumber}">${line + 1}</span>${indent}${body}</div>`;
  });
  return `<div class="ed" style="background:${ui.editorBg};color:${ui.fg}"><h3>${spec.label} · ${mode}</h3>${rows.join('')}</div>`;
}

const pick = themes.filter((t) =>
  [
    'sugar-collage-dark',
    'sugar-collage-light-algodon',
    'sugar-collage-light-pistache',
    'sugar-collage-maximal',
  ].includes(t.id),
);
const html = `<!doctype html><meta charset="utf-8"><title>Sugar Collage · decoraciones</title>
<style>body{margin:0;display:grid;grid-template-columns:1fr 1fr;font-family:'Fira Code',Consolas,monospace;font-size:13px}
.ed{padding:8px 0 12px}h3{font:600 12px 'Segoe UI',sans-serif;margin:0 12px 6px}
.ln{white-space:pre;line-height:1.6;display:flex;align-items:center}.g{width:20px;display:inline-flex;justify-content:center}
.n{width:24px;text-align:right;margin-right:12px}</style>
${pick.flatMap((t) => [render(t, 'guias'), render(t, 'fondo')]).join('')}`;
const out = resolve(__dirname, '..', '.preview');
mkdirSync(out, { recursive: true });
writeFileSync(join(out, 'decorations.html'), html);
console.log('✦ .preview/decorations.html');
