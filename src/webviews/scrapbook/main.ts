/** UI del Scrapbook (corre dentro del webview; DOM vanilla sin innerHTML). */
import {
  NOTE_COLORS,
  type FromWebview,
  type Note,
  type NoteColor,
  type ScrapbookBackground,
  type ScrapbookState,
  type Task,
  type TodoItem,
  type ToWebview,
} from './protocol';

type Section = 'notas' | 'libreta' | 'pendientes';
interface UiState {
  open: Record<Section, boolean>;
}

declare function acquireVsCodeApi(): {
  postMessage(msg: FromWebview): void;
  getState(): UiState | undefined;
  setState(state: UiState): void;
};

const vscode = acquireVsCodeApi();
const send = (msg: FromWebview) => vscode.postMessage(msg);
const ui: UiState = vscode.getState() ?? { open: { notas: true, libreta: true, pendientes: true } };

let state: ScrapbookState | undefined;
let todos: TodoItem[] = [];
let scanning = true;

// ── Helper de DOM ────────────────────────────────────────────────────────────

type Child = Node | string | false | null | undefined;
function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Partial<Record<string, string | boolean | ((e: Event) => void)>> = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v === undefined || v === false) continue;
    if (typeof v === 'function') el.addEventListener(k.replace(/^on/, '').toLowerCase(), v);
    else if (k === 'text') el.textContent = String(v);
    else if (v === true) el.setAttribute(k, '');
    else el.setAttribute(k, v);
  }
  for (const c of children) if (c) el.append(c);
  return el;
}

const COLOR_NAMES: Record<NoteColor, string> = {
  mantequilla: 'mantequilla',
  bubblegum: 'bubblegum',
  lavanda: 'lavanda',
  pistache: 'pistache',
  cielo: 'cielo',
  durazno: 'durazno',
  menta: 'menta',
  algodon: 'algodón',
};

const TAG_INDEX: Record<string, number> = { TODO: 0, FIXME: 1, NOTE: 2, HACK: 3, IDEA: 4, '?': 5 };

function section(
  id: Section,
  title: string,
  count: number | undefined,
  actions: Child,
  body: Child,
): HTMLElement {
  const details = h('details', { class: `section section-${id}`, open: ui.open[id] });
  details.addEventListener('toggle', () => {
    ui.open[id] = details.open;
    vscode.setState(ui);
  });
  details.append(
    h(
      'summary',
      {},
      h('span', { class: 'section-title', text: title }),
      count !== undefined ? h('span', { class: 'count', text: String(count) }) : null,
      h('span', { class: 'spacer' }),
      actions,
    ),
    h('div', { class: 'section-body' }, body),
  );
  return details;
}

// ── Notas ────────────────────────────────────────────────────────────────────

const pendingText = new Map<string, ReturnType<typeof setTimeout>>();

function noteCard(note: Note, sparkle: number): HTMLElement {
  const card = h('article', {
    class: `note color-${note.color}${note.pinned ? ' pinned' : ''}`,
    'data-id': note.id,
  });
  card.style.setProperty('--rot', `${sparkle === 0 ? 0 : note.rotation}deg`);

  const pin = h('button', {
    class: 'pin',
    title: note.pinned ? 'Desfijar' : 'Fijar arriba',
    'aria-label': note.pinned ? 'Desfijar nota' : 'Fijar nota',
    'aria-pressed': String(note.pinned),
    onclick: () => send({ type: 'note/update', id: note.id, patch: { pinned: !note.pinned } }),
  });

  const text = h('textarea', {
    class: 'note-text',
    'aria-label': 'Texto de la nota',
    placeholder: 'Escribe algo dulce…',
    spellcheck: 'true',
  });
  text.value = note.text;
  const grow = () => {
    text.style.height = 'auto';
    text.style.height = `${Math.max(56, text.scrollHeight)}px`;
  };
  text.addEventListener('input', () => {
    grow();
    // El estado local se actualiza ya: un re-render (p. ej. al llegar pendientes) no debe perder lo escrito.
    note.text = text.value;
    const prev = pendingText.get(note.id);
    if (prev) clearTimeout(prev);
    pendingText.set(
      note.id,
      setTimeout(() => {
        pendingText.delete(note.id);
        send({ type: 'note/update', id: note.id, patch: { text: text.value } });
      }, 350),
    );
  });
  requestAnimationFrame(grow);

  const swatches = h(
    'div',
    { class: 'swatches', role: 'group', 'aria-label': 'Color de la nota' },
    ...NOTE_COLORS.map((c) =>
      h('button', {
        class: `swatch color-${c}`,
        title: COLOR_NAMES[c],
        'aria-label': `Color ${COLOR_NAMES[c]}`,
        'aria-pressed': String(c === note.color),
        onclick: () => send({ type: 'note/update', id: note.id, patch: { color: c } }),
      }),
    ),
  );

  const del = h('button', {
    class: 'icon-btn delete',
    title: 'Borrar nota',
    'aria-label': 'Borrar nota',
    text: '✕',
  });
  del.addEventListener('click', () => {
    // Doble clic de seguridad: el primero pide confirmación.
    if (del.dataset.confirm) {
      send({ type: 'note/delete', id: note.id });
    } else {
      del.dataset.confirm = '1';
      del.textContent = '¿Borrar?';
      del.classList.add('confirm');
      setTimeout(() => {
        delete del.dataset.confirm;
        del.textContent = '✕';
        del.classList.remove('confirm');
      }, 2500);
    }
  });

  card.append(
    pin,
    text,
    h(
      'footer',
      {},
      swatches,
      h('span', {
        class: 'scope',
        title: note.scope === 'global' ? 'Visible en todos tus proyectos' : 'Solo en este proyecto',
        text: note.scope === 'global' ? '🌍 global' : '📁 proyecto',
      }),
      del,
    ),
  );
  return card;
}

