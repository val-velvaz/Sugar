/** Convierte un ThemeSpec en el JSON de tema que entiende VS Code. */
import { mix, withAlpha, type Hex } from './color';
import type { SyntaxRole, ThemeSpec } from './tokens';

export interface TokenColor {
  name: string;
  scope: string[];
  settings: { foreground?: Hex; fontStyle?: string };
}

export interface VsCodeTheme {
  $schema: string;
  name: string;
  type: 'dark' | 'light';
  semanticHighlighting: true;
  colors: Record<string, Hex>;
  tokenColors: TokenColor[];
  semanticTokenColors: Record<
    string,
    | Hex
    | {
        foreground: Hex;
        fontStyle?: string;
        italic?: boolean;
        bold?: boolean;
        underline?: boolean;
        strikethrough?: boolean;
      }
  >;
}

const ANSI_KEYS = [
  'Black',
  'Red',
  'Green',
  'Yellow',
  'Blue',
  'Magenta',
  'Cyan',
  'White',
  'BrightBlack',
  'BrightRed',
  'BrightGreen',
  'BrightYellow',
  'BrightBlue',
  'BrightMagenta',
  'BrightCyan',
  'BrightWhite',
] as const;

export function buildColors(spec: ThemeSpec): Record<string, Hex> {
  const u = spec.ui;
  const dark = spec.kind === 'dark';
  const hover = mix(u.sidebarBg, u.accentSoft, dark ? 0.12 : 0.25);
  const soft = (alpha: number) => withAlpha(u.accentSoft, alpha);

  const colors: Record<string, Hex> = {
    // Base
    foreground: u.fg,
    descriptionForeground: u.fgMuted,
    disabledForeground: withAlpha(u.fgMuted, 0.6),
    errorForeground: u.error,
    focusBorder: withAlpha(u.accent, 0.8),
    'widget.shadow': dark ? '#00000055' : '#C9A3B833',
    'selection.background': withAlpha(u.accentSoft, 0.45),
    'icon.foreground': u.fgMuted,
    'textLink.foreground': spec.syntax.link,
    'textLink.activeForeground': u.accent,
    'textBlockQuote.background': u.sidebarBg,
    'textBlockQuote.border': u.accentSoft,
    'textCodeBlock.background': u.panelBg,
    'textPreformat.foreground': spec.syntax.string,
    'textSeparator.foreground': u.border,

    // Editor
    'editor.background': u.editorBg,
    'editor.foreground': u.fg,
    'editorCursor.foreground': u.accent,
    'editor.selectionBackground': u.selection,
    'editor.inactiveSelectionBackground': withAlpha(u.selection, 0.5),
    'editor.selectionHighlightBackground': u.wordHighlight,
    'editor.wordHighlightBackground': u.wordHighlight,
    'editor.wordHighlightStrongBackground': soft(0.3),
    'editor.findMatchBackground': u.findMatch,
    'editor.findMatchBorder': u.accent,
    'editor.findMatchHighlightBackground': u.findMatchOther,
    'editor.findRangeHighlightBackground': soft(0.12),
    'editor.lineHighlightBackground': u.lineHighlight,
    'editor.lineHighlightBorder': '#00000000',
    'editor.rangeHighlightBackground': soft(0.12),
    'editorLineNumber.foreground': u.lineNumber,
    'editorLineNumber.activeForeground': u.lineNumberActive,
    'editorWhitespace.foreground': withAlpha(u.lineNumber, 0.4),
    'editorIndentGuide.background1': withAlpha(u.lineNumber, 0.25),
    'editorIndentGuide.activeBackground1': withAlpha(u.accentSoft, 0.8),
    'editorRuler.foreground': withAlpha(u.lineNumber, 0.3),
    'editorCodeLens.foreground': u.fgMuted,
    'editorLink.activeForeground': u.accent,
    'editorBracketMatch.background': soft(0.25),
    'editorBracketMatch.border': u.accent,
    'editorError.foreground': u.error,
    'editorWarning.foreground': u.warning,
    'editorInfo.foreground': u.info,
    'editorHint.foreground': u.success,
    'editorGutter.background': u.editorBg,
    'editorGutter.addedBackground': u.gitAdded,
    'editorGutter.modifiedBackground': u.gitModified,
    'editorGutter.deletedBackground': u.gitDeleted,
    'editorOverviewRuler.border': '#00000000',
    'editorOverviewRuler.errorForeground': u.error,
    'editorOverviewRuler.warningForeground': u.warning,
    'editorOverviewRuler.infoForeground': u.info,
    'editorOverviewRuler.findMatchForeground': u.findMatch,
    'editorOverviewRuler.addedForeground': u.gitAdded,
    'editorOverviewRuler.modifiedForeground': u.gitModified,
    'editorOverviewRuler.deletedForeground': u.gitDeleted,
    'editorInlayHint.foreground': u.fgMuted,
    'editorInlayHint.background': soft(0.12),
    'editorGhostText.foreground': withAlpha(u.fgMuted, 0.7),
    'editorStickyScroll.background': u.editorBg,
    'editorStickyScrollHover.background': hover,

    // Bracket pair colorization (6 colores en rotación)
    ...Object.fromEntries(
      spec.brackets.map((c, i) => [`editorBracketHighlight.foreground${i + 1}`, c] as const),
    ),
    'editorBracketHighlight.unexpectedBracket.foreground': u.error,
    'editorBracketPairGuide.activeBackground1': withAlpha(spec.brackets[0], 0.6),

    // Widgets: hover, sugerencias, peek
    'editorWidget.background': u.widgetBg,
    'editorWidget.foreground': u.fg,
    'editorWidget.border': u.border,
    'editorHoverWidget.background': u.widgetBg,
    'editorHoverWidget.border': u.accentSoft,
    'editorSuggestWidget.background': u.widgetBg,
    'editorSuggestWidget.border': u.border,
    'editorSuggestWidget.foreground': u.fg,
    'editorSuggestWidget.highlightForeground': u.accent,
    'editorSuggestWidget.focusHighlightForeground': u.accent,
    'editorSuggestWidget.selectedBackground': soft(0.3),
    'editorSuggestWidget.selectedForeground': u.fg,
    'peekView.border': u.accent,
    'peekViewEditor.background': u.sidebarBg,
    'peekViewEditor.matchHighlightBackground': u.findMatch,
    'peekViewResult.background': u.panelBg,
    'peekViewResult.matchHighlightBackground': u.findMatch,
    'peekViewResult.selectionBackground': soft(0.3),
    'peekViewTitle.background': u.panelBg,
    'peekViewTitleLabel.foreground': u.fg,
    'peekViewTitleDescription.foreground': u.fgMuted,

    // Diff editor
    'diffEditor.insertedTextBackground': withAlpha(u.gitAdded, dark ? 0.18 : 0.16),
    'diffEditor.removedTextBackground': withAlpha(u.gitDeleted, dark ? 0.18 : 0.12),
    'diffEditor.insertedLineBackground': withAlpha(u.gitAdded, dark ? 0.1 : 0.08),
    'diffEditor.removedLineBackground': withAlpha(u.gitDeleted, dark ? 0.1 : 0.06),
    'diffEditor.diagonalFill': withAlpha(u.lineNumber, 0.25),

    // Minimap y scrollbar
    'minimap.background': u.editorBg,
    'minimap.selectionHighlight': u.selection,
    'minimap.findMatchHighlight': u.findMatch,
    'minimap.errorHighlight': u.error,
    'minimap.warningHighlight': u.warning,
    'minimapGutter.addedBackground': u.gitAdded,
    'minimapGutter.modifiedBackground': u.gitModified,
    'minimapGutter.deletedBackground': u.gitDeleted,
    'scrollbar.shadow': '#00000000',
    'scrollbarSlider.background': soft(0.25),
    'scrollbarSlider.hoverBackground': soft(0.4),
    'scrollbarSlider.activeBackground': soft(0.6),

    // Breadcrumbs
    'breadcrumb.foreground': u.fgMuted,
    'breadcrumb.focusForeground': u.fg,
    'breadcrumb.activeSelectionForeground': u.accent,
    'breadcrumbPicker.background': u.widgetBg,

    // Title bar
    'titleBar.activeBackground': u.titleBg,
    'titleBar.activeForeground': u.fg,
    'titleBar.inactiveBackground': u.titleBg,
    'titleBar.inactiveForeground': u.fgMuted,
    'titleBar.border': u.border,

    // Activity bar
    'activityBar.background': u.activityBg,
    'activityBar.foreground': u.activityFg,
    'activityBar.inactiveForeground': withAlpha(u.activityFg, 0.6),
    'activityBar.border': u.border,
    'activityBar.activeBorder': u.activityFg,
    'activityBarBadge.background': u.accent,
    'activityBarBadge.foreground': u.accentFg,

    // Sidebar
    'sideBar.background': u.sidebarBg,
    'sideBar.foreground': u.fg,
    'sideBar.border': u.border,
    'sideBarTitle.foreground': u.fg,
    'sideBarSectionHeader.background': u.sidebarBg,
    'sideBarSectionHeader.foreground': u.fg,
    'sideBarSectionHeader.border': u.border,

    // Listas
    'list.activeSelectionBackground': soft(dark ? 0.3 : 0.45),
    'list.activeSelectionForeground': u.fg,
    'list.inactiveSelectionBackground': soft(dark ? 0.18 : 0.3),
    'list.inactiveSelectionForeground': u.fg,
    'list.hoverBackground': hover,
    'list.hoverForeground': u.fg,
    'list.focusOutline': withAlpha(u.accent, 0.6),
    'list.highlightForeground': u.accent,
    'list.errorForeground': u.error,
    'list.warningForeground': u.warning,
    'tree.indentGuidesStroke': withAlpha(u.lineNumber, 0.4),

    // Tabs
    'editorGroupHeader.tabsBackground': u.tabInactiveBg,
    'editorGroupHeader.tabsBorder': u.border,
    'editorGroup.border': u.border,
    'editorGroup.dropBackground': soft(0.2),
    'tab.activeBackground': u.editorBg,
    'tab.activeForeground': u.fg,
    'tab.activeBorderTop': u.accent,
    'tab.activeBorder': u.editorBg,
    'tab.inactiveBackground': u.tabInactiveBg,
    'tab.inactiveForeground': u.fgMuted,
    'tab.hoverBackground': hover,
    'tab.border': u.border,
    'tab.activeModifiedBorder': u.warning,
    'tab.inactiveModifiedBorder': withAlpha(u.warning, 0.6),
    'tab.unfocusedActiveForeground': u.fgMuted,

    // Status bar
    'statusBar.background': u.statusBg,
    'statusBar.foreground': u.statusFg,
    'statusBar.border': u.border,
    'statusBar.debuggingBackground': u.accentSoft,
    'statusBar.debuggingForeground': dark ? '#2E2D2D' : u.fg,
    'statusBar.noFolderBackground': u.statusBg,
    'statusBarItem.hoverBackground': withAlpha(u.statusFg, 0.12),
    'statusBarItem.remoteBackground': u.accent,
    'statusBarItem.remoteForeground': u.accentFg,
    'statusBarItem.errorBackground': u.error,
    'statusBarItem.errorForeground': '#FFFFFF',

    // Panel y terminal
    'panel.background': u.panelBg,
    'panel.border': u.border,
    'panelTitle.activeForeground': u.fg,
    'panelTitle.activeBorder': u.accent,
    'panelTitle.inactiveForeground': u.fgMuted,
    'terminal.background': u.panelBg,
    'terminal.foreground': u.fg,
    'terminalCursor.foreground': u.accent,
    'terminal.selectionBackground': u.selection,
    ...Object.fromEntries(spec.ansi.map((c, i) => [`terminal.ansi${ANSI_KEYS[i]}`, c] as const)),

    // Notificaciones
    'notifications.background': u.widgetBg,
    'notifications.foreground': u.fg,
    'notifications.border': u.border,
    'notificationCenterHeader.background': u.panelBg,
    'notificationLink.foreground': spec.syntax.link,
    'notificationsErrorIcon.foreground': u.error,
    'notificationsWarningIcon.foreground': u.warning,
    'notificationsInfoIcon.foreground': u.info,

    // Quick input y menús
    'quickInput.background': u.widgetBg,
    'quickInput.foreground': u.fg,
    'quickInputTitle.background': u.panelBg,
    'quickInputList.focusBackground': soft(0.3),
    'quickInputList.focusForeground': u.fg,
    'pickerGroup.foreground': u.accent,
    'pickerGroup.border': u.border,
    'menu.background': u.widgetBg,
    'menu.foreground': u.fg,
    'menu.selectionBackground': soft(0.3),
    'menu.selectionForeground': u.fg,
    'menu.separatorBackground': u.border,
    'menu.border': u.border,

    // Botones, inputs, badges
    'button.background': u.accent,
    'button.foreground': u.accentFg,
    'button.hoverBackground': mix(u.accent, dark ? '#FFFFFF' : '#000000', 0.12),
    'button.secondaryBackground': soft(0.35),
    'button.secondaryForeground': u.fg,
    'button.secondaryHoverBackground': soft(0.5),
    'input.background': u.inputBg,
    'input.foreground': u.fg,
    'input.border': u.border,
    'input.placeholderForeground': withAlpha(u.fgMuted, 0.8),
    'inputOption.activeBackground': soft(0.35),
    'inputOption.activeBorder': u.accent,
    'inputValidation.errorBackground': u.widgetBg,
    'inputValidation.errorBorder': u.error,
    'inputValidation.warningBackground': u.widgetBg,
    'inputValidation.warningBorder': u.warning,
    'inputValidation.infoBackground': u.widgetBg,
    'inputValidation.infoBorder': u.info,
    'dropdown.background': u.inputBg,
    'dropdown.foreground': u.fg,
    'dropdown.border': u.border,
    'checkbox.background': u.inputBg,
    'checkbox.border': u.border,
    'badge.background': u.accent,
    'badge.foreground': u.accentFg,
    'progressBar.background': u.accent,

    // Git decorations
    'gitDecoration.addedResourceForeground': u.gitAdded,
    'gitDecoration.modifiedResourceForeground': u.gitModified,
    'gitDecoration.deletedResourceForeground': u.gitDeleted,
    'gitDecoration.untrackedResourceForeground': u.gitUntracked,
    'gitDecoration.ignoredResourceForeground': u.gitIgnored,
    'gitDecoration.conflictingResourceForeground': u.warning,
    'gitDecoration.stageModifiedResourceForeground': u.gitModified,
    'gitDecoration.stageDeletedResourceForeground': u.gitDeleted,

    // Notebooks
    'notebook.cellBorderColor': u.border,
    'notebook.focusedCellBorder': u.accent,
    'notebook.cellEditorBackground': u.sidebarBg,
    'notebook.selectedCellBackground': soft(0.12),
    'notebookStatusSuccessIcon.foreground': u.success,
    'notebookStatusErrorIcon.foreground': u.error,
    'notebookStatusRunningIcon.foreground': u.info,
    'notebook.editorBackground': u.editorBg,
    'notebook.cellHoverBackground': soft(0.06),
    'notebook.focusedCellBackground': soft(0.08),
    'notebook.cellToolbarSeparator': u.border,
    'notebook.cellStatusBarItemHoverBackground': soft(0.2),
    'notebook.outputContainerBackgroundColor': u.panelBg,
    'notebook.outputContainerBorderColor': u.border,
    'notebook.symbolHighlightBackground': soft(0.15),
    'notebookScrollbarSlider.background': soft(0.25),
    'notebookScrollbarSlider.hoverBackground': soft(0.4),

    // Charts (notebooks, webviews y vistas de VS Code)
    'charts.foreground': u.fg,
    'charts.lines': withAlpha(u.lineNumber, 0.5),
    'charts.red': u.error,
    'charts.blue': spec.syntax.function,
    'charts.yellow': spec.syntax.constant,
    'charts.orange': spec.syntax.number,
    'charts.green': spec.syntax.string,
    'charts.purple': spec.syntax.keyword,

    // Debug
    'debugToolBar.background': u.widgetBg,
    'debugToolBar.border': u.border,
    'debugIcon.breakpointForeground': u.error,
    'debugIcon.breakpointUnverifiedForeground': u.lineNumber,
    'debugIcon.breakpointCurrentStackframeForeground': spec.syntax.constant,
    'debugIcon.startForeground': u.success,
    'debugIcon.pauseForeground': u.info,
    'debugIcon.stopForeground': u.error,
    'debugIcon.restartForeground': u.success,
    'debugIcon.stepOverForeground': u.info,
    'debugIcon.stepIntoForeground': u.info,
    'debugIcon.stepOutForeground': u.info,
    'debugIcon.continueForeground': u.success,
    'editor.stackFrameHighlightBackground': withAlpha(spec.syntax.constant, 0.15),
    'editor.focusedStackFrameHighlightBackground': withAlpha(u.gitAdded, 0.15),
    'debugConsole.infoForeground': u.info,
    'debugConsole.warningForeground': u.warning,
    'debugConsole.errorForeground': u.error,
    'debugConsole.sourceForeground': u.fgMuted,
    'debugConsoleInputIcon.foreground': u.accent,
    'debugTokenExpression.name': spec.syntax.property,
    'debugTokenExpression.value': u.fg,
    'debugTokenExpression.string': spec.syntax.string,
    'debugTokenExpression.number': spec.syntax.number,
    'debugTokenExpression.boolean': spec.syntax.constant,
    'debugTokenExpression.error': u.error,

    // Testing
    'testing.iconPassed': u.success,
    'testing.iconFailed': u.error,
    'testing.iconErrored': u.error,
    'testing.iconQueued': spec.syntax.constant,
    'testing.iconUnset': u.lineNumber,
    'testing.iconSkipped': u.lineNumber,
    'testing.runAction': u.success,
    'testing.peekBorder': u.error,
    'testing.peekHeaderBackground': withAlpha(u.error, 0.1),

    // Conflictos de merge
    'merge.currentHeaderBackground': withAlpha(u.gitAdded, 0.4),
    'merge.currentContentBackground': withAlpha(u.gitAdded, 0.15),
    'merge.incomingHeaderBackground': withAlpha(u.gitModified, 0.4),
    'merge.incomingContentBackground': withAlpha(u.gitModified, 0.15),
    'merge.commonHeaderBackground': withAlpha(u.lineNumber, 0.4),
    'merge.commonContentBackground': withAlpha(u.lineNumber, 0.15),
    'editorOverviewRuler.currentContentForeground': u.gitAdded,
    'editorOverviewRuler.incomingContentForeground': u.gitModified,
    'mergeEditor.change.background': withAlpha(u.gitModified, 0.15),
    'mergeEditor.change.word.background': withAlpha(u.gitModified, 0.3),

    // Problemas, bombilla y marcadores
    'problemsErrorIcon.foreground': u.error,
    'problemsWarningIcon.foreground': u.warning,
    'problemsInfoIcon.foreground': u.info,
    'editorLightBulb.foreground': spec.syntax.constant,
    'editorLightBulbAutoFix.foreground': u.info,
    'editorMarkerNavigation.background': u.widgetBg,
    'editorMarkerNavigationError.background': u.error,
    'editorMarkerNavigationWarning.background': u.warning,
    'editorMarkerNavigationInfo.background': u.info,
    'editorUnicodeHighlight.border': u.warning,
    'editorUnnecessaryCode.opacity': '#000000A0',

    // Íconos de símbolos (outline, sugerencias, breadcrumbs)
    'symbolIcon.classForeground': spec.syntax.type,
    'symbolIcon.structForeground': spec.syntax.type,
    'symbolIcon.interfaceForeground': spec.syntax.type,
    'symbolIcon.enumeratorForeground': spec.syntax.type,
    'symbolIcon.enumeratorMemberForeground': spec.syntax.constant,
    'symbolIcon.constantForeground': spec.syntax.constant,
    'symbolIcon.functionForeground': spec.syntax.function,
    'symbolIcon.methodForeground': spec.syntax.function,
    'symbolIcon.constructorForeground': spec.syntax.function,
    'symbolIcon.variableForeground': spec.syntax.property,
    'symbolIcon.fieldForeground': spec.syntax.property,
    'symbolIcon.propertyForeground': spec.syntax.property,
    'symbolIcon.keywordForeground': spec.syntax.keyword,
    'symbolIcon.moduleForeground': spec.syntax.type,
    'symbolIcon.namespaceForeground': spec.syntax.type,
    'symbolIcon.stringForeground': spec.syntax.string,
    'symbolIcon.numberForeground': spec.syntax.number,
    'symbolIcon.booleanForeground': spec.syntax.constant,
    'symbolIcon.operatorForeground': spec.syntax.operator,
    'symbolIcon.typeParameterForeground': spec.syntax.type,
    'symbolIcon.snippetForeground': spec.syntax.regex,
    'symbolIcon.colorForeground': spec.syntax.regex,
    'symbolIcon.fileForeground': u.fgMuted,
    'symbolIcon.folderForeground': u.fgMuted,

    // Settings, atajos, banners, extensiones y bienvenida
    'settings.headerForeground': u.fg,
    'settings.modifiedItemIndicator': u.accent,
    'settings.focusedRowBackground': soft(0.08),
    'settings.rowHoverBackground': soft(0.05),
    'keybindingLabel.background': soft(0.15),
    'keybindingLabel.foreground': u.fg,
    'keybindingLabel.border': u.border,
    'keybindingLabel.bottomBorder': u.border,
    'banner.background': u.accentSoft,
    'banner.foreground': dark ? '#2E2D2D' : u.fg,
    'extensionButton.prominentBackground': u.accent,
    'extensionButton.prominentForeground': u.accentFg,
    'extensionBadge.remoteBackground': u.accent,
    'extensionBadge.remoteForeground': u.accentFg,
    'welcomePage.tileBackground': u.sidebarBg,
    'welcomePage.tileHoverBackground': hover,
    'welcomePage.progress.foreground': u.accent,
    'walkThrough.embeddedEditorBackground': u.panelBg,
    'searchEditor.findMatchBackground': u.findMatchOther,
    'commandCenter.background': u.inputBg,
    'commandCenter.foreground': u.fg,
    'commandCenter.border': u.border,
    'commandCenter.activeBackground': hover,
    'toolbar.hoverBackground': hover,
    'sash.hoverBorder': u.accent,
  };
  return colors;
}

