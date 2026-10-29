/** Notas y tareas del Scrapbook: globales (globalState) o por workspace (workspaceState). */
import {
  MAX_TEXT,
  NOTE_COLORS,
  type Note,
  type NoteColor,
  type NoteScope,
  type Task,
} from '../../webviews/scrapbook/protocol';

/** Subconjunto de vscode.Memento, para poder probar el almacén sin VS Code. */
export interface KeyValueStore {
  get<T>(key: string, defaultValue: T): T;
  update(key: string, value: unknown): PromiseLike<void>;
}

const NOTES_KEY = 'sugarCollage.scrapbook.notes';
const TASKS_KEY = 'sugarCollage.scrapbook.tasks';

let counter = 0;
export function newId(now = Date.now()): string {
  counter = (counter + 1) % 1_000_000;
  return `${now.toString(36)}-${counter.toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Pin primero; luego lo más reciente. */
export function sortNotes(notes: Note[]): Note[] {
  return [...notes].sort(
    (a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt,
  );
}

export class ScrapbookStore {
  constructor(
    private readonly global: KeyValueStore,
    /** undefined cuando no hay carpeta abierta: entonces todo se guarda como global. */
    private readonly workspace: KeyValueStore | undefined,
    private readonly now: () => number = Date.now,
    private readonly random: () => number = Math.random,
  ) {}

  get hasWorkspace(): boolean {
    return this.workspace !== undefined;
  }

  private bucket(scope: NoteScope): KeyValueStore {
    return scope === 'workspace' && this.workspace ? this.workspace : this.global;
  }

  private read(scope: NoteScope): Note[] {
    return this.bucket(scope).get<Note[]>(NOTES_KEY, []);
  }

  notes(): Note[] {
    const global = this.read('global').map((n) => ({ ...n, scope: 'global' as const }));
    const ws = this.workspace
      ? this.read('workspace').map((n) => ({ ...n, scope: 'workspace' as const }))
      : [];
    return sortNotes([...ws, ...global]);
  }

  private find(id: string): Note | undefined {
    return this.notes().find((n) => n.id === id);
  }

  async addNote(scope: NoteScope, text = '', color?: NoteColor): Promise<Note> {
    const real: NoteScope = scope === 'workspace' && !this.workspace ? 'global' : scope;
    const t = this.now();
    const used = new Set(this.notes().map((n) => n.color));
    const note: Note = {
      id: newId(t),
      text: text.slice(0, MAX_TEXT),
      color:
        color ??
        NOTE_COLORS.find((c) => !used.has(c)) ??
        NOTE_COLORS[Math.floor(this.random() * NOTE_COLORS.length)] ??
        'mantequilla',
      pinned: false,
      scope: real,
      rotation: Math.round((this.random() * 4 - 2) * 10) / 10,
      createdAt: t,
      updatedAt: t,
    };
    await this.bucket(real).update(NOTES_KEY, [...this.read(real), note]);
    return note;
  }

  async updateNote(
    id: string,
    patch: Partial<Pick<Note, 'text' | 'color' | 'pinned'>>,
  ): Promise<Note | undefined> {
    const current = this.find(id);
    if (!current) return undefined;
    const updated: Note = {
      ...current,
      ...patch,
      text: (patch.text ?? current.text).slice(0, MAX_TEXT),
      // Cambiar solo el pin no cuenta como edición: no la mueve en la lista "más reciente".
      updatedAt:
        patch.text !== undefined || patch.color !== undefined ? this.now() : current.updatedAt,
    };
    const list = this.read(current.scope).map((n) => (n.id === id ? updated : n));
    await this.bucket(current.scope).update(NOTES_KEY, list);
    return updated;
  }

  async deleteNote(id: string): Promise<boolean> {
    const current = this.find(id);
    if (!current) return false;
    await this.bucket(current.scope).update(
      NOTES_KEY,
      this.read(current.scope).filter((n) => n.id !== id),
    );
    return true;
  }

  // Las tareas de la libreta son del workspace (o globales si no hay carpeta abierta).
  private get taskBucket(): KeyValueStore {
    return this.workspace ?? this.global;
  }

  tasks(): Task[] {
    return this.taskBucket.get<Task[]>(TASKS_KEY, []);
  }

  async addTask(text: string): Promise<Task> {
    const task: Task = {
      id: newId(this.now()),
      text: text.slice(0, MAX_TEXT),
      done: false,
      createdAt: this.now(),
    };
    await this.taskBucket.update(TASKS_KEY, [...this.tasks(), task]);
    return task;
  }

  async toggleTask(id: string): Promise<void> {
    await this.taskBucket.update(
      TASKS_KEY,
      this.tasks().map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  }

  async deleteTask(id: string): Promise<void> {
    await this.taskBucket.update(
      TASKS_KEY,
      this.tasks().filter((t) => t.id !== id),
    );
  }

  async clearDone(): Promise<number> {
    const all = this.tasks();
    const left = all.filter((t) => !t.done);
    await this.taskBucket.update(TASKS_KEY, left);
    return all.length - left.length;
  }
}