function notesSection(s: ScrapbookState): HTMLElement {
  const actions = h(
    'span',
    { class: 'actions' },
    s.hasWorkspace &&
      h('button', {
        class: 'chip-btn',
        title: 'Nota solo para este proyecto',
        onclick: (e) => (e.preventDefault(), send({ type: 'note/add', scope: 'workspace' })),
        text: '+ nota',
      }),
    h('button', {
      class: 'chip-btn',
      title: 'Nota visible en todos tus proyectos',
      onclick: (e) => (e.preventDefault(), send({ type: 'note/add', scope: 'global' })),
      text: s.hasWorkspace ? '+ global' : '+ nota',
    }),
  );
  const body = s.notes.length
    ? h('div', { class: 'notes' }, ...s.notes.map((n) => noteCard(n, s.sparkleLevel)))
    : h('p', { class: 'empty', text: 'Todavía no hay notas. Pega la primera ✦' });
  return section('notas', 'Notas', s.notes.length, actions, body);
}

// ── Libreta ──────────────────────────────────────────────────────────────────

function taskRow(t: Task): HTMLElement {
  return h(
    'li',
    { class: t.done ? 'done' : '' },
    h('button', {
      class: 'sew-check',
      role: 'checkbox',
      'aria-checked': String(t.done),
      'aria-label': t.done ? `Desmarcar: ${t.text}` : `Marcar como hecha: ${t.text}`,
      onclick: () => send({ type: 'task/toggle', id: t.id }),
    }),
    h('span', { class: 'task-text', text: t.text }),
    h('button', {
      class: 'icon-btn',
      title: 'Borrar tarea',
      'aria-label': `Borrar ${t.text}`,
      text: '✕',
      onclick: () => send({ type: 'task/delete', id: t.id }),
    }),
  );
}

function notebookSection(s: ScrapbookState): HTMLElement {
  const input = h('input', {
    class: 'task-input',
    type: 'text',
    placeholder: 'Nueva tarea…',
    'aria-label': 'Nueva tarea',
    maxlength: '300',
  });
  const form = h(
    'form',
    { class: 'task-form' },
    input,
    h('button', { class: 'chip-btn', type: 'submit', text: 'Añadir' }),
  );
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value.trim()) send({ type: 'task/add', text: input.value });
    input.value = '';
    input.focus();
  });
  const done = s.tasks.filter((t) => t.done).length;
  const paper = h(
    'div',
    { class: 'paper' },
    form,
    s.tasks.length
      ? h('ul', { class: 'tasks' }, ...s.tasks.map(taskRow))
      : h('p', { class: 'empty', text: 'Página en blanco. ¿Qué toca hoy?' }),
    done > 0 &&
      h('button', {
        class: 'link-btn',
        onclick: () => send({ type: 'task/clearDone' }),
        text: `Limpiar hechas (${done})`,
      }),
  );
  return section('libreta', 'Libreta', s.tasks.length - done, null, paper);
}

