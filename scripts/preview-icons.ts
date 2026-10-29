/** Genera .preview/icons.html: todos los íconos sobre los fondos de sidebar de cada tema. */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { allIconFiles } from '../src/design/file-icons';
import { themes } from '../src/design/tokens';

const files = [...allIconFiles()];
const rows = themes
  .map((t) => {
    const v = t.kind;
    const icons = files
      .filter(([p]) => p.includes(`/${v}/`))
      .map(([p, s]) => {
        const name = p.split('/').pop()?.replace('.svg', '') ?? '';
        const uri = `data:image/svg+xml;base64,${Buffer.from(s).toString('base64')}`;
        return `<figure><img src="${uri}" width="32"><img src="${uri}" width="16"><figcaption>${name}</figcaption></figure>`;
      })
      .join('');
    return `<section style="background:${t.ui.sidebarBg};color:${t.ui.fg}"><h2>${t.label}</h2><div class="g">${icons}</div></section>`;
  })
  .join('');
const html = `<!doctype html><meta charset="utf-8"><title>Sugar Collage · íconos</title>
<style>body{margin:0;font-family:'Segoe UI',sans-serif}section{padding:10px 14px}h2{font-size:13px;margin:0 0 8px}
.g{display:grid;grid-template-columns:repeat(19,1fr);gap:6px}figure{margin:0;text-align:center}
figure img{display:inline-block;margin:0 2px;vertical-align:bottom}figcaption{font-size:8.5px;opacity:.8;margin-top:3px;word-break:break-all}</style>
${rows}`;
const out = resolve(__dirname, '..', '.preview');
mkdirSync(out, { recursive: true });
writeFileSync(join(out, 'icons.html'), html);
console.log('✦ .preview/icons.html');
