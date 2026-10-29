import * as vscode from 'vscode';
import type { PomodoroView } from '../../webviews/scrapbook/protocol';
import {
  addCookie,
  BREAK_OVER_MESSAGES,
  lastDays,
  pick,
  prune,
  SWEET_MESSAGES,
  type CookieHistory,
} from './stats';
import {
  DEFAULT_DURATIONS,
  formatClock,
  INITIAL_STATE,
  pause,
  PHASE_LABEL,
  remaining,
  reset,
  start,
  tick,
  type Durations,
  type TimerState,
} from './timer';

const STATE_KEY = 'sugarCollage.pomodoro.state';
const HISTORY_KEY = 'sugarCollage.pomodoro.history';
const SECTION = 'sugarCollage.pomodoro';

function durations(): Durations {
  const cfg = vscode.workspace.getConfiguration(SECTION);
  return {
    workMinutes: cfg.get('workMinutes', DEFAULT_DURATIONS.workMinutes),
    shortBreakMinutes: cfg.get('shortBreakMinutes', DEFAULT_DURATIONS.shortBreakMinutes),
    longBreakMinutes: cfg.get('longBreakMinutes', DEFAULT_DURATIONS.longBreakMinutes),
    longBreakEvery: cfg.get('longBreakEvery', DEFAULT_DURATIONS.longBreakEvery),
  };
}

export class PomodoroService implements vscode.Disposable {
  private state: TimerState;
  private readonly item: vscode.StatusBarItem;
  private interval: ReturnType<typeof setInterval> | undefined;
  private readonly changed = new vscode.EventEmitter<void>();
  readonly onDidChange = this.changed.event;
  private readonly disposables: vscode.Disposable[] = [];

  constructor(private readonly context: vscode.ExtensionContext) {
    this.state = context.globalState.get<TimerState>(STATE_KEY, INITIAL_STATE);
    this.item = vscode.window.createStatusBarItem(
      'sugarCollage.pomodoro',
      vscode.StatusBarAlignment.Right,
      100,
    );
    this.item.name = 'Pomodoro Galletita';
    this.item.command = 'sugarCollage.pomodoro.toggle';
    this.disposables.push(
      this.item,
      this.changed,
      vscode.workspace.onDidChangeConfiguration((e) => {
        if (!e.affectsConfiguration(SECTION)) return;
        this.applyVisibility();
        this.render();
      }),
    );
    this.applyVisibility();
    // Si la ventana se recargó con el temporizador corriendo, se retoma (o se cierra la fase si ya venció).
    if (this.state.status === 'running') this.startTicking();
    this.render();
  }

  private applyVisibility(): void {
    if (vscode.workspace.getConfiguration(SECTION).get('showInStatusBar', true)) this.item.show();
    else this.item.hide();
  }

  private save(): void {
    void this.context.globalState.update(STATE_KEY, this.state);
    this.changed.fire();
  }

  history(): CookieHistory {
    return this.context.globalState.get<CookieHistory>(HISTORY_KEY, {});
  }

  snapshot(): PomodoroView {
    return {
      phase: this.state.phase,
      status: this.state.status,
      remainingMs: remaining(this.state, Date.now(), durations()),
      ...(this.state.status === 'running' && this.state.endsAt !== undefined
        ? { endsAt: this.state.endsAt }
        : {}),
      week: lastDays(this.history(), new Date()),
    };
  }

  private startTicking(): void {
    if (this.interval) return;
    this.interval = setInterval(() => this.onTick(), 1000);
    this.onTick();
  }

  private stopTicking(): void {
    if (this.interval) clearInterval(this.interval);
    this.interval = undefined;
  }

  private onTick(): void {
    const autoStart = vscode.workspace.getConfiguration(SECTION).get('autoStartNext', false);
    const result = tick(this.state, Date.now(), durations(), autoStart);
    if (result.finished) {
      this.state = result.state;
      if (this.state.status !== 'running') this.stopTicking();
      this.save();
      void this.celebrate(result.finished);
    }
    this.render();
  }

