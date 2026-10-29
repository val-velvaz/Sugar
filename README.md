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
