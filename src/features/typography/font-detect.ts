/** Busca archivos de Fira Code en las carpetas de fuentes del sistema (sin dependencias de vscode). */
import { readdirSync, type Dirent } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

export function fontDirectories(
  platform: NodeJS.Platform = process.platform,
  env: NodeJS.ProcessEnv = process.env,
  home: string = homedir(),
): string[] {
  switch (platform) {
    case 'win32':
      return [
        join(env.WINDIR ?? 'C:\\Windows', 'Fonts'),
        join(env.LOCALAPPDATA ?? join(home, 'AppData', 'Local'), 'Microsoft', 'Windows', 'Fonts'),
      ];
    case 'darwin':
      return [join(home, 'Library', 'Fonts'), '/Library/Fonts', '/System/Library/Fonts'];
    default:
      return [
        join(home, '.local', 'share', 'fonts'),
        join(home, '.fonts'),
        '/usr/share/fonts',
        '/usr/local/share/fonts',
      ];
  }
}

const FONT_FILE = /fira[\s_-]?code.*\.(ttf|otf|ttc|woff2?)$/i;

/** Recorre cada carpeta hasta `maxDepth` niveles (en Linux las fuentes suelen estar en subcarpetas). */
export function isFontInstalled(
  dirs: string[],
  pattern: RegExp = FONT_FILE,
  maxDepth = 3,
): boolean {
  const visit = (dir: string, depth: number): boolean => {
    let entries: Dirent[];
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return false;
    }
    for (const e of entries) {
      if (e.isFile() && pattern.test(e.name)) return true;
    }
    return (
      depth < maxDepth &&
      entries.some((e) => e.isDirectory() && visit(join(dir, e.name), depth + 1))
    );
  };
  return dirs.some((d) => visit(d, 0));
}

export const FIRA_CODE_URL = 'https://fonts.google.com/specimen/Fira+Code';
