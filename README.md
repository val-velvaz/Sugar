# Sugar Collage ✦

Extensión personal de VS Code: un scrapbook dulce y algo surreal, cómodo para programar durante horas.

> En construcción, por fases. La documentación completa llega en la fase 11.

## Desarrollo

```bash
npm install
npm run build      # genera temas, verifica contraste y empaqueta
npm test           # tests unitarios
```

Pulsa **F5** en VS Code para abrir el Extension Development Host.

## Sistema de diseño

- `src/design/tokens.ts` es la única fuente de verdad (`tokens.json` es su exportación generada).
- `npm run generate:themes` genera `themes/*.json` y `contributes.themes`.
- `npm run check:contrast` falla si algún color no cumple WCAG (≥ 4.5:1 en texto, ≥ 3:1 en UI).
  Usa `--verbose` para ver todas las combinaciones.
- `npm run preview:themes` genera `.preview/themes.html`, una maqueta de los 6 temas con código C, ASM, SQL y TS.

## Temas

| Tema                  | Base                                       | Para              |
| --------------------- | ------------------------------------------ | ----------------- |
| Sugar Collage Dark    | carbón #414040                             | el día a día      |
| Light – Algodón       | rosa algodón                               | mañanas suaves    |
| Light – Pistache      | menta / pistache                           | frescura          |
| Light – Lavanda       | lila / cielo                               | días oníricos     |
| Light – Crema         | crema / mantequilla                        | papel de libreta  |
| Sugar Collage Maximal | ciruela + morado eléctrico, magenta y lima | días maximalistas |

El mapeo de sintaxis es el mismo en los seis. Los oscuros usan el pastel puro y los claros su versión oscurecida.
Ensamblador (NASM/x86) distingue registros, instrucciones, directivas y etiquetas. C/C++, SQL, Rust, Python, Java y TS/JS
tienen colores semánticos, y además hay reglas para Markdown, JSON, YAML, CSS, notebooks y logs.

## Íconos de archivos

`Sugar Collage Icons` (Preferencias › Tema de íconos de archivo) usa SVG originales generados desde `src/design/svg.ts`:
cuentas de pulsera con letras (C, H, C++, Py, TS, JS, `{}`, `<>`, Y), botones de costura, galletas, sellos de cera,
un pastel por capas (SQL), una dona (CSS), papel de libreta (Markdown), libreta de espiral (Jupyter), una taza (Java),
un cupcake (Makefile), cubos de azúcar (Dockerfile), una caja de regalo (package.json), un destello (README) y una polaroid (imágenes).
Las carpetas son notas adhesivas con chincheta (abiertas y cerradas), con emblemas para `src`, `test`, `docs`, `assets`,
`.vscode` y `.git`; `node_modules` es una galleta mordida. Hay variantes dark y light.

- `npm run generate:icons` regenera `media/icons/` y `themes/sugar-collage-icon-theme.json`.
- `npm run preview:icons` genera `.preview/icons.html` con todos los íconos sobre el fondo de cada tema.

## Comandos

| Comando (paleta: `Ctrl+Shift+P`)                                 | Qué hace                                                                                                                                                                                                                                                             |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Sugar Collage: Aplicar configuración tipográfica recomendada** | Muestra un diff de tus settings actuales frente a los recomendados (Fira Code con ligaduras `'calt', 'liga'`, tamaño, interlineado y espaciado), pide confirmación y guarda un respaldo en `globalState`. Si Fira Code no está instalada, ofrece abrir Google Fonts. |
| **Sugar Collage: Restaurar configuración tipográfica**           | Vuelve a los valores que tenías antes de aplicar la recomendación.                                                                                                                                                                                                   |
| **Sugar Collage: Elegir variante de tema**                       | QuickPick con los 6 temas, swatch en emoji y vista previa en vivo. Incluye "Automático por hora del día" y "Sincronizar con el sistema".                                                                                                                             |

## Configuración

| Opción                                  | Por defecto | Descripción                                              |
| --------------------------------------- | ----------- | -------------------------------------------------------- |
| `sugarCollage.typography.fontSize`      | `14`        | Tamaño de letra recomendado.                             |
| `sugarCollage.typography.lineHeight`    | `1.6`       | Interlineado (multiplicador).                            |
| `sugarCollage.typography.letterSpacing` | `0.3`       | Espaciado entre letras (px).                             |
| `sugarCollage.autoTheme.mode`           | `off`       | `off`, `hora` (según la hora) o `sistema` (según el SO). |
| `sugarCollage.autoTheme.lightTheme`     | Algodón     | Tema claro para el día o el modo claro del sistema.      |
| `sugarCollage.autoTheme.darkTheme`      | Dark        | Tema oscuro para la noche o el modo oscuro del sistema.  |
| `sugarCollage.autoTheme.dayStart`       | `07:00`     | Inicio del día (modo `hora`).                            |
| `sugarCollage.autoTheme.nightStart`     | `19:30`     | Inicio de la noche (modo `hora`).                        |
