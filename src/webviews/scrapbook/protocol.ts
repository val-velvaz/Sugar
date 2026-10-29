/** Mensajes tipados entre la extensión y el webview del Scrapbook (sin dependencias de vscode ni DOM). */

export const NOTE_COLORS = [
  'mantequilla',
  'bubblegum',
  'lavanda',
  'pistache',
  'cielo',
  'durazno',
  'menta',
  'algodon',
] as const;
export type NoteColor = (typeof NOTE_COLORS)[number];

export type NoteScope = 'workspace' | 'global';
export type ScrapbookBackground = 'cuadricula' | 'gingham' | 'liso';

export interface Note {
  id: string;
  text: string;
  color: NoteColor;
  pinned: boolean;
  scope: NoteScope;
  /** Inclinación en grados (−2 a 2), fija por nota para que no "baile". */
  rotation: number;
  createdAt: number;
  updatedAt: number;
}

export interface Task {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
}

export interface TodoItem {
  tag: string;
  text: string;
  file: string;
  line: number;
  uri: string;
  tagStart: number;
  end: number;
}

export interface ScrapbookState {
  notes: Note[];
  tasks: Task[];
  hasWorkspace: boolean;
  background: ScrapbookBackground;
  sparkleLevel: 0 | 1 | 2 | 3;
}

export type ToWebview =
  | { type: 'state'; state: ScrapbookState }
  | { type: 'todos'; todos: TodoItem[]; scanning: boolean }
  | { type: 'focusNewNote'; id: string };

export type FromWebview =
  | { type: 'ready' }
  | { type: 'note/add'; scope: NoteScope }
  | { type: 'note/update'; id: string; patch: Partial<Pick<Note, 'text' | 'color' | 'pinned'>> }
  | { type: 'note/delete'; id: string }
  | { type: 'task/add'; text: string }
  | { type: 'task/toggle'; id: string }
  | { type: 'task/delete'; id: string }
  | { type: 'task/clearDone' }
  | { type: 'todos/refresh' }
  | { type: 'todos/open'; item: TodoItem }
  | { type: 'background/set'; value: ScrapbookBackground };

export const MAX_TEXT = 4000;

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const isStr = (v: unknown, max = MAX_TEXT): v is string => typeof v === 'string' && v.length <= max;

/** El webview es contenido no confiable: se valida cada mensaje antes de usarlo. */
export function parseFromWebview(raw: unknown): FromWebview | undefined {
  if (!isObj(raw) || typeof raw.type !== 'string') return undefined;
  switch (raw.type) {
    case 'ready':
    case 'task/clearDone':
    case 'todos/refresh':
      return { type: raw.type };
    case 'note/add':
      return raw.scope === 'workspace' || raw.scope === 'global'
        ? { type: raw.type, scope: raw.scope }
        : undefined;
    case 'note/update': {
      if (!isStr(raw.id, 64) || !isObj(raw.patch)) return undefined;
      const patch: Partial<Pick<Note, 'text' | 'color' | 'pinned'>> = {};
      if (raw.patch.text !== undefined) {
        if (!isStr(raw.patch.text)) return undefined;
        patch.text = raw.patch.text;
      }
      if (raw.patch.color !== undefined) {
        if (!(NOTE_COLORS as readonly unknown[]).includes(raw.patch.color)) return undefined;
        patch.color = raw.patch.color as NoteColor;
      }
      if (raw.patch.pinned !== undefined) {
        if (typeof raw.patch.pinned !== 'boolean') return undefined;
        patch.pinned = raw.patch.pinned;
      }
      return { type: raw.type, id: raw.id, patch };
    }
    case 'note/delete':
    case 'task/toggle':
    case 'task/delete':
      return isStr(raw.id, 64) ? { type: raw.type, id: raw.id } : undefined;
    case 'task/add':
      return isStr(raw.text) && raw.text.trim()
        ? { type: raw.type, text: raw.text.trim() }
        : undefined;
    case 'todos/open': {
      const i = raw.item;
      if (!isObj(i) || !isStr(i.uri, 2048) || typeof i.line !== 'number') return undefined;
      return {
        type: raw.type,
        item: {
          tag: String(i.tag ?? ''),
          text: String(i.text ?? ''),
          file: String(i.file ?? ''),
          uri: i.uri,
          line: i.line,
          tagStart: Number(i.tagStart) || 0,
          end: Number(i.end) || 0,
        },
      };
    }
    case 'background/set':
      return raw.value === 'cuadricula' || raw.value === 'gingham' || raw.value === 'liso'
        ? { type: raw.type, value: raw.value }
        : undefined;
    default:
      return undefined;
  }
}
