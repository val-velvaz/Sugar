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
