import type * as vscode from 'vscode';
import { registerRainbowIndent } from './features/indent';
import { registerScrapbook } from './features/scrapbook';
import { registerThemeSwitcher } from './features/theme';
import { registerTypography } from './features/typography';
import { registerWashi } from './features/washi';

export function activate(context: vscode.ExtensionContext): void {
  registerTypography(context);
  registerThemeSwitcher(context);
  registerWashi(context);
  registerRainbowIndent(context);
  registerScrapbook(context);
}

export function deactivate(): void {}
