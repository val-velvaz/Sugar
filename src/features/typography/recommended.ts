/** Configuración tipográfica recomendada y cálculo de cambios (sin dependencias de vscode). */
import { fonts } from '../../design/tokens';

export type SettingValue = string | number | boolean | undefined;

export interface TypographyOptions {
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
}

export const DEFAULT_OPTIONS: TypographyOptions = {
  fontSize: 14,
  lineHeight: 1.6,
  letterSpacing: 0.3,
};

export const TYPOGRAPHY_KEYS = [
  'editor.fontFamily',
  'editor.fontLigatures',
  'terminal.integrated.fontFamily',
  'editor.fontSize',
  'editor.lineHeight',
  'editor.letterSpacing',
] as const;

export type TypographyKey = (typeof TYPOGRAPHY_KEYS)[number];
export type TypographySettings = Record<TypographyKey, SettingValue>;

export function recommendedSettings(opts: TypographyOptions = DEFAULT_OPTIONS): TypographySettings {
  return {
    'editor.fontFamily': fonts.code,
    'editor.fontLigatures': "'calt', 'liga'",
    'terminal.integrated.fontFamily': fonts.code,
    'editor.fontSize': opts.fontSize,
    'editor.lineHeight': opts.lineHeight,
    'editor.letterSpacing': opts.letterSpacing,
  };
}

export interface SettingChange {
  key: TypographyKey;
  from: SettingValue;
  to: SettingValue;
}

/** Solo devuelve las claves cuyo valor cambia. */
export function computeChanges(
  current: TypographySettings,
  next: TypographySettings,
): SettingChange[] {
  return TYPOGRAPHY_KEYS.filter((key) => current[key] !== next[key]).map((key) => ({
    key,
    from: current[key],
    to: next[key],
  }));
}

/** JSON estilo settings.json para el diff (las claves sin valor se muestran como comentario). */
export function renderSettings(values: TypographySettings, title: string): string {
  const lines = TYPOGRAPHY_KEYS.map((key) =>
    values[key] === undefined
      ? `  // "${key}": (valor por defecto de VS Code)`
      : `  "${key}": ${JSON.stringify(values[key])},`,
  );
  return `// ${title}\n{\n${lines.join('\n')}\n}\n`;
}

export function describeChange(c: SettingChange): string {
  const show = (v: SettingValue) => (v === undefined ? '(por defecto)' : JSON.stringify(v));
  return `${c.key}: ${show(c.from)} → ${show(c.to)}`;
}
