import * as vscode from 'vscode';
import { FIRA_CODE_URL, fontDirectories, isFontInstalled } from './font-detect';
import {
  computeChanges,
  describeChange,
  recommendedSettings,
  renderSettings,
  TYPOGRAPHY_KEYS,
  type SettingValue,
  type TypographySettings,
} from './recommended';

const BACKUP_KEY = 'sugarCollage.typography.backup';
const SCHEME = 'sugar-collage';

/** Documentos virtuales de solo lectura para el diff de settings. */
class SettingsPreview implements vscode.TextDocumentContentProvider {
  private readonly docs = new Map<string, string>();
  private readonly emitter = new vscode.EventEmitter<vscode.Uri>();
  readonly onDidChange = this.emitter.event;

  set(uri: vscode.Uri, content: string): void {
    this.docs.set(uri.toString(), content);
    this.emitter.fire(uri);
  }

  provideTextDocumentContent(uri: vscode.Uri): string {
    return this.docs.get(uri.toString()) ?? '';
  }
}

/** Valores definidos por el usuario a nivel global (undefined = no está en settings.json). */
function readGlobal(): TypographySettings {
  const cfg = vscode.workspace.getConfiguration();
  return Object.fromEntries(
    TYPOGRAPHY_KEYS.map((key) => [key, cfg.inspect<SettingValue>(key)?.globalValue]),
  ) as TypographySettings;
}

async function writeGlobal(values: TypographySettings): Promise<void> {
  const cfg = vscode.workspace.getConfiguration();
  for (const key of TYPOGRAPHY_KEYS) {
    await cfg.update(key, values[key], vscode.ConfigurationTarget.Global);
  }
}

function recommendedFromConfig(): TypographySettings {
  const cfg = vscode.workspace.getConfiguration('sugarCollage.typography');
  return recommendedSettings({
    fontSize: cfg.get('fontSize', 14),
    lineHeight: cfg.get('lineHeight', 1.6),
    letterSpacing: cfg.get('letterSpacing', 0.3),
  });
}

async function offerFiraCode(): Promise<void> {
  if (isFontInstalled(fontDirectories())) return;
  const open = 'Abrir Google Fonts';
  const choice = await vscode.window.showWarningMessage(
    'No encontré Fira Code instalada en tu sistema. VS Code usará la siguiente fuente de la lista hasta que la instales.',
    open,
  );
  if (choice === open) await vscode.env.openExternal(vscode.Uri.parse(FIRA_CODE_URL));
}

async function applyTypography(
  context: vscode.ExtensionContext,
  preview: SettingsPreview,
): Promise<void> {
  const current = readGlobal();
  const next = recommendedFromConfig();
  const changes = computeChanges(current, next);
  if (changes.length === 0) {
    vscode.window.showInformationMessage('✦ Tu tipografía ya es la recomendada.');
    await offerFiraCode();
    return;
  }

  const left = vscode.Uri.parse(`${SCHEME}:/tipografia-actual.jsonc`);
  const right = vscode.Uri.parse(`${SCHEME}:/tipografia-recomendada.jsonc`);
  preview.set(left, renderSettings(current, 'Tu configuración actual (usuario)'));
  preview.set(right, renderSettings(next, 'Configuración recomendada por Sugar Collage'));
  await vscode.commands.executeCommand(
    'vscode.diff',
    left,
    right,
    'Sugar Collage: tipografía actual ↔ recomendada',
    {
      preview: true,
    },
  );

  const apply = 'Aplicar';
  const choice = await vscode.window.showInformationMessage(
    `¿Aplicar ${changes.length} cambio(s) tipográfico(s)?`,
    { modal: true, detail: changes.map(describeChange).join('\n') },
    apply,
  );
  if (choice !== apply) return;

  // Solo se guarda el respaldo la primera vez, para poder volver siempre a lo original.
  if (!context.globalState.get(BACKUP_KEY)) await context.globalState.update(BACKUP_KEY, current);
  await writeGlobal(next);
  vscode.window.showInformationMessage(
    '✦ Tipografía aplicada. Puedes volver atrás con "Sugar Collage: Restaurar configuración tipográfica".',
  );
  await offerFiraCode();
}

async function restoreTypography(context: vscode.ExtensionContext): Promise<void> {
  const backup = context.globalState.get<TypographySettings>(BACKUP_KEY);
  if (!backup) {
    vscode.window.showInformationMessage('No hay una configuración tipográfica previa guardada.');
    return;
  }
  const changes = computeChanges(readGlobal(), backup);
  const restore = 'Restaurar';
  const choice = await vscode.window.showInformationMessage(
    '¿Restaurar tu configuración tipográfica anterior?',
    { modal: true, detail: changes.map(describeChange).join('\n') || 'Sin cambios pendientes.' },
    restore,
  );
  if (choice !== restore) return;
  await writeGlobal(backup);
  await context.globalState.update(BACKUP_KEY, undefined);
  vscode.window.showInformationMessage('✦ Configuración tipográfica restaurada.');
}

export function registerTypography(context: vscode.ExtensionContext): void {
  const preview = new SettingsPreview();
  context.subscriptions.push(
    vscode.workspace.registerTextDocumentContentProvider(SCHEME, preview),
    vscode.commands.registerCommand('sugarCollage.applyTypography', () =>
      applyTypography(context, preview),
    ),
    vscode.commands.registerCommand('sugarCollage.restoreTypography', () =>
      restoreTypography(context),
    ),
  );
}
