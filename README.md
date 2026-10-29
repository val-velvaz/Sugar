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

Todos están en la paleta (`Ctrl+Shift+P`) bajo la categoría **Sugar Collage**.

<!-- comandos:inicio -->

| Comando | ID |
| --- | --- |
| Aplicar configuración tipográfica recomendada | `sugarCollage.applyTypography` |
| Restaurar configuración tipográfica | `sugarCollage.restoreTypography` |
| Elegir variante de tema | `sugarCollage.selectTheme` |
| Mis pendientes | `sugarCollage.showTodos` |
| Activar/desactivar cintas washi en comentarios | `sugarCollage.toggleWashi` |
| Activar/desactivar indentación arcoíris | `sugarCollage.toggleIndentRainbow` |
| Abrir Mi Scrapbook | `sugarCollage.openScrapbook` |
| Nueva nota adhesiva | `sugarCollage.addNote` |
| Pomodoro: empezar | `sugarCollage.pomodoro.start` |
| Pomodoro: pausar | `sugarCollage.pomodoro.pause` |
| Pomodoro: empezar o pausar | `sugarCollage.pomodoro.toggle` |
| Pomodoro: reiniciar | `sugarCollage.pomodoro.reset` |

<!-- comandos:fin -->

## Configuración

<!-- configuracion:inicio -->

**Tipografía**

| Opción | Por defecto | Descripción |
| --- | --- | --- |
| `sugarCollage.typography.fontSize` | `14` | Tamaño de letra del editor que aplica el comando **Aplicar configuración tipográfica recomendada**. |
| `sugarCollage.typography.lineHeight` | `1.6` | Interlineado recomendado. Entre 0 y 8 se interpreta como multiplicador del tamaño de letra (1.6 = 160 %). |
| `sugarCollage.typography.letterSpacing` | `0.3` | Espaciado entre letras recomendado, en píxeles. |

**Tema automático**

| Opción | Por defecto | Descripción |
| --- | --- | --- |
| `sugarCollage.autoTheme.mode` | `"off"` | Cambio automático de variante de tema. Se puede activar desde **Sugar Collage: Elegir variante de tema**. |
| `sugarCollage.autoTheme.lightTheme` | `Sugar Collage Light – Alg…` | Tema claro que se usa de día o cuando el sistema está en modo claro. |
| `sugarCollage.autoTheme.darkTheme` | `"Sugar Collage Dark"` | Tema oscuro que se usa de noche o cuando el sistema está en modo oscuro. |
| `sugarCollage.autoTheme.dayStart` | `"07:00"` | Hora (HH:MM) a partir de la cual se usa el tema claro en el modo **hora**. |
| `sugarCollage.autoTheme.nightStart` | `"19:30"` | Hora (HH:MM) a partir de la cual se usa el tema oscuro en el modo **hora**. |

**Cintas washi en comentarios**

| Opción | Por defecto | Descripción |
| --- | --- | --- |
| `sugarCollage.washi.enabled` | `true` | Decora con cinta washi pastel los comentarios que empiezan con `TODO`, `FIXME`, `NOTE`, `HACK`, `IDEA` o `?`, en cualquier lenguaje. |
| `sugarCollage.washi.tags` | `["TODO", "FIXME", "NOTE", …]` | Etiquetas que se decoran. Quita las que no quieras ver resaltadas. |
| `sugarCollage.washi.gutterIcons` | `true` | Muestra un ícono en el margen (cinta, curita, nota, cinta cruzada, estrella o burbuja) junto a cada etiqueta. |

**Mis pendientes**

| Opción | Por defecto | Descripción |
| --- | --- | --- |
| `sugarCollage.todos.exclude` | `**/{node_modules,dist,out…` | Patrón glob de carpetas y archivos que **no** se revisan al buscar pendientes en el workspace. |
| `sugarCollage.todos.maxFiles` | `3000` | Número máximo de archivos que se revisan al buscar pendientes. |

**Indentación arcoíris**

| Opción | Por defecto | Descripción |
| --- | --- | --- |
| `sugarCollage.indent.enabled` | `true` | Colorea cada nivel de indentación con la paleta pastel en rotación. |
| `sugarCollage.indent.mode` | `"guias"` | Cómo se dibuja la indentación: **guias** (líneas finas) o **fondo** (bandas de color). |
| `sugarCollage.indent.opacity` | `0.45` | Opacidad de las guías o bandas (0.02–1). En modo **fondo** se recomienda 0.1–0.2. |
| `sugarCollage.indent.intensity` | `"suave"` | Intensidad del color de cada nivel. |
| `sugarCollage.indent.excludeLanguages` | `["plaintext"]` | Lenguajes (languageId) en los que no se dibuja la indentación arcoíris. |

