import * as vscode from 'vscode';
import { withAlpha } from '../../design/color';
import { decorationIconName, DECORATION_DIR } from '../../design/decoration-icons';
import {
  washi,
  washiAlpha,
  washiTags,
  washiText,
  washiWordColor,
  type WashiTag,
} from '../../design/tokens';
import { findTagInLine, findTags, type TagMatch } from './tags';
import { scanWorkspace, type WorkspaceTag } from './todos';

const SECTION = 'sugarCollage.washi';

interface WashiConfig {
  enabled: boolean;
  tags: WashiTag[];
  gutterIcons: boolean;
}

function readConfig(): WashiConfig {
  const cfg = vscode.workspace.getConfiguration(SECTION);
  const tags = cfg
    .get<string[]>('tags', [...washiTags])
    .filter((t): t is WashiTag => (washiTags as readonly string[]).includes(t));
  return { enabled: cfg.get('enabled', true), tags, gutterIcons: cfg.get('gutterIcons', true) };
}

interface TagStyles {
  tape: vscode.TextEditorDecorationType;
  word: vscode.TextEditorDecorationType;
}

function createStyles(
  context: vscode.ExtensionContext,
  cfg: WashiConfig,
): Map<WashiTag, TagStyles> {
  const styles = new Map<WashiTag, TagStyles>();
  for (const tag of washiTags) {
    const w = washi[tag];
    const icon = vscode.Uri.joinPath(
      context.extensionUri,
      DECORATION_DIR,
      `${decorationIconName(tag)}.svg`,
    );
    const tape = vscode.window.createTextEditorDecorationType({
      borderRadius: '4px',
      overviewRulerLane: vscode.OverviewRulerLane.Right,
      rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
      ...(cfg.gutterIcons ? { gutterIconPath: icon, gutterIconSize: '80%' } : {}),
      // El texto sobre la cinta usa el color base: el niebla de los comentarios no alcanza 4.5:1 ahí.
      dark: {
        backgroundColor: withAlpha(w.tape, washiAlpha.dark),
        color: washiText.dark,
        overviewRulerColor: w.tape,
      },
      light: {
        backgroundColor: withAlpha(w.tape, washiAlpha.light),
        color: washiText.light,
        overviewRulerColor: w.ink,
      },
    });
    const word = vscode.window.createTextEditorDecorationType({
      fontWeight: '800',
      dark: { color: washiWordColor(tag, 'dark') },
      light: { color: washiWordColor(tag, 'light') },
    });
    styles.set(tag, { tape, word });
  }
  return styles;
}

class WashiDecorator implements vscode.Disposable {
  private styles: Map<WashiTag, TagStyles>;
  private config = readConfig();
  private pending: ReturnType<typeof setTimeout> | undefined;
  private readonly disposables: vscode.Disposable[] = [];

  constructor(private readonly context: vscode.ExtensionContext) {
    this.styles = createStyles(context, this.config);
    this.disposables.push(
      vscode.window.onDidChangeVisibleTextEditors(() => this.schedule(0)),
      vscode.workspace.onDidChangeTextDocument((e) => {
        if (vscode.window.visibleTextEditors.some((ed) => ed.document === e.document))
          this.schedule(150);
      }),
      vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration(SECTION)) this.reload();
      }),
    );
    this.schedule(0);
  }

  private reload(): void {
    for (const s of this.styles.values()) {
      s.tape.dispose();
      s.word.dispose();
    }
    this.config = readConfig();
    this.styles = createStyles(this.context, this.config);
    this.schedule(0);
  }

  private schedule(delay: number): void {
    if (this.pending) clearTimeout(this.pending);
    this.pending = setTimeout(() => this.decorateAll(), delay);
  }

  private decorateAll(): void {
    for (const editor of vscode.window.visibleTextEditors) this.decorate(editor);
  }

  private decorate(editor: vscode.TextEditor): void {
    const doc = editor.document;
    const matches = this.config.enabled
      ? findTags(doc.getText(), doc.languageId, this.config.tags)
      : [];
    for (const tag of washiTags) {
      const style = this.styles.get(tag);
      if (!style) continue;
      const own = matches.filter((m) => m.tag === tag);
      editor.setDecorations(
        style.tape,
        own.map((m) => new vscode.Range(m.line, m.tagStart, m.line, m.end)),
      );
      editor.setDecorations(
        style.word,
        own.map((m) => new vscode.Range(m.line, m.tagStart, m.line, m.tagEnd)),
      );
    }
  }

  dispose(): void {
    if (this.pending) clearTimeout(this.pending);
    for (const s of this.styles.values()) {
      s.tape.dispose();
      s.word.dispose();
    }
    vscode.Disposable.from(...this.disposables).dispose();
  }
}

