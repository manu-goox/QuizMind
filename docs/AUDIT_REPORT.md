# Informe de Auditoría — QuizMind

|               |                                                                                         |
| ------------- | --------------------------------------------------------------------------------------- |
| **Fecha**     | 2026-10-09                                                                              |
| **Alcance**   | Auditoría completa según `docs/AUDITORIA.md` + mejoras UI/SFX y de respuesta al usuario |
| **Baseline**  | lint ✅, tsc ✅, 127/127 tests ✅ (sin cambios)                                         |
| **Resultado** | lint ✅, tsc ✅, **141/141 tests** ✅, build ✅, cobertura por encima de umbrales       |

## Resumen ejecutivo

La auditoría **no encontró hallazgos P0** (sin brechas de seguridad ni pérdida de datos). Se detectaron y **corrigieron 6 hallazgos P1, 9 P2 y 7 P3**, además de aplicar las mejoras de UI/SFX acordadas. La superficie XSS es nula (no existe `dangerouslySetInnerHTML` ni `eval`), el almacenamiento local queda validado campo a campo, y los JSON de test malformados siguen sin poder romper la aplicación.

## Hallazgos y correcciones

### P1 — Errores de flujo y robustez

| #   | Hallazgo                                                                                                      | Corrección                                                                                                             |
| --- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 1   | El temporizador se **reiniciaba al refrescar/reanudar** (se calculaba desde el montaje, no desde `startTime`) | Nueva utilidad pura `utils/timer.ts` (`getRemainingSeconds`) anclada a `startTime` persistido; integrada en `QuizPage` |
| 2   | `startTest` **no reseteaba `practiceMode`**: "Repetir test" y el repaso heredaban el modo anterior            | `startTest` fija `practiceMode: false`; "Repetir test" pasa por `/start` para reconfirmar el modo                      |
| 3   | El **repaso de fallos registraba historial** en modo normal con un subconjunto de preguntas (inflaba medias)  | El repaso se ejecuta en **modo práctica**: no registra y da feedback inmediato con explicación                         |
| 4   | "Repasar fallos" incluía preguntas **en blanco** (el nombre mentía)                                           | `collectFailedQuestions` devuelve solo preguntas respondidas incorrectamente                                           |
| 5   | Sin `ErrorBoundary`: cualquier error de render dejaba **pantalla en blanco**                                  | Nuevo `components/layout/ErrorBoundary` con fallback accesible y botón de reset que limpia la sesión                   |
| 6   | Sin ruta catch-all: URLs desconocidas renderizaban una **página vacía**                                       | `<Route path="*">` redirige a `/`                                                                                      |

### P2 — Validación, audio y UX destructiva

| #   | Hallazgo                                                                                                          | Corrección                                                                                      |
| --- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 7   | El validador **aceptaba `type: "multiple"`** no implementado (se puntuaba mal)                                    | Rechazado en validación con mensaje claro (decisión del usuario)                                |
| 8   | No se detectaban **ids duplicados** de preguntas (colisión de respuestas) ni de respuestas dentro de una pregunta | `superRefine` en `questionSchema` y `testSchema` con mensajes específicos                       |
| 9   | `readHistory` validaba solo 4 campos: datos corruptos en localStorage podían romper el render del historial       | Validación completa de los 10 campos de `HistoryEntry` (incluido `mode`)                        |
| 10  | El **tema persistido no se validaba**: un objeto malformado podía dejar la app sin estilos                        | Helper `isValidTheme` con fallback al tema por defecto                                          |
| 11  | `loadThemes` no filtraba entradas inválidas del índice                                                            | Filtro por `id`/`name`/`file` válidos; índice vacío → tema por defecto                          |
| 12  | **Carrera de autostart de música**: interactuar antes de que cargase `/sounds/index.json` dejaba la música muerta | Tras cargar el índice, si la música está habilitada y desbloqueada, arranca                     |
| 13  | Desbloqueo de audio **solo con click**: los usuarios de teclado no activaban el audio                             | Desbloqueo también con `keydown`                                                                |
| 14  | **Borrar historial del test sin confirmación** (acción destructiva)                                               | Confirmación inline en el modal ("Sí, borrar" / "Cancelar")                                     |
| 15  | Botón/atajo **Saltar activo en preguntas respondidas** (actuaba como "siguiente" encubierto)                      | Deshabilitado cuando la pregunta tiene respuesta (`canSkip` en `NavigationBar` + guarda en `S`) |

### P3 — Pulido, accesibilidad y consistencia

| #   | Hallazgo                                                                                             | Corrección                                                                              |
| --- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 16  | Sin soporte de `prefers-reduced-motion`                                                              | `<MotionConfig reducedMotion="user">` + media query en `global.css`                     |
| 17  | `@import` de Google Fonts **bloqueante** dentro del CSS                                              | `preconnect` + `<link>` con `display=swap` en `index.html`                              |
| 18  | Cambio de tema con **flash de contenido sin estilo** (link viejo eliminado antes de cargar el nuevo) | Swap en `onload`, rollback en `onerror`                                                 |
| 19  | `CircularProgress` con estilos inline                                                                | Migrado a CSS Module (el tamaño dinámico permanece inline)                              |
| 20  | Opciones de respuesta con `aria-pressed` (semántica incorrecta)                                      | `role="radiogroup"` en `QuestionCard` + `role="radio"`/`aria-checked` en `AnswerOption` |
| 21  | `ThemeSelector` sin `aria-expanded`, roles ni cierre con Escape                                      | `aria-haspopup="listbox"`, `aria-expanded`, roles `listbox`/`option`, Escape cierra     |
| 22  | Sliders de volumen sin valor visible ni `aria-valuetext`                                             | `aria-valuetext` con porcentaje + indicador visible                                     |

## Mejoras UI/SFX aplicadas (alcance equilibrado)

- **Preview sonoro** al mover el slider de volumen de efectos (limitado por el cooldown de 80 ms).
- **Nuevos sonidos `correct`/`incorrect`** (arpegio ascendente suave / tono grave corto) con feedback inmediato en modo práctica según el acierto.

## Decisiones del usuario

1. `type: "multiple"` → **rechazado en validación** (no implementado en el reproductor).
2. Repaso de fallos → **solo preguntas respondidas incorrectamente**.
3. Repaso de fallos → **modo práctica** (sin historial, feedback inmediato).
4. Alcance UI/SFX → **equilibrado** (sin features nuevas grandes).

## Observaciones sin cambio (registradas)

- **Resultados no sobreviven un refresh en `/results`** (redirige a Home): la sesión persistida se limpia al finalizar; comportamiento por diseño.
- `HistoryEntry.testTitle` se almacena pero no se muestra: dato preparado para un futuro panel global de historial.
- `muteAll` existe en el store sin botón dedicado (los toggles individuales cubren el caso).
- No se añadió CSP meta tag: SPA estática sin endpoints, superficie XSS nula; riesgo residual bajo.

## Verificación final

| Comando                 | Resultado                                                                                                 |
| ----------------------- | --------------------------------------------------------------------------------------------------------- |
| `npm run format`        | ✅                                                                                                        |
| `npm run lint`          | ✅                                                                                                        |
| `npx tsc --noEmit`      | ✅                                                                                                        |
| `npm run test:coverage` | ✅ **141/141 tests** (15 archivos)                                                                        |
| Cobertura global        | statements **92.37%**, branches **84.18%**, functions **97.36%**, lines **94.56%** (umbrales 85/70/90/85) |
| `npm run build`         | ✅ PWA generada (48 entradas en precaché, ~852 KiB)                                                       |
