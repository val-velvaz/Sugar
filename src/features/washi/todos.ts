/** Escaneo de pendientes en todo el workspace (lo usan el comando y el Scrapbook). */
import * as vscode from 'vscode';
import type { WashiTag } from '../../design/tokens';
import { findTags, languageForPath, type TagMatch } from './tags';

export interface WorkspaceTag {
  uri: vscode.Uri;
  match: TagMatch;
}

const MAX_BYTES = 512 * 1024;

export async function scanWorkspace(tags: readonly WashiTag[]): Promise<WorkspaceTag[]> {
  const cfg = vscode.workspace.getConfiguration('sugarCollage.todos');
  const exclude = cfg.get(
    'exclude',
    '**/{node_modules,dist,out,build,.git,.venv,venv,__pycache__,target}/**',
  );
  const maxFiles = cfg.get('maxFiles', 3000);
  const uris = await vscode.workspace.findFiles('**/*', exclude, maxFiles);
  const decoder = new TextDecoder('utf-8');
  const results: WorkspaceTag[] = [];
  await Promise.all(
    uris.map(async (uri) => {
      const lang = languageForPath(uri.path);
      if (!lang) return;
      // Si el archivo está abierto se usa su contenido sin guardar.
      const open = vscode.workspace.textDocuments.find((d) => d.uri.toString() === uri.toString());
      let text: string;
      if (open) {
        text = open.getText();
      } else {
        const bytes = await vscode.workspace.fs.readFile(uri);
        if (bytes.byteLength > MAX_BYTES || bytes.includes(0)) return;
        text = decoder.decode(bytes);
      }
      for (const match of findTags(text, open?.languageId ?? lang, tags))
        results.push({ uri, match });
    }),
  );
  return results.sort(
    (a, b) => a.uri.path.localeCompare(b.uri.path) || a.match.line - b.match.line,
  );
}