**Scrapbook**

| Opción | Por defecto | Descripción |
| --- | --- | --- |
| `sugarCollage.scrapbook.background` | `"cuadricula"` | Fondo del panel **Mi Scrapbook**. También se cambia con los botones de su encabezado. |
| `sugarCollage.sparkleLevel` | `2` | Cuánta decoración aparece en los paneles de Sugar Collage (0 = minimalista, 3 = maximalista). No afecta al editor. |

**Pomodoro Galletita**

| Opción | Por defecto | Descripción |
| --- | --- | --- |
| `sugarCollage.pomodoro.workMinutes` | `25` | Duración de una ronda de trabajo ("horneado"), en minutos. |
| `sugarCollage.pomodoro.shortBreakMinutes` | `5` | Duración del descanso corto, en minutos. |
| `sugarCollage.pomodoro.longBreakMinutes` | `15` | Duración del descanso largo, en minutos. |
| `sugarCollage.pomodoro.longBreakEvery` | `4` | Cada cuántas rondas de trabajo toca un descanso largo. |
| `sugarCollage.pomodoro.autoStartNext` | `false` | Empieza la siguiente fase (descanso o trabajo) automáticamente al terminar la anterior. |
| `sugarCollage.pomodoro.showInStatusBar` | `true` | Muestra la galletita con el tiempo restante en la barra de estado. |

<!-- configuracion:fin -->

## Decoraciones

- **Cintas washi**: cada `TODO`, `FIXME`, `NOTE`, `HACK`, `IDEA` o `?` en un comentario (en cualquier lenguaje: `//`,
  `/* */`, `#`, `--`, `;`, `<!-- -->`…) recibe una cinta pastel redondeada, un ícono en el margen (cinta, curita, nota,
  cinta cruzada, estrella o burbuja) y una marca en la regla derecha. Al pasar el mouse aparece la etiqueta con acciones:
  _Marcar como hecho_ (la cambia por `DONE ✓`), _Mis pendientes_ y _Buscar en el workspace_.
- **Indentación arcoíris**: rota bubblegum → durazno → mantequilla → pistache → cielo → lavanda, en modo guías o fondo;
  solo se dibuja en las líneas visibles para no pesar en archivos grandes.
- El chequeo de contraste también verifica que el texto y la etiqueta sobre cada cinta superen 4.5:1.
- `npm run preview:decorations` genera `.preview/decorations.html`.

## Mi Scrapbook

Panel propio en la Activity Bar (ícono de nota con destello):

- **Notas adhesivas**: crear, editar (se guarda solo), cambiar color (8 pasteles), fijar arriba y borrar (con doble clic
  de seguridad). Cada nota es **del proyecto** (`workspaceState`) o **global** (`globalState`). Se ven como post-its con
  chincheta, inclinados ±2°, con sombra suave y cinta washi.
- **Libreta**: checklist sobre papel rayado con margen rosa; las casillas son botones de costura.
- **Galletitas**: control del Pomodoro y barras pastel con las galletas de los últimos 7 días.
- **Mis pendientes**: todos los `TODO`/`FIXME`/… del workspace; un clic abre el archivo en esa línea. Se refresca al guardar.
- Fondo **cuadrícula**, **gingham** o **liso**; tipografía Nunito Sans (cuerpo), Tinos (títulos) y Fira Code (rutas y código).
- `sugarCollage.sparkleLevel` controla los adornos: 0 sin inclinaciones ni estampados, 3 con destellos animados
  (siempre respetando `prefers-reduced-motion`).
- Seguridad: CSP estricta con `nonce`, sin `innerHTML` para contenido del usuario, y cada mensaje del webview se valida.
- `npm run preview:scrapbook` genera `.preview/scrapbook-*.html` con datos de ejemplo.

## Pomodoro "Galletita"

- En la barra de estado: 🍪 mientras horneas, 🥛 en el descanso corto y 🧁 en el largo, con el tiempo restante; un clic
  empieza o pausa, y el tooltip muestra las galletas de hoy y accesos rápidos.
- Al terminar una ronda de trabajo ganas una galleta y aparece un mensaje dulce al azar; cada 4 rondas toca descanso largo.
- El temporizador sobrevive a recargar la ventana (se guarda en `globalState`).

## Fuentes

`media/fonts/` incluye Fira Code, Nunito Sans y Tinos en `.woff2` (licencia SIL OFL 1.1, ver `OFL-*.txt`), copiadas
desde los paquetes `@fontsource` con `npm run generate:fonts`. Se usan en los paneles y en la vista previa de Markdown;
para el editor, Fira Code tiene que estar instalada en el sistema.
