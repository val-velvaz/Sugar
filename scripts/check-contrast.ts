/** Falla (exit 1) si algún color de sintaxis o de UI no cumple el contraste WCAG mínimo. */
import { checkAll } from '../src/design/contrast';
import { themes } from '../src/design/tokens';

const results = checkAll(themes);
const failures = results.filter((r) => !r.pass);
const verbose = process.argv.includes('--verbose');

for (const r of verbose ? results : failures) {
  const mark = r.pass ? '✓' : '✗';
  console.log(
    `${mark} ${r.theme.padEnd(32)} ${r.check.padEnd(26)} ${r.fg} sobre ${r.bg}  ${r.ratio.toFixed(2)}:1 (mín ${r.min})`,
  );
}

if (failures.length > 0) {
  console.error(
    `\n✗ ${failures.length} de ${results.length} combinaciones no cumplen el contraste.`,
  );
  process.exit(1);
}
const worst = results.reduce((a, b) => (b.ratio / b.min < a.ratio / a.min ? b : a));
console.log(
  `✦ ${results.length} combinaciones cumplen WCAG en ${themes.length} temas. ` +
    `La más justa: ${worst.theme} · ${worst.check} ${worst.ratio.toFixed(2)}:1.`,
);