interface ScopeRule {
  name: string;
  role: SyntaxRole;
  scope: string[];
  fontStyle?: string;
}

/** Mapeo semántico de scopes TextMate → rol; idéntico en todos los temas. */
export const scopeRules: readonly ScopeRule[] = [
  {
    name: 'Comentarios',
    role: 'comment',
    fontStyle: 'italic',
    scope: ['comment', 'punctuation.definition.comment', 'string.comment'],
  },
  {
    name: 'Keywords',
    role: 'keyword',
    scope: [
      'keyword',
      'keyword.control',
      'storage',
      'storage.type',
      'storage.modifier',
      'keyword.other.DML.sql',
      'keyword.other.DDL.sql',
      'keyword.other.sql',
    ],
  },
  {
    name: 'Operadores y puntuación',
    role: 'operator',
    scope: [
      'keyword.operator',
      'punctuation',
      'meta.brace',
      'punctuation.separator',
      'punctuation.terminator',
    ],
  },
  {
    name: 'Operadores con palabra',
    role: 'keyword',
    scope: [
      'keyword.operator.new',
      'keyword.operator.expression',
      'keyword.operator.logical.python',
      'keyword.operator.sizeof',
      'keyword.operator.alignof',
      'keyword.operator.cast',
      'keyword.operator.wordlike',
    ],
  },
  {
    name: 'Strings',
    role: 'string',
    scope: ['string', 'string.quoted', 'string.template', 'punctuation.definition.string'],
  },
  {
    name: 'Escapes e interpolación',
    role: 'escape',
    scope: [
      'constant.character.escape',
      'constant.other.placeholder',
      'punctuation.definition.template-expression',
      'punctuation.section.embedded',
    ],
  },
  { name: 'Números', role: 'number', scope: ['constant.numeric', 'keyword.other.unit'] },
  {
    name: 'Constantes',
    role: 'constant',
    scope: [
      'constant',
      'constant.language',
      'support.constant',
      'variable.other.constant',
      'variable.other.enummember',
      'entity.name.constant',
    ],
  },
  {
    name: 'Funciones',
    role: 'function',
    scope: [
      'entity.name.function',
      'support.function',
      'meta.function-call entity.name.function',
      'variable.function',
    ],
  },
  {
    name: 'Tipos y clases',
    role: 'type',
    scope: [
      'entity.name.type',
      'entity.name.class',
      'entity.other.inherited-class',
      'support.type',
      'support.class',
      'storage.type.primitive',
      'storage.type.built-in',
      'entity.name.namespace',
      'storage.type.sql',
    ],
  },
  {
    name: 'Variables',
    role: 'variable',
    scope: ['variable', 'variable.other', 'meta.definition.variable'],
  },
  {
    name: 'Parámetros',
    role: 'parameter',
    fontStyle: 'italic',
    scope: ['variable.parameter', 'meta.parameter'],
  },
  {
    name: 'Propiedades',
    role: 'property',
    scope: [
      'variable.other.property',
      'variable.other.object.property',
      'meta.property-name',
      'support.variable.property',
      'variable.other.member',
    ],
  },
  {
    name: 'Preprocesador y macros',
    role: 'macro',
    scope: [
      'meta.preprocessor',
      'keyword.control.directive',
      'punctuation.definition.directive',

      'meta.preprocessor.macro',
    ],
  },
  {
    name: 'Includes',
    role: 'string',
    scope: ['meta.preprocessor.include string', 'string.quoted.other.lt-gt.include'],
  },
  {
    name: 'Tags HTML/XML',
    role: 'tag',
    scope: ['entity.name.tag', 'punctuation.definition.tag'],
  },
  {
    name: 'Atributos',
    role: 'attribute',
    scope: [
      'entity.other.attribute-name',
      'meta.attribute',
      'support.type.property-name',
      'meta.object-literal.key',
    ],
  },
  {
    name: 'Regex',
    role: 'regex',
    scope: [
      'string.regexp',
      'constant.other.character-class.regexp',
      'keyword.operator.quantifier.regexp',
    ],
  },
  {
    name: 'Decoradores y anotaciones',
    role: 'macro',
    scope: [
      'meta.decorator',
      'entity.name.function.decorator',
      'storage.type.annotation',
      'punctuation.decorator',
    ],
  },
  {
    name: 'Lifetimes y atributos Rust',
    role: 'directive',
    scope: ['entity.name.type.lifetime', 'meta.attribute.rust', 'storage.modifier.lifetime'],
  },

  // Ensamblador (NASM / x86): registros, instrucciones, directivas y etiquetas
  {
    name: 'ASM registros',
    role: 'register',
    scope: [
      'variable.parameter.register',
      'support.variable.register',
      'storage.other.register',
      'variable.language.register',
      'constant.language.register',
      'register',
    ],
  },
  {
    name: 'ASM instrucciones',
    role: 'instruction',
    scope: [
      'keyword.control.instruction',
      'support.function.mnemonic',
      'keyword.mnemonic',
      'keyword.other.instruction',
      'support.function.instruction',
    ],
  },
  {
    name: 'ASM directivas',
    role: 'directive',
    scope: [
      'support.function.directive',
      'keyword.control.directive.asm',
      'storage.type.directive',
      'keyword.directive',
      'support.function.pseudo',
      'keyword.other.directive',
      'meta.directive',
    ],
  },
  {
    name: 'ASM etiquetas',
    role: 'label',
    fontStyle: 'underline',
    scope: [
      'entity.name.function.label',
      'entity.name.label',
      'meta.label',
      'entity.name.tag.label',
    ],
  },

  // Markdown
  {
    name: 'Markdown títulos',
    role: 'heading',
    fontStyle: 'bold',
    scope: [
      'markup.heading',
      'entity.name.section.markdown',
      'punctuation.definition.heading.markdown',
    ],
  },
  { name: 'Markdown énfasis', role: 'parameter', fontStyle: 'italic', scope: ['markup.italic'] },
  { name: 'Markdown negrita', role: 'property', fontStyle: 'bold', scope: ['markup.bold'] },
  {
    name: 'Markdown código',
    role: 'string',
    scope: ['markup.inline.raw', 'markup.fenced_code.block', 'markup.raw'],
  },
  {
    name: 'Markdown enlaces',
    role: 'link',
    fontStyle: 'underline',
    scope: ['markup.underline.link', 'string.other.link', 'meta.link'],
  },
  { name: 'Markdown citas', role: 'comment', fontStyle: 'italic', scope: ['markup.quote'] },
  {
    name: 'Markdown listas',
    role: 'keyword',
    scope: ['punctuation.definition.list.begin.markdown', 'markup.list.numbered.bullet'],
  },
  { name: 'Diff insertado', role: 'string', scope: ['markup.inserted'] },
  { name: 'Diff borrado', role: 'tag', scope: ['markup.deleted'] },
  { name: 'Diff cambiado', role: 'function', scope: ['markup.changed'] },

  // JSON / YAML / CSS
  {
    name: 'Claves JSON',
    role: 'attribute',
    scope: ['support.type.property-name.json', 'meta.structure.dictionary.key.python'],
  },
  { name: 'Claves YAML', role: 'tag', scope: ['entity.name.tag.yaml'] },
  {
    name: 'Anclas YAML',
    role: 'directive',
    scope: ['entity.name.type.anchor.yaml', 'variable.other.alias.yaml'],
  },
  {
    name: 'CSS selectores',
    role: 'tag',
    scope: [
      'entity.name.tag.css',
      'entity.other.attribute-name.class.css',
      'entity.other.attribute-name.id.css',
    ],
  },
  {
    name: 'CSS pseudo',
    role: 'regex',
    scope: [
      'entity.other.attribute-name.pseudo-class.css',
      'entity.other.attribute-name.pseudo-element.css',
    ],
  },
  {
    name: 'CSS propiedades',
    role: 'attribute',
    scope: ['support.type.property-name.css', 'support.type.vendored.property-name.css'],
  },
  {
    name: 'CSS valores',
    role: 'constant',
    scope: [
      'support.constant.property-value.css',
      'support.constant.color',
      'constant.other.color',
    ],
  },

  // Logs
  { name: 'Log error', role: 'tag', fontStyle: 'bold', scope: ['log.error', 'markup.error'] },
  { name: 'Log warning', role: 'constant', scope: ['log.warning', 'markup.warning'] },
  { name: 'Log info', role: 'function', scope: ['log.info', 'markup.info'] },
  { name: 'Log debug', role: 'comment', scope: ['log.debug', 'log.verbose'] },
  { name: 'Log fecha', role: 'number', scope: ['log.date', 'log.time', 'constant.numeric.date'] },
  { name: 'Log strings', role: 'string', scope: ['log.string'] },
  { name: 'Log constantes', role: 'keyword', scope: ['log.constant', 'log.exception'] },

  // Log nativo de VS Code (Output) y LogFileHighlighter
  {
    name: 'Log nativo error',
    role: 'tag',
    fontStyle: 'bold',
    scope: ['token.error-token', 'log.exceptiontype'],
  },
  { name: 'Log nativo warning', role: 'constant', scope: ['token.warn-token'] },
  { name: 'Log nativo info', role: 'function', scope: ['token.info-token'] },
  { name: 'Log nativo debug', role: 'comment', scope: ['token.debug-token'] },
  { name: 'Log URLs', role: 'link', fontStyle: 'underline', scope: ['log.url', 'log.path'] },

  // C / C++ (cpptools y clangd vía TextMate)
  {
    name: 'C/C++ tipos base',
    role: 'type',
    scope: [
      'storage.type.built-in.primitive',
      'storage.type.primitive.c',
      'support.type.posix-reserved',
      'support.type.sys-types',
      'entity.name.scope-resolution',
      'entity.name.type.template',
    ],
  },
  {
    name: 'C/C++ punteros y referencias',
    role: 'operator',
    scope: [
      'storage.modifier.pointer',
      'storage.modifier.reference',
      'punctuation.separator.pointer-access',
      'punctuation.separator.dot-access',
      'punctuation.separator.scope-resolution',
    ],
  },
  {
    name: 'C/C++ includes',
    role: 'macro',
    scope: [
      'keyword.control.directive.include',
      'keyword.control.directive.define',
      'keyword.control.directive.conditional',
      'keyword.control.directive.pragma',
    ],
  },
  {
    name: 'C/C++ nombre de macro',
    role: 'constant',
    scope: ['entity.name.function.preprocessor', 'meta.preprocessor.macro entity.name.function'],
  },

  // Ensamblador: variantes de x86_64 (13xforever), NASM y GAS
  {
    name: 'ASM registros (variantes)',
    role: 'register',
    scope: ['support.type.register', 'keyword.other.register', 'storage.modifier.register'],
  },
  {
    name: 'ASM instrucciones (variantes)',
    role: 'instruction',
    scope: [
      'keyword.control.opcode',
      'entity.name.opcode',

      'keyword.instruction',
      'keyword.control.jump',
      'keyword.control.call',
    ],
  },
  {
    name: 'ASM directivas (variantes)',
    role: 'directive',
    scope: [
      'support.function.section',
      'keyword.control.section',
      'storage.type.data',
      'keyword.other.data',
      'support.function.data',
      'meta.preprocessor.asm',
      'keyword.control.preprocessor',
    ],
  },
  {
    name: 'ASM tamaños y punteros',
    role: 'type',
    scope: [
      'storage.type.size',
      'keyword.operator.size',
      'support.type.size',
      'storage.modifier.size',
      'keyword.other.size',
    ],
  },
  {
    name: 'ASM etiquetas locales',
    role: 'label',
    scope: ['entity.name.function.label.local', 'entity.name.label.local', 'variable.other.label'],
  },

  // SQL
  {
    name: 'SQL funciones',
    role: 'function',
    scope: [
      'support.function.aggregate.sql',
      'support.function.scalar.sql',
      'support.function.string.sql',
      'entity.name.function.sql',
    ],
  },
  {
    name: 'SQL tablas y esquemas',
    role: 'type',
    scope: [
      'constant.other.database-name.sql',
      'constant.other.table-name.sql',
      'entity.name.type.table',
      'entity.name.type.schema',
    ],
  },
  {
    name: 'SQL columnas y alias',
    role: 'property',
    scope: ['entity.name.column', 'variable.other.column', 'constant.other.column-name.sql'],
  },
  { name: 'SQL tipos', role: 'type', scope: ['support.type.sql'] },
  {
    name: 'SQL variables',
    role: 'parameter',
    scope: ['variable.other.sql', 'text.variable', 'variable.parameter.sql'],
  },

  // Python, Rust, Java, TS/JS
  {
    name: 'Python self/cls',
    role: 'keyword',
    fontStyle: 'italic',
    scope: [
      'variable.parameter.function.language.special.self',
      'variable.language.special.self',
      'variable.parameter.function.language.special.cls',
    ],
  },
  {
    name: 'Python builtins',
    role: 'function',
    scope: ['support.function.builtin.python', 'support.function.magic.python'],
  },
  {
    name: 'Python f-strings',
    role: 'escape',
    scope: ['constant.character.format.placeholder.other.python', 'storage.type.format.python'],
  },
  {
    name: 'Rust macros',
    role: 'macro',
    scope: ['entity.name.function.macro.rust', 'support.macro.rust'],
  },
  {
    name: 'Rust self',
    role: 'keyword',
    fontStyle: 'italic',
    scope: ['variable.language.self.rust'],
  },
  {
    name: 'Java anotaciones',
    role: 'macro',
    scope: ['storage.type.annotation.java', 'punctuation.definition.annotation.java'],
  },
  {
    name: 'this / super',
    role: 'keyword',
    fontStyle: 'italic',
    scope: ['variable.language.this', 'variable.language.super', 'variable.language.self'],
  },
  {
    name: 'JSX/TSX componentes',
    role: 'type',
    scope: ['support.class.component', 'entity.name.tag.tsx', 'entity.name.tag.jsx'],
  },

  // Jupyter / Markdown extra
  {
    name: 'Markdown tablas',
    role: 'operator',
    scope: ['punctuation.definition.table', 'markup.table punctuation'],
  },
  { name: 'Markdown separador', role: 'comment', scope: ['meta.separator.markdown'] },
  {
    name: 'Markdown tachado',
    role: 'comment',
    fontStyle: 'strikethrough',
    scope: ['markup.strikethrough'],
  },
  {
    name: 'Markdown imagen',
    role: 'regex',
    scope: ['meta.image.inline.markdown', 'string.other.link.description.markdown'],
  },
  { name: 'Lenguaje de bloque', role: 'attribute', scope: ['fenced_code.block.language'] },

  { name: 'Inválido', role: 'tag', fontStyle: 'underline', scope: ['invalid', 'invalid.illegal'] },
  { name: 'Obsoleto', role: 'comment', fontStyle: 'strikethrough', scope: ['invalid.deprecated'] },
];

