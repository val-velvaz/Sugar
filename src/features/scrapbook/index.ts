import * as vscode from 'vscode';
import { renderPage } from '../../webviews/shared/html';
import {
  parseFromWebview,
  type FromWebview,
  type ScrapbookBackground,
  type ScrapbookState,
  type TodoItem,
  type ToWebview,
} from '../../webviews/scrapbook/protocol';
import type { PomodoroService } from '../pomodoro';
import { revealTag } from '../washi';
import { scanWorkspace } from '../washi/todos';
import { washiTags, type WashiTag } from '../../design/tokens';
import { ScrapbookStore } from './store';

export const SCRAPBOOK_VIEW = 'sugarCollage.scrapbook';

export function sparkleLevel(): 0 | 1 | 2 | 3 {
  const v = vscode.workspace.getConfiguration('sugarCollage').get<number>('sparkleLevel', 2);
  return Math.min(3, Math.max(0, Math.round(v))) as 0 | 1 | 2 | 3;
}

function background(): ScrapbookBackground {
  return vscode.workspace
    .getConfiguration('sugarCollage.scrapbook')
    .get('background', 'cuadricula');
}

class ScrapbookProvider implements vscode.WebviewViewProvider, vscode.Disposable {
  private view: vscode.WebviewView | undefined;
  private readonly store: ScrapbookStore;
  private readonly disposables: vscode.Disposable[] = [];
  private saveTimer: ReturnType<typeof setTimeout> | undefined;

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly pomodoro: PomodoroService,
  ) {
    this.store = new ScrapbookStore(
      context.globalState,
      vscode.workspace.workspaceFolders?.length ? context.workspaceState : undefined,
    );
    this.disposables.push(
      // Cambios del temporizador (empezar, pausar, galleta ganada) se reflejan en la sección Galletitas.
      pomodoro.onDidChange(() => {
        if (this.view?.visible) this.postState();
      }),
      vscode.workspace.onDidChangeConfiguration((e) => {
        if (
          e.affectsConfiguration('sugarCollage.scrapbook') ||
          e.affectsConfiguration('sugarCollage.sparkleLevel')
        ) {
          this.postState();
        }
      }),
      // Los pendientes se refrescan al guardar, con calma, solo si el panel está a la vista.
      vscode.workspace.onDidSaveTextDocument(() => {
        if (!this.view?.visible) return;
        if (this.saveTimer) clearTimeout(this.saveTimer);
        this.saveTimer = setTimeout(() => void this.sendTodos(), 1500);
      }),
    );
  }

  resolveWebviewView(view: vscode.WebviewView): void {
    this.view = view;
    const { extensionUri } = this.context;
    view.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(extensionUri, 'media'),
        vscode.Uri.joinPath(extensionUri, 'dist'),
      ],
    };
    view.webview.html = renderPage({
      webview: view.webview,
      extensionUri,
      title: 'Mi Scrapbook',
      styles: ['media/webviews/common.css', 'media/webviews/scrapbook.css'],
      script: 'dist/webviews/scrapbook.js',
    });
    view.webview.onDidReceiveMessage(
      (raw) => {
        const msg = parseFromWebview(raw);
        if (msg) void this.handle(msg);
      },
      undefined,
      this.disposables,
    );
    view.onDidChangeVisibility(
      () => {
        if (view.visible) this.postState();
      },
      undefined,
      this.disposables,
    );
    view.onDidDispose(() => (this.view = undefined), undefined, this.disposables);
  }

  private post(msg: ToWebview): void {
    void this.view?.webview.postMessage(msg);
  }

  private state(): ScrapbookState {
    return {
      notes: this.store.notes(),
      tasks: this.store.tasks(),
      hasWorkspace: this.store.hasWorkspace,
      background: background(),
      sparkleLevel: sparkleLevel(),
      pomodoro: this.pomodoro.snapshot(),
    };
  }

  postState(): void {
    this.post({ type: 'state', state: this.state() });
  }

  private async sendTodos(): Promise<void> {
    if (!vscode.workspace.workspaceFolders?.length) {
      this.post({ type: 'todos', todos: [], scanning: false });
      return;
    }
    this.post({ type: 'todos', todos: [], scanning: true });
    const tags = vscode.workspace
      .getConfiguration('sugarCollage.washi')
      .get<string[]>('tags', [...washiTags])
      .filter((t): t is WashiTag => (washiTags as readonly string[]).includes(t));
    const found = await scanWorkspace(tags);
    const todos: TodoItem[] = found.map(({ uri, match }) => ({
      tag: match.tag,
      text: match.text,
      file: vscode.workspace.asRelativePath(uri),
      line: match.line,
      uri: uri.toString(),
      tagStart: match.tagStart,
      end: match.end,
    }));
    this.post({ type: 'todos', todos, scanning: false });
  }

  async addNote(scope: 'workspace' | 'global', text = ''): Promise<void> {
    const note = await this.store.addNote(scope, text);
    this.postState();
    this.post({ type: 'focusNewNote', id: note.id });
  }

  private async handle(msg: FromWebview): Promise<void> {
    switch (msg.type) {
      case 'ready':
        this.postState();
        void this.sendTodos();
        return;
      case 'note/add':
        await this.addNote(msg.scope);
        return;
      case 'note/update':
        // Al escribir no se reenvía el estado: el webview ya tiene el texto y así no pierde el cursor.
        await this.store.updateNote(msg.id, msg.patch);
        if (msg.patch.text === undefined) this.postState();
        return;
      case 'note/delete':
        await this.store.deleteNote(msg.id);
        break;
      case 'task/add':
        await this.store.addTask(msg.text);
        break;
      case 'task/toggle':
        await this.store.toggleTask(msg.id);
        break;
      case 'task/delete':
        await this.store.deleteTask(msg.id);
        break;
      case 'task/clearDone':
        await this.store.clearDone();
        break;
      case 'todos/refresh':
        await this.sendTodos();
        return;
      case 'pomodoro/toggle':
        this.pomodoro.toggle();
        return;
      case 'pomodoro/reset':
        this.pomodoro.reset();
        return;
      case 'todos/open':
        await revealTag({
          uri: vscode.Uri.parse(msg.item.uri),
          match: { line: msg.item.line, tagStart: msg.item.tagStart, end: msg.item.end },
        });
        return;
      case 'background/set':
        await vscode.workspace
          .getConfiguration('sugarCollage.scrapbook')
          .update('background', msg.value, vscode.ConfigurationTarget.Global);
        return;
    }
    this.postState();
  }

  dispose(): void {
    if (this.saveTimer) clearTimeout(this.saveTimer);
    vscode.Disposable.from(...this.disposables).dispose();
  }
}

export function registerScrapbook(
  context: vscode.ExtensionContext,
  pomodoro: PomodoroService,
): void {
  const provider = new ScrapbookProvider(context, pomodoro);
  context.subscriptions.push(
    provider,
    vscode.window.registerWebviewViewProvider(SCRAPBOOK_VIEW, provider, {
      webviewOptions: { retainContextWhenHidden: false },
    }),
    vscode.commands.registerCommand('sugarCollage.openScrapbook', () =>
      vscode.commands.executeCommand(`${SCRAPBOOK_VIEW}.focus`),
    ),
    vscode.commands.registerCommand('sugarCollage.addNote', async () => {
      const text = await vscode.window.showInputBox({
        title: 'Sugar Collage: nueva nota',
        prompt: 'Texto de la nota (se guarda en este workspace)',
        placeHolder: 'Comprar galletas ✦',
      });
      if (text === undefined) return;
      await vscode.commands.executeCommand(`${SCRAPBOOK_VIEW}.focus`);
      await provider.addNote('workspace', text);
    }),
  );
}