// ── Pendientes ───────────────────────────────────────────────────────────────

function todosSection(s: ScrapbookState): HTMLElement {
  const refresh = h('button', {
    class: 'icon-btn',
    title: 'Volver a buscar',
    'aria-label': 'Volver a buscar pendientes',
    text: '↻',
    onclick: (e) => {
      e.preventDefault();
      send({ type: 'todos/refresh' });
    },
  });
  let body: Child;
  if (!s.hasWorkspace)
    body = h('p', { class: 'empty', text: 'Abre una carpeta para ver sus pendientes.' });
  else if (scanning) body = h('p', { class: 'empty', text: 'Buscando pendientes…' });
  else if (!todos.length)
    body = h('p', { class: 'empty', text: 'Sin pendientes. ¡Galletita para ti! 🍪' });
  else
    body = h(
      'ul',
      { class: 'todos' },
      ...todos.map((t) =>
        h(
          'li',
          {},
          h(
            'button',
            {
              class: 'todo',
              title: `${t.file}:${t.line + 1}`,
              onclick: () => send({ type: 'todos/open', item: t }),
            },
            h('span', { class: `tag tag-${TAG_INDEX[t.tag] ?? 0}`, text: t.tag }),
            h('span', { class: 'todo-text', text: t.text || '(sin descripción)' }),
            h('code', { class: 'todo-where', text: `${t.file}:${t.line + 1}` }),
          ),
        ),
      ),
    );
  return section(
    'pendientes',
    'Mis pendientes',
    s.hasWorkspace && !scanning ? todos.length : undefined,
    refresh,
    body,
  );
}

// ── Raíz ─────────────────────────────────────────────────────────────────────

const BACKGROUNDS: [ScrapbookBackground, string, string][] = [
  ['cuadricula', '▦', 'Cuadrícula'],
  ['gingham', '▩', 'Gingham'],
  ['liso', '▢', 'Liso'],
];

function header(s: ScrapbookState): HTMLElement {
  return h(
    'header',
    { class: 'top' },
    h(
      'h1',
      {},
      h('span', { class: 'sparkle', 'aria-hidden': 'true', text: '✦' }),
      h('span', { text: 'Mi Scrapbook' }),
    ),
    h(
      'div',
      { class: 'bg-switch', role: 'group', 'aria-label': 'Fondo' },
      ...BACKGROUNDS.map(([value, icon, label]) =>
        h('button', {
          class: 'icon-btn',
          title: label,
          'aria-label': `Fondo ${label}`,
          'aria-pressed': String(s.background === value),
          text: icon,
          onclick: () => send({ type: 'background/set', value }),
        }),
      ),
    ),
  );
}

function render(): void {
  if (!state) return;
  // Conserva el foco y la selección si se estaba escribiendo en una nota.
  const active = document.activeElement;
  const focusedNote =
    active instanceof HTMLTextAreaElement
      ? active.closest<HTMLElement>('.note')?.dataset.id
      : undefined;
  const selection =
    active instanceof HTMLTextAreaElement
      ? [active.selectionStart, active.selectionEnd]
      : undefined;

  document.body.dataset.bg = state.background;
  document.body.dataset.sparkle = String(state.sparkleLevel);
  const app = document.getElementById('app');
  if (!app) return;
  app.replaceChildren(
    header(state),
    notesSection(state),
    notebookSection(state),
    todosSection(state),
  );

  if (focusedNote) {
    const ta = app.querySelector<HTMLTextAreaElement>(
      `.note[data-id="${CSS.escape(focusedNote)}"] textarea`,
    );
    ta?.focus();
    if (ta && selection) ta.setSelectionRange(selection[0] ?? 0, selection[1] ?? 0);
  }
}

window.addEventListener('message', (event: MessageEvent<ToWebview>) => {
  const msg = event.data;
  switch (msg.type) {
    case 'state':
      state = msg.state;
      render();
      break;
    case 'todos':
      todos = msg.todos;
      scanning = msg.scanning;
      render();
      break;
    case 'focusNewNote':
      requestAnimationFrame(() =>
        document
          .querySelector<HTMLTextAreaElement>(`.note[data-id="${CSS.escape(msg.id)}"] textarea`)
          ?.focus(),
      );
      break;
  }
});

send({ type: 'ready' });
