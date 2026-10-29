/** Página HTML común a todos los webviews: CSP estricta, nonce, fuentes y tokens como variables CSS. */
import * as vscode from 'vscode';
import { fontFaceCss } from '../../design/fonts';
import { contentSecurityPolicy, createNonce, tokenCss } from './page';

export interface PageOptions {
  webview: vscode.Webview;
  extensionUri: vscode.Uri;
  title: string;
  /** Rutas relativas a la raíz de la extensión. */
  styles: string[];
  script: string;
  bodyAttributes?: Record<string, string>;
}

const escapeAttr = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

export function renderPage(o: PageOptions): string {
  const nonce = createNonce();
  const uri = (rel: string) =>
    o.webview.asWebviewUri(vscode.Uri.joinPath(o.extensionUri, ...rel.split('/'))).toString();
  const attrs = Object.entries(o.bodyAttributes ?? {})
    .map(([k, v]) => ` ${k}="${escapeAttr(v)}"`)
    .join('');
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="${contentSecurityPolicy(o.webview.cspSource, nonce)}">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeAttr(o.title)}</title>
<style nonce="${nonce}">${fontFaceCss(uri)}\n${tokenCss()}</style>
${o.styles.map((s) => `<link rel="stylesheet" href="${uri(s)}">`).join('\n')}
</head>
<body${attrs}>
<div id="app"></div>
<script nonce="${nonce}" src="${uri(o.script)}"></script>
</body>
</html>`;
}