  private async celebrate(finished: TimerState['phase']): Promise<void> {
    if (finished === 'trabajo') {
      const now = new Date();
      const history = prune(addCookie(this.history(), now), now);
      await this.context.globalState.update(HISTORY_KEY, history);
      this.changed.fire();
      const today = lastDays(history, now, 1)[0]?.count ?? 0;
      const next = this.state.phase === 'descansoLargo' ? 'Descanso largo' : 'Descanso';
      const choice = await vscode.window.showInformationMessage(
        `🍪 ${pick(SWEET_MESSAGES)} Galletas de hoy: ${today}.`,
        ...(this.state.status === 'running' ? [] : [next]),
        'Ver mi frasco',
      );
      if (choice === next) this.start();
      if (choice === 'Ver mi frasco')
        await vscode.commands.executeCommand('sugarCollage.openScrapbook');
    } else {
      const choice = await vscode.window.showInformationMessage(
        `✦ ${pick(BREAK_OVER_MESSAGES)}`,
        ...(this.state.status === 'running' ? [] : ['Otra ronda']),
      );
      if (choice === 'Otra ronda') this.start();
    }
  }

  private render(): void {
    const s = this.state;
    const left = formatClock(remaining(s, Date.now(), durations()));
    const icon = s.phase === 'trabajo' ? '🍪' : s.phase === 'descanso' ? '🥛' : '🧁';
    this.item.text = s.status === 'paused' ? `${icon} $(debug-pause) ${left}` : `${icon} ${left}`;
    const today = lastDays(this.history(), new Date(), 1)[0]?.count ?? 0;
    const md = new vscode.MarkdownString(undefined, true);
    md.isTrusted = {
      enabledCommands: [
        'sugarCollage.pomodoro.toggle',
        'sugarCollage.pomodoro.reset',
        'sugarCollage.openScrapbook',
      ],
    };
    const action = s.status === 'running' ? '$(debug-pause) Pausar' : '$(play) Empezar';
    md.appendMarkdown(`**Pomodoro Galletita** · ${PHASE_LABEL[s.phase]}\n\n`);
    md.appendMarkdown(`Galletas de hoy: **${today}** 🍪\n\n`);
    md.appendMarkdown(
      `[${action}](command:sugarCollage.pomodoro.toggle) · [$(debug-restart) Reiniciar](command:sugarCollage.pomodoro.reset) · [$(graph) Estadísticas](command:sugarCollage.openScrapbook)`,
    );
    this.item.tooltip = md;
    this.item.accessibilityInformation = {
      label: `Pomodoro: ${PHASE_LABEL[s.phase]}, ${s.status === 'paused' ? 'en pausa, ' : ''}quedan ${left}`,
    };
  }

  start(): void {
    this.state = start(this.state, Date.now(), durations());
    this.save();
    this.startTicking();
  }

  pause(): void {
    this.state = pause(this.state, Date.now(), durations());
    this.stopTicking();
    this.save();
    this.render();
  }

  toggle(): void {
    if (this.state.status === 'running') this.pause();
    else this.start();
  }

  reset(): void {
    this.state = reset(this.state);
    this.stopTicking();
    this.save();
    this.render();
  }

  dispose(): void {
    this.stopTicking();
    vscode.Disposable.from(...this.disposables).dispose();
  }
}

export function registerPomodoro(context: vscode.ExtensionContext): PomodoroService {
  const service = new PomodoroService(context);
  context.subscriptions.push(
    service,
    vscode.commands.registerCommand('sugarCollage.pomodoro.start', () => service.start()),
    vscode.commands.registerCommand('sugarCollage.pomodoro.pause', () => service.pause()),
    vscode.commands.registerCommand('sugarCollage.pomodoro.toggle', () => service.toggle()),
    vscode.commands.registerCommand('sugarCollage.pomodoro.reset', () => service.reset()),
  );
  return service;
}
