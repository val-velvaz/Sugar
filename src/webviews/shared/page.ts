/** Partes puras de las páginas de webview (testeables sin VS Code): nonce, CSP y tokens CSS. */
import { randomBytes } from 'node:crypto';
import { deep, fonts, pastel, saturated, washi, washiTags } from '../../design/tokens';

export function createNonce(): string {
  return randomBytes(16).toString('base64');
}

/** Solo recursos de la extensión, estilos y scripts con nonce, sin inline ni eval. */
export function contentSecurityPolicy(cspSource: string, nonce: string): string {
  return [
    "default-src 'none'",
    `img-src ${cspSource} data:`,
    `font-src ${cspSource}`,
    `style-src ${cspSource} 'nonce-${nonce}'`,
    `script-src 'nonce-${nonce}'`,
  ].join('; ');
}

const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

/** Variables `--sc-*` generadas desde tokens.ts (única fuente de verdad). */
export function tokenCss(): string {
  const vars: string[] = [];
  for (const [k, v] of Object.entries(pastel)) vars.push(`--sc-${kebab(k)}:${v}`);
  for (const [k, v] of Object.entries(saturated)) vars.push(`--sc-${kebab(k)}:${v}`);
  for (const [k, v] of Object.entries(deep)) vars.push(`--sc-deep-${kebab(k)}:${v}`);
  washiTags.forEach((t, i) => {
    vars.push(`--sc-washi-${i}:${washi[t].tape}`, `--sc-washi-ink-${i}:${washi[t].ink}`);
  });
  vars.push(
    `--sc-font-code:${fonts.code}`,
    `--sc-font-body:${fonts.body}`,
    `--sc-font-editorial:${fonts.editorial}`,
  );
  return `:root{${vars.join(';')}}`;
}
