import * as vscode from 'vscode';
import { rainbow } from '../../design/tokens';
import { indentSegments, rainbowColors, type Intensity } from './levels';

const SECTION = 'sugarCollage.indent';
/** Líneas extra por encima y por debajo de lo visible, para que el scroll no muestre huecos. */
const MARGIN = 30;

interface IndentConfig {
  enabled: boolean;
  mode: 'guias' | 'fondo';
  opacity: number;
  intensity: Intensity;
  excludeLanguages: string[];
}

function readConfig(): IndentConfig {
  const cfg = vscode.workspace.getConfiguration(SECTION);
  return {
    enabled: cfg.get('enabled', true),
    mode: cfg.get('mode', 'guias'),
    opacity: cfg.get('opacity', 0.45),
    intensity: cfg.get('intensity', 'suave'),
    excludeLanguages: cfg.get('excludeLanguages', ['plaintext']),
  };
}

function createTypes(cfg: IndentConfig): vscode.TextEditorDecorationType[] {
  const dark = rainbowColors('dark', cfg.intensity, cfg.opacity);
  const light = rainbowColors('light', cfg.intensity, cfg.opacity);
  const style = (color: string): vscode.ThemableDecorationRenderOptions =>
    cfg.mode === 'guias'
      ? { borderColor: color, borderStyle: 'solid', borderWidth: '0 0 0 2px' }
      : { backgroundColor: color };
  return rainbow.pastel.map((_, i) =>
    vscode.window.createTextEditorDecorationType({
      rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
      dark: style(dark[i] ?? ''),
      light: style(light[i] ?? ''),
    }),
  );
}

class RainbowIndent implements vscode.Disposable {
  private config = readConfig();
  private types = createTypes(this.config);
  private pending = new Map<vscode.TextEditor, ReturnType<typeof setTimeout>>();
  private readonly disposables: vscode.Disposable[] = [];

  constructor() {
    this.disposables.push(
      vscode.window.onDidChangeVisibleTextEditors((eds) => eds.forEach((e) => this.schedule(e, 0))),
      vscode.window.onDidChangeTextEditorVisibleRanges((e) => this.schedule(e.textEditor, 40)),
      vscode.window.onDidChangeTextEditorOptions((e) => this.schedule(e.textEditor, 0)),
      vscode.workspace.onDidChangeTextDocument((e) => {
        for (const ed of vscode.window.visibleTextEditors)
          if (ed.document === e.document) this.schedule(ed, 80);
      }),
      vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration(SECTION)) this.reload();
      }),
    );
    vscode.window.visibleTextEditors.forEach((e) => this.schedule(e, 0));
  }

  private reload(): void {
    this.types.forEach((t) => t.dispose());
    this.config = readConfig();
    this.types = createTypes(this.config);
    vscode.window.visibleTextEditors.forEach((e) => this.schedule(e, 0));
  }

  private schedule(editor: vscode.TextEditor, delay: number): void {
    const prev = this.pending.get(editor);
    if (prev) clearTimeout(prev);
    this.pending.set(
      editor,
      setTimeout(() => {
        this.pending.delete(editor);
        this.decorate(editor);
      }, delay),
    );
  }

  private decorate(editor: vscode.TextEditor): void {
    const buckets: vscode.Range[][] = this.types.map(() => []);
    const doc = editor.document;
    if (this.config.enabled && !this.config.excludeLanguages.includes(doc.languageId)) {
      const tabSize = Number(editor.options.tabSize) || 4;
      for (const visible of editor.visibleRanges) {
        const from = Math.max(0, visible.start.line - MARGIN);
        const to = Math.min(doc.lineCount - 1, visible.end.line + MARGIN);
        for (let line = from; line <= to; line++) {
          for (const s of indentSegments(doc.lineAt(line).text, tabSize)) {
            buckets[s.level % buckets.length]?.push(new vscode.Range(line, s.start, line, s.end));
          }
        }
      }
    }
    this.types.forEach((t, i) => editor.setDecorations(t, buckets[i] ?? []));
  }

  dispose(): void {
    this.pending.forEach((t) => clearTimeout(t));
    this.types.forEach((t) => t.dispose());
    vscode.Disposable.from(...this.disposables).dispose();
  }
}

export function registerRainbowIndent(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    new RainbowIndent(),
    vscode.commands.registerCommand('sugarCollage.toggleIndentRainbow', async () => {
      const cfg = vscode.workspace.getConfiguration(SECTION);
      await cfg.update('enabled', !cfg.get('enabled', true), vscode.ConfigurationTarget.Global);
    }),
  );
}
