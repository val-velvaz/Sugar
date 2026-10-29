import * as esbuild from 'esbuild';

const watch = process.argv.includes('--watch');

/** @type {esbuild.BuildOptions} */
const common = {
  bundle: true,
  sourcemap: watch,
  minify: !watch,
  logLevel: 'info',
};

/** @type {esbuild.BuildOptions[]} */
const builds = [
  // Extensión (Node, CommonJS)
  {
    ...common,
    entryPoints: ['src/extension.ts'],
    outfile: 'dist/extension.js',
    format: 'cjs',
    platform: 'node',
    target: 'node20',
    external: ['vscode'],
  },
  // Webviews (navegador, IIFE: un archivo por panel)
  {
    ...common,
    entryPoints: { scrapbook: 'src/webviews/scrapbook/main.ts' },
    outdir: 'dist/webviews',
    format: 'iife',
    platform: 'browser',
    target: 'chrome114',
  },
];

if (watch) {
  for (const options of builds) await (await esbuild.context(options)).watch();
} else {
  await Promise.all(builds.map((options) => esbuild.build(options)));
}