const commandLink = (command: string, args: unknown[], label: string) =>
  `[${label}](command:${command}?${encodeURIComponent(JSON.stringify(args))})`;

class WashiHover implements vscode.HoverProvider {
  provideHover(doc: vscode.TextDocument, pos: vscode.Position): vscode.Hover | undefined {
    const cfg = readConfig();
    if (!cfg.enabled) return undefined;
    const m = findTagInLine(doc.lineAt(pos.line).text, pos.line, doc.languageId);
    if (!m || !cfg.tags.includes(m.tag) || pos.character < m.tagStart || pos.character > m.end)
      return undefined;
    const w = washi[m.tag];
    const md = new vscode.MarkdownString(undefined, true);
    md.isTrusted = {
      enabledCommands: [
        'sugarCollage.completeTag',
        'sugarCollage.showTodos',
        'workbench.action.findInFiles',
      ],
    };
    md.appendMarkdown(`**✦ ${m.tag} · ${w.name}**\n\n`);
    if (m.text) md.appendMarkdown(`${m.text.replace(/[\\`*_[\]]/g, '\\$&')}\n\n`);
    md.appendMarkdown(
      [
        commandLink(
          'sugarCollage.completeTag',
          [doc.uri.toString(), m.line],
          '$(check) Marcar como hecho',
        ),
        commandLink('sugarCollage.showTodos', [], '$(list-unordered) Mis pendientes'),
        commandLink(
          'workbench.action.findInFiles',
          [{ query: m.tag, isRegex: false, matchWholeWord: true }],
          '$(search) Buscar en el workspace',
        ),
      ].join(' · '),
    );
    return new vscode.Hover(md, new vscode.Range(m.line, m.tagStart, m.line, m.end));
  }
}

/** Reemplaza la etiqueta por "DONE ✓": deja de decorarse y queda constancia en el código. */
async function completeTag(uriString: string, line: number): Promise<void> {
  const uri = vscode.Uri.parse(uriString);
  const doc = await vscode.workspace.openTextDocument(uri);
  const m = findTagInLine(doc.lineAt(line).text, line, doc.languageId);
  if (!m) return;
  const edit = new vscode.WorkspaceEdit();
  edit.replace(uri, new vscode.Range(line, m.tagStart, line, m.tagEnd), 'DONE ✓');
  await vscode.workspace.applyEdit(edit);
}

export async function revealTag(t: {
  uri: vscode.Uri;
  match: Pick<TagMatch, 'line' | 'tagStart' | 'end'>;
}): Promise<void> {
  const doc = await vscode.workspace.openTextDocument(t.uri);
  const range = new vscode.Range(t.match.line, t.match.tagStart, t.match.line, t.match.end);
  await vscode.window.showTextDocument(doc, { selection: range, preview: true });
}

async function showTodos(): Promise<void> {
  const cfg = readConfig();
  const found = await vscode.window.withProgress(
    { location: vscode.ProgressLocation.Window, title: '✦ Buscando pendientes…' },
    () => scanWorkspace(cfg.tags),
  );
  if (found.length === 0) {
    vscode.window.showInformationMessage(
      '✦ No hay pendientes en este workspace. ¡Galletita para ti! 🍪',
    );
    return;
  }
  type Item = vscode.QuickPickItem & { tag?: WorkspaceTag };
  const items: Item[] = [];
  for (const tag of washiTags) {
    const own = found.filter((f) => f.match.tag === tag);
    if (own.length === 0) continue;
    items.push({
      label: `${tag} · ${washi[tag].name} (${own.length})`,
      kind: vscode.QuickPickItemKind.Separator,
    });
    for (const f of own) {
      items.push({
        label: f.match.text || f.match.tag,
        description: `${vscode.workspace.asRelativePath(f.uri)}:${f.match.line + 1}`,
        tag: f,
      });
    }
  }
  const pick = await vscode.window.showQuickPick(items, {
    title: `Sugar Collage: mis pendientes (${found.length})`,
    placeHolder: 'Elige uno para ir a su línea',
    matchOnDescription: true,
  });
  if (pick?.tag) await revealTag(pick.tag);
}

export function registerWashi(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    new WashiDecorator(context),
    vscode.languages.registerHoverProvider({ scheme: 'file' }, new WashiHover()),
    vscode.languages.registerHoverProvider({ scheme: 'untitled' }, new WashiHover()),
    vscode.commands.registerCommand('sugarCollage.completeTag', completeTag),
    vscode.commands.registerCommand('sugarCollage.showTodos', showTodos),
    vscode.commands.registerCommand('sugarCollage.toggleWashi', async () => {
      const cfg = vscode.workspace.getConfiguration(SECTION);
      await cfg.update('enabled', !cfg.get('enabled', true), vscode.ConfigurationTarget.Global);
    }),
  );
}

export type { TagMatch };
