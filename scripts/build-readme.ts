/** Regenera las tablas de comandos y configuración del README desde package.json (no se escriben a mano). */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { renderReadme } from '../src/design/readme';

const root = resolve(__dirname, '..');
const path = join(root, 'README.md');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
writeFileSync(path, renderReadme(readFileSync(path, 'utf8'), pkg));
console.log('✦ README.md (comandos y configuración)');
