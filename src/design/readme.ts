/** Tablas del README generadas desde package.json, entre marcadores <!-- x:inicio --> … <!-- x:fin -->. */

interface Command {
  command: string;
  title: string;
  category?: string;
}

interface Property {
  type?: string;
  default?: unknown;
  description?: string;
  markdownDescription?: string;
}

export interface Manifest {
  contributes: {
    commands: Command[];
    menus?: { commandPalette?: { command: string; when?: string }[] };
    configuration: { title: string; properties: Record<string, Property> }[];
  };
}

const cell = (s: string) => s.replace(/\|/g, '\\|').replace(/\s*\n\s*/g, ' ');

function formatDefault(v: unknown): string {
  if (v === undefined) return '—';
  if (Array.isArray(v) && v.length > 3)
    return `\`[${v
      .slice(0, 3)
      .map((x) => JSON.stringify(x))
      .join(', ')}, …]\``;
  if (typeof v === 'string' && v.length > 28) return `\`${v.slice(0, 25)}…\``;
  return `\`${JSON.stringify(v)}\``;
}

export function commandsTable(m: Manifest): string {
  const hidden = new Set(
    (m.contributes.menus?.commandPalette ?? [])
      .filter((c) => c.when === 'false')
      .map((c) => c.command),
  );
  const rows = m.contributes.commands
    .filter((c) => !hidden.has(c.command))
    .map((c) => `| ${cell(c.title)} | \`${c.command}\` |`);
  return ['| Comando | ID |', '| --- | --- |', ...rows].join('\n');
}

export function configurationTable(m: Manifest): string {
  return m.contributes.configuration
    .map((section) => {
      const rows = Object.entries(section.properties).map(
        ([key, p]) =>
          `| \`${key}\` | ${formatDefault(p.default)} | ${cell(p.markdownDescription ?? p.description ?? '')} |`,
      );
      return [
        `**${section.title}**`,
        '',
        '| Opción | Por defecto | Descripción |',
        '| --- | --- | --- |',
        ...rows,
      ].join('\n');
    })
    .join('\n\n');
}

function replaceBlock(text: string, name: string, content: string): string {
  const start = `<!-- ${name}:inicio -->`;
  const end = `<!-- ${name}:fin -->`;
  const i = text.indexOf(start);
  const j = text.indexOf(end);
  if (i < 0 || j < i) throw new Error(`README: faltan los marcadores ${start} / ${end}`);
  return `${text.slice(0, i + start.length)}\n\n${content}\n\n${text.slice(j)}`;
}

export function renderReadme(readme: string, m: Manifest): string {
  return replaceBlock(
    replaceBlock(readme, 'comandos', commandsTable(m)),
    'configuracion',
    configurationTable(m),
  );
}
