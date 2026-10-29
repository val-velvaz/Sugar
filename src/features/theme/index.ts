import * as vscode from 'vscode';
import { themes } from '../../design/tokens';
import { isDaytime, msUntilNextSwitch } from './schedule';

type AutoMode = 'off' | 'hora' | 'sistema';

const SECTION = 'sugarCollage.autoTheme';

interface AutoConfig {
  mode: AutoMode;
  lightTheme: string;
  darkTheme: string;
  dayStart: string;
  nightStart: string;
}

function readAuto(): AutoConfig {
  const cfg = vscode.workspace.getConfiguration(SECTION);
  return {
    mode: cfg.get<AutoMode>('mode', 'off'),
    lightTheme: cfg.get('lightTheme', 'Sugar Collage Light – Algodón'),
    darkTheme: cfg.get('darkTheme', 'Sugar Collage Dark'),
    dayStart: cfg.get('dayStart', '07:00'),
    nightStart: cfg.get('nightStart', '19:30'),
  };
}

const global = vscode.ConfigurationTarget.Global;

async function setColorTheme(label: string): Promise<void> {
  const cfg = vscode.workspace.getConfiguration();
  // Con autoDetectColorScheme activo, VS Code ignora workbench.colorTheme.
  if (cfg.get('window.autoDetectColorScheme'))
    await cfg.update('window.autoDetectColorScheme', false, global);
  if (cfg.get('workbench.colorTheme') !== label)
    await cfg.update('workbench.colorTheme', label, global);
}

async function enableSystemSync(auto: AutoConfig): Promise<void> {
  const cfg = vscode.workspace.getConfiguration();
  await cfg.update('workbench.preferredLightColorTheme', auto.lightTheme, global);
  await cfg.update('workbench.preferredDarkColorTheme', auto.darkTheme, global);
  await cfg.update('window.autoDetectColorScheme', true, global);
}

/** Aplica el modo automático y programa el siguiente cambio de día/noche. */
class AutoThemeController implements vscode.Disposable {
  private timer: ReturnType<typeof setTimeout> | undefined;

  async refresh(): Promise<void> {
    this.clear();
    const auto = readAuto();
    if (auto.mode !== 'hora') return;
    try {
      const now = new Date();
      await setColorTheme(isDaytime(now, auto) ? auto.lightTheme : auto.darkTheme);
      this.timer = setTimeout(() => void this.refresh(), msUntilNextSwitch(now, auto));
    } catch (err) {
      vscode.window.showErrorMessage(`Sugar Collage: ${(err as Error).message}`);
    }
  }

  private clear(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = undefined;
  }

  dispose(): void {
    this.clear();
  }
}

interface ThemeItem extends vscode.QuickPickItem {
  action: { kind: 'theme'; label: string } | { kind: 'auto'; mode: Exclude<AutoMode, 'off'> };
}

async function selectTheme(controller: AutoThemeController): Promise<void> {
  const cfg = vscode.workspace.getConfiguration();
  const original = cfg.get<string>('workbench.colorTheme');
  const auto = readAuto();

  const themeItems: ThemeItem[] = themes.map((t) => ({
    label: `${t.swatch}  ${t.label}`,
    description: t.kind === 'dark' ? 'oscuro' : 'claro',
    detail: t.description,
    picked: t.label === original,
    action: { kind: 'theme', label: t.label },
  }));
  const autoItems: ThemeItem[] = [
    {
      label: '$(clock)  Automático por hora del día',
      description: auto.mode === 'hora' ? 'activo' : '',
      detail: `Claro desde las ${auto.dayStart} (${auto.lightTheme}) y oscuro desde las ${auto.nightStart} (${auto.darkTheme}).`,
      action: { kind: 'auto', mode: 'hora' },
    },
    {
      label: '$(device-desktop)  Sincronizar con el sistema',
      description: auto.mode === 'sistema' ? 'activo' : '',
      detail: 'Usa window.autoDetectColorScheme con tus temas claro y oscuro preferidos.',
      action: { kind: 'auto', mode: 'sistema' },
    },
  ];

  const qp = vscode.window.createQuickPick<ThemeItem>();
  qp.title = 'Sugar Collage: elige tu variante';
  qp.placeholder = 'Recorre la lista para previsualizar; Esc para cancelar';
  qp.matchOnDetail = true;
  qp.items = [
    ...themeItems,
    {
      label: 'Modos automáticos',
      kind: vscode.QuickPickItemKind.Separator,
      action: { kind: 'auto', mode: 'hora' },
    },
    ...autoItems,
  ];
  const active = themeItems.find((i) => i.picked);
  if (active) qp.activeItems = [active];

  let accepted = false;
  const previewing = !cfg.get('window.autoDetectColorScheme');
  qp.onDidChangeActive(([item]) => {
    if (previewing && item?.action.kind === 'theme') {
      void cfg.update('workbench.colorTheme', item.action.label, global);
    }
  });
  qp.onDidAccept(async () => {
    const item = qp.selectedItems[0];
    if (!item) return;
    accepted = true;
    qp.hide();
    const autoCfg = vscode.workspace.getConfiguration(SECTION);
    if (item.action.kind === 'theme') {
      if (auto.mode !== 'off') await autoCfg.update('mode', 'off', global);
      await setColorTheme(item.action.label);
      return;
    }
    await autoCfg.update('mode', item.action.mode, global);
    if (item.action.mode === 'sistema') {
      await enableSystemSync(auto);
      vscode.window.showInformationMessage(
        `✦ Sincronizado con el sistema: ${auto.lightTheme} / ${auto.darkTheme}.`,
      );
    } else {
      await controller.refresh();
      const configure = 'Configurar horas';
      const choice = await vscode.window.showInformationMessage(
        `✦ Tema automático: claro desde las ${auto.dayStart}, oscuro desde las ${auto.nightStart}.`,
        configure,
      );
      if (choice === configure)
        await vscode.commands.executeCommand('workbench.action.openSettings', SECTION);
    }
  });
  qp.onDidHide(() => {
    if (!accepted && previewing && original)
      void cfg.update('workbench.colorTheme', original, global);
    qp.dispose();
  });
  qp.show();
}

export function registerThemeSwitcher(context: vscode.ExtensionContext): void {
  const controller = new AutoThemeController();
  context.subscriptions.push(
    controller,
    vscode.commands.registerCommand('sugarCollage.selectTheme', () => selectTheme(controller)),
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(SECTION)) void controller.refresh();
    }),
  );
  void controller.refresh();
}
