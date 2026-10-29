import type * as vscode from 'vscode';
import { registerThemeSwitcher } from './features/theme';
import { registerTypography } from './features/typography';

export function activate(context: vscode.ExtensionContext): void {
  registerTypography(context);
  registerThemeSwitcher(context);
}

export function deactivate(): void {}