export function buildTokenColors(spec: ThemeSpec): TokenColor[] {
  return scopeRules.map(({ name, role, scope, fontStyle }) => ({
    name,
    scope,
    settings: { foreground: spec.syntax[role], ...(fontStyle ? { fontStyle } : {}) },
  }));
}

export function buildSemanticTokenColors(spec: ThemeSpec): VsCodeTheme['semanticTokenColors'] {
  const s = spec.syntax;
  return {
    keyword: s.keyword,
    string: s.string,
    number: s.number,
    regexp: s.regex,
    operator: s.operator,
    comment: { foreground: s.comment, italic: true },
    function: s.function,
    method: s.function,
    macro: s.macro,
    decorator: s.macro,
    label: s.label,
    type: s.type,
    class: s.type,
    struct: s.type,
    enum: s.type,
    interface: { foreground: s.type, italic: true },
    typeParameter: { foreground: s.type, italic: true },
    namespace: s.type,
    concept: s.type,
    variable: s.variable,
    'variable.readonly': s.constant,
    'variable.defaultLibrary': s.constant,
    parameter: { foreground: s.parameter, italic: true },
    property: s.property,
    'property.readonly': s.constant,
    enumMember: s.constant,
    event: s.property,
    // C / C++ (clangd y cpptools)
    'variable.global:cpp': { foreground: s.variable, bold: true },
    'variable.global:c': { foreground: s.variable, bold: true },
    'variable.static:cpp': { foreground: s.variable, underline: true },
    'macro:c': s.macro,
    'macro:cpp': s.macro,
    'operatorOverload:cpp': s.function,
    'templateType:cpp': { foreground: s.type, italic: true },
    // Rust
    'selfKeyword:rust': s.keyword,
    'lifetime:rust': { foreground: s.directive, italic: true },
    'builtinType:rust': s.type,
    'macro:rust': s.macro,
    '*.mutable:rust': { foreground: s.variable, underline: true },
    // Python
    'selfParameter:python': { foreground: s.keyword, italic: true },
    'module:python': s.type,
    'builtinConstant:python': s.constant,
    // Java
    'annotation:java': s.macro,
    'modifier:java': s.keyword,
    // TS / JS
    'variable.readonly.defaultLibrary': s.constant,
    'class.defaultLibrary': s.type,
    'function.defaultLibrary': s.function,
    'type.defaultLibrary': s.type,
    '*.deprecated': { foreground: s.comment, strikethrough: true },
    // C / C++ extra
    'namespace:cpp': { foreground: s.type, italic: true },
    'enumMember:cpp': s.constant,
    'method.static:cpp': { foreground: s.function, italic: true },
    'function.static:c': { foreground: s.function, italic: true },
    'parameter.readonly:cpp': { foreground: s.parameter, italic: true },
    'label:c': s.label,
    'label:cpp': s.label,
    // SQL (mssql / sqltools)
    'table:sql': s.type,
    'column:sql': s.property,
    'schema:sql': { foreground: s.type, italic: true },
  };
}

export function buildTheme(spec: ThemeSpec): VsCodeTheme {
  return {
    $schema: 'vscode://schemas/color-theme',
    name: spec.label,
    type: spec.kind,
    semanticHighlighting: true,
    colors: buildColors(spec),
    tokenColors: buildTokenColors(spec),
    semanticTokenColors: buildSemanticTokenColors(spec),
  };
}

export function themeFileName(spec: ThemeSpec): string {
  return `${spec.id}-color-theme.json`;
}
