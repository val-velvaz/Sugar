import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { FONT_DIR, fontFaceCss, fontFaces } from '../../src/design/fonts';
import { ScrapbookStore, type KeyValueStore } from '../../src/features/scrapbook/store';
import { contentSecurityPolicy, createNonce, tokenCss } from '../../src/webviews/shared/page';
import { parseFromWebview } from '../../src/webviews/scrapbook/protocol';

const root = join(__dirname, '..', '..');

class MemoryStore implements KeyValueStore {
  readonly data = new Map<string, unknown>();
  get<T>(key: string, defaultValue: T): T {
    return (this.data.has(key) ? this.data.get(key) : defaultValue) as T;
  }
  async update(key: string, value: unknown): Promise<void> {
    this.data.set(key, structuredClone(value));
  }
}

function makeStore(withWorkspace = true) {
  let t = 1000;
  const global = new MemoryStore();
  const ws = withWorkspace ? new MemoryStore() : undefined;
  return {
    store: new ScrapbookStore(
      global,
      ws,
      () => ++t,
      () => 0.5,
    ),
    global,
    ws,
  };
}

test('las notas se guardan en workspaceState o globalState según su alcance', async () => {
  const { store, global, ws } = makeStore();
  const a = await store.addNote('workspace', 'solo aquí');
  const b = await store.addNote('global', 'en todas partes');
  assert.equal(a.scope, 'workspace');
  assert.equal(b.scope, 'global');
  assert.equal((ws?.get<unknown[]>('sugarCollage.scrapbook.notes', []) ?? []).length, 1);
  assert.equal(global.get<unknown[]>('sugarCollage.scrapbook.notes', []).length, 1);
  assert.deepEqual(
    store
      .notes()
      .map((n) => n.text)
      .sort(),
    ['en todas partes', 'solo aquí'],
  );
});

test('sin carpeta abierta, una nota de workspace se guarda como global', async () => {
  const { store } = makeStore(false);
  const n = await store.addNote('workspace', 'x');
  assert.equal(n.scope, 'global');
  assert.equal(store.hasWorkspace, false);
});

test('editar, cambiar color, fijar y borrar', async () => {
  const { store } = makeStore();
  const a = await store.addNote('workspace', 'a');
  const b = await store.addNote('global', 'b');
  await store.updateNote(a.id, { text: 'a2', color: 'lavanda' });
  await store.updateNote(b.id, { pinned: true });
  const [first, second] = store.notes();
  assert.equal(first?.id, b.id, 'la fijada va primero');
  assert.equal(second?.text, 'a2');
  assert.equal(second?.color, 'lavanda');
  assert.equal(await store.deleteNote(a.id), true);
  assert.equal(await store.deleteNote('no-existe'), false);
  assert.deepEqual(
    store.notes().map((n) => n.id),
    [b.id],
  );
});

test('colores distintos por defecto e inclinación entre −2° y 2°', async () => {
  const { store } = makeStore();
  const notes = [
    await store.addNote('workspace'),
    await store.addNote('workspace'),
    await store.addNote('global'),
  ];
  assert.equal(new Set(notes.map((n) => n.color)).size, 3);
  for (const n of notes) assert.ok(n.rotation >= -2 && n.rotation <= 2);
});

test('libreta: añadir, marcar, borrar y limpiar hechas', async () => {
  const { store } = makeStore();
  const a = await store.addTask('hornear');
  const b = await store.addTask('decorar');
  await store.toggleTask(a.id);
  assert.deepEqual(
    store.tasks().map((t) => t.done),
    [true, false],
  );
  assert.equal(await store.clearDone(), 1);
  assert.deepEqual(
    store.tasks().map((t) => t.id),
    [b.id],
  );
  await store.deleteTask(b.id);
  assert.deepEqual(store.tasks(), []);
});

test('el protocolo valida los mensajes del webview', () => {
  assert.deepEqual(parseFromWebview({ type: 'ready' }), { type: 'ready' });
  assert.deepEqual(parseFromWebview({ type: 'note/add', scope: 'global' }), {
    type: 'note/add',
    scope: 'global',
  });
  assert.equal(parseFromWebview({ type: 'note/add', scope: 'otro' }), undefined);
  assert.equal(
    parseFromWebview({ type: 'note/update', id: 'x', patch: { color: 'negro' } }),
    undefined,
  );
  assert.equal(
    parseFromWebview({ type: 'note/update', id: 'x', patch: { text: 'a'.repeat(5000) } }),
    undefined,
  );
  assert.deepEqual(
    parseFromWebview({ type: 'note/update', id: 'x', patch: { pinned: true, extra: 1 } }),
    {
      type: 'note/update',
      id: 'x',
      patch: { pinned: true },
    },
  );
  assert.equal(parseFromWebview({ type: 'task/add', text: '   ' }), undefined);
  assert.equal(parseFromWebview({ type: 'rm -rf' }), undefined);
  assert.equal(parseFromWebview('hola'), undefined);
  assert.equal(parseFromWebview(null), undefined);
});

test('CSP estricta con nonce y sin unsafe-inline/eval', () => {
  const nonce = createNonce();
  assert.notEqual(nonce, createNonce());
  const csp = contentSecurityPolicy('https://webview.test', nonce);
  assert.match(csp, /default-src 'none'/);
  assert.match(csp, new RegExp(`script-src 'nonce-${nonce.replace(/[+/=]/g, '\\$&')}'`));
  assert.doesNotMatch(csp, /unsafe-inline|unsafe-eval/);
});

test('tokenCss expone la paleta como variables --sc-*', () => {
  const css = tokenCss();
  assert.match(css, /--sc-bubblegum:#FF99C9/);
  assert.match(css, /--sc-deep-frambuesa:#C2185B/);
  assert.match(css, /--sc-washi-0:/);
});

test('las fuentes OFL están en media/fonts con sus licencias', () => {
  for (const f of fontFaces) assert.ok(existsSync(join(root, FONT_DIR, f.file)), f.file);
  for (const pkg of ['fira-code', 'nunito-sans', 'tinos']) {
    assert.match(
      readFileSync(join(root, FONT_DIR, `OFL-${pkg}.txt`), 'utf8'),
      /SIL Open Font License/,
    );
  }
  const css = fontFaceCss((p) => `x/${p}`);
  for (const family of ['Fira Code', 'Nunito Sans', 'Tinos'])
    assert.match(css, new RegExp(`font-family:'${family}'`));
});

test('la Activity Bar tiene un contenedor con la vista del Scrapbook', () => {
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  const container = pkg.contributes.viewsContainers.activitybar[0];
  assert.ok(existsSync(join(root, container.icon)));
  assert.equal(pkg.contributes.views[container.id][0].type, 'webview');
});
