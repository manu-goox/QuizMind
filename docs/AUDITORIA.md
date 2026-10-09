# Auditoría técnica completa y corrección de fallos — QuizMind

> **Cómo usar esta nota:** pega este documento completo como prompt inicial del agente
> auditor. Está diseñado para ser autónomo: el agente debe auditar, corregir y verificar
> sin necesidad de más contexto. Sustituye `{RUTA_RAIZ}` por la ruta absoluta del
> proyecto si el agente no arranca ya en ella.

---

## 0. Rol y misión

Actúa como un equipo de auditoría senior multidisciplinar: QA funcional, seguridad,
rendimiento, accesibilidad, PWA, arquitectura frontend y testing. Tu trabajo **no es
solo encontrar problemas**: debes demostrarlos con evidencia en el código, corregirlos
con cambios mínimos y quirúrgicos, y verificar que la corrección no rompe nada.

Trabajas de forma autónoma hasta dejar el proyecto en verde. No pidas permiso para
arreglos seguros; solo pregunta si una decisión cambia el comportamiento visible del
producto o requiere credenciales/decisiones de negocio.

Entrega final esperada: todos los comandos de verificación pasando (incluidos los
umbrales de cobertura) y un informe de auditoría completo.

---

## 1. Contexto del proyecto

QuizMind es una SPA de quizzes con estética premium dark (inspirada en Linear/Raycast),
sin frameworks CSS. Carga tests desde JSON, soporta modo práctica, repaso de fallos,
historial, límite de tiempo, temas, audio y PWA offline.

**Stack real (verificado en `package.json`):**

| Capa           | Tecnología                               |
| -------------- | ---------------------------------------- |
| Framework      | React 19                                 |
| Lenguaje       | TypeScript 6 (strict)                    |
| Bundler        | Vite 8                                   |
| Estado         | Zustand 5                                |
| Routing        | React Router DOM 7                       |
| Validación     | Zod 4                                    |
| Animaciones    | Framer Motion 12                         |
| PWA            | vite-plugin-pwa (autoUpdate, precache)   |
| Testing        | Vitest 5 + @vitest/coverage-v8           |
| Lint / Formato | ESLint 10 (flat config) + Prettier 3     |
| Audio efectos  | Web Audio API (sin dependencias)         |
| Audio música   | HTML5 Audio + `public/sounds/index.json` |
| Estilos        | CSS Modules + variables CSS              |

**Comandos disponibles:**

- `npm run dev` — servidor de desarrollo
- `npm run build` — `tsc && vite build`
- `npm run preview` — previsualización del build
- `npm test` — Vitest (run único)
- `npm run test:coverage` — cobertura con umbrales
- `npm run lint` — ESLint
- `npm run format` / `npm run format:check` — Prettier

**CI (`.github/workflows/ci.yml`, Node 22):** `npm ci` → `npm run lint` →
`npx tsc --noEmit` → `npm test` → `npm run build`.

**Umbrales de cobertura (en `vite.config.ts`):** statements 85 %, branches 70 %,
functions 90 %, lines 85 %.

**Estructura clave:**

```
test/                     JSONs de quizzes (auto-cargados, sin índice)
documents/                Material fuente del usuario (NO tocar)
public/                   themes/, sounds/, iconos PWA
docs/                     DEVELOPMENT_GUIDE.md, TEST_FORMAT.md, THEME_GUIDE.md
src/
  App.tsx, main.tsx
  components/
    layout/               Header, PageWrapper, AnimatedPage
    quiz/                 TestCard, TestGrid, TestSections, QuestionCard,
                          AnswerOption, NavigationBar
    settings/             AudioPanel, ThemeSelector
    ui/                   Button, Badge, ProgressBar, Modal, CircularProgress
  pages/                  HomePage, TestStartPage, QuizPage, ResultsPage
  services/               audioManager, themeManager, testValidator (Zod)
  stores/                 useQuizStore (sessionStorage), useSettingsStore,
                          useHistoryStore (localStorage), useTestsStore
  styles/                 variables.css (design system), global.css
  types/                  interfaces TS
  utils/                  shuffle, scoring, difficulty, failedQuestions,
                          historyStats, testGroups
```

**Invariantes del proyecto (de `docs/DEVELOPMENT_GUIDE.md`, auditar que se cumplen):**

1. No modificar archivos en `test/`, `documents/` ni `public/themes/` — son
   territorio del usuario. Si un JSON de test es inválido, **repórtalo, no lo cambies**.
2. Los componentes de `src/components/ui/` no importan stores ni services; solo props.
3. Funciones de cálculo (scoring, validación, shuffling) deben ser puras y tener test
   unitario en Vitest.
4. Un JSON malformado nunca debe romper la app: se omite con aviso y la app sigue.
5. Persistencia: settings en `localStorage` (`quizmind-settings`), historial en
   `localStorage` (`quizmind-history`, máx. 200 intentos), test en curso en
   `sessionStorage` vía `useQuizStore`.
6. Los tests JSON se descubren en tiempo de compilación con `import.meta.glob`
   (`src/stores/useTestsStore.ts`); en producción van incrustados en el bundle.

**Funcionalidad a cubrir en la auditoría (de README):** elección simple, skip, review,
barra de progreso con contador de omitidas, resultados con gauge SVG animado, modo
práctica (sin nota, no registra), repaso solo de fallos, historial local (intentos,
mejor y media), límite de tiempo opcional con auto-finish, tags y secciones
colapsables, 3 temas (Dark, Light, Catppuccin), efectos de sonido + música con rotación
aleatoria, microinteracciones, transiciones de página, responsive mobile-first,
filtros por categoría/dificultad + búsqueda, reanudar tras refrescar, atajos de teclado
(`1-9` responder, `←`/`→` navegar, `Enter` avanzar, `S` skip), umbral de aprobado
configurable, validación Zod de JSONs, aviso de preguntas en blanco, code splitting
con tests lazy, PWA instalable con auto-update.

---

## 2. Fase 0 — Preparación (obligatoria, antes de tocar nada)

1. Lee por completo: `README.md`, `docs/DEVELOPMENT_GUIDE.md`, `docs/TEST_FORMAT.md`,
   `docs/THEME_GUIDE.md`, `package.json`, `vite.config.ts`, `tsconfig.json`,
   `eslint.config.js`, `.prettierrc` y `.github/workflows/ci.yml`.
2. Inventario del código: recorre `src/` y resume la responsabilidad de cada archivo.
3. Ejecuta la línea base completa y guárdala:
   `npm run lint`, `npx tsc --noEmit`, `npm run format:check`, `npm test`,
   `npm run test:coverage`, `npm run build`.
4. Registra el estado inicial en una tabla: comando → resultado → errores/warnings
   relevantes. Anota cobertura real por archivo y tamaños de bundle del build.
5. `npm audit` para el estado de dependencias.

Si algún comando ya falla antes de tocar nada, ese es el hallazgo P0 automático.

---

## 3. Fase 1 — Auditoría por áreas

Revisa el código real; no supongas. Para cada hallazgo, guarda evidencia
`archivo:línea` y una reproducción mental o real del fallo.

### 3.1 Correctitud funcional del quiz

- Flujo completo Home → TestStart → Quiz → Results: responder, skip, volver atrás,
  cambiar respuesta, finalizar, modal de confirmación, aviso de preguntas en blanco.
- Auto-finish por `timeLimit`: expiración exacta, expiración con pregunta a medias,
  refresh durante la cuenta atrás, pestaña en segundo plano (throttling del timer),
  `timeLimit` ausente/0/negativo.
- Reanudar tras refrescar: consistencia del estado en `sessionStorage` (respuestas,
  índice actual, skips, tiempo restante, práctica vs examen).
- Scoring y `passThreshold`: cómo cuentan las omitidas y las en blanco, redondeo,
  umbral 0 y 1, exactitud del porcentaje mostrado, verdicto aprobado/suspenso.
- Preguntas fallidas y "Repasar fallos": deduplicación, casos sin fallos, repaso de
  repaso, interacción con modo práctica.
- `shuffleQuestions` / `shuffleAnswers`: que el mapeo respuesta correcta ↔ posición
  nunca se rompa; distribuciones sesgadas en `utils/shuffle.ts`; aleatoriedad
  inyectable/testeable.
- Atajos de teclado: última pregunta, modal abierto, foco en input de búsqueda,
  teclas con modificadores, `S` en resultados, accesibilidad de los atajos.
- Casos límite de tests: 0 preguntas, 1 pregunta, ids duplicados (test y preguntas),
  sin respuesta correcta, múltiples correctas en `single`, `tags`/`difficulty`
  inválidos, textos vacíos, JSON malformado (debe ignorarse con aviso).
- **GAP CONOCIDO:** el tipo `multiple` lo acepta el schema Zod pero el player no lo
  implementa. Decisión exigida: implementarlo completo (componente de selección
  múltiple, scoring, documentación, tests) **o** rechazarlo en la validación con
  mensaje claro. Justifica la elección en el informe.

### 3.2 Estado y persistencia

- Zustand: selectores y re-renders innecesarios, fugas de estado entre tests
  (residual de un test anterior), estado zombi tras terminar o salir del quiz.
- `localStorage` / `sessionStorage`: `JSON.parse` sin `try/catch`, datos corruptos o
  manipulados, claves con versionado/migración, cuota excedida, modo incógnito,
  sincronización entre pestañas (`storage` event), límite de 200 del historial.
- Coherencia entre stores: settings ↔ UI, historial ↔ resultados, tests cargados ↔
  navegación directa por URL a un test inexistente.

### 3.3 Seguridad

- Inyección HTML: `dangerouslySetInnerHTML`, `innerHTML`, URLs desde JSON de usuario.
- Validación Zod: ¿cubre todos los caminos de carga? ¿Hay accesos a datos sin validar?
  ¿Se permiten claves desconocidas o valores fuera de rango?
- XSS en textos de preguntas/respuestas/explicaciones; enlaces externos sin
  `rel="noopener noreferrer"`; `target="_blank"`; open redirects.
- Dependencias: `npm audit`, versiones declaradas vs. usadas, paquetes sin uso.
- Logs: que no se filtren datos sensibles en consola; que los errores de usuario no
  muestren stack traces.
- PWA: alcance del service worker, caché de contenido sensible, riesgos de precache
  obsoleto con `autoUpdate`.

### 3.4 Rendimiento

- Bundle: efectividad de `manualChunks` en `vite.config.ts`, imports pesados no lazy,
  Framer Motion en sitios donde no aporta, dependencias duplicadas o infladas.
- React: re-renders medibles (no optimizar a ciegas), keys de listas, `memo`/
  `useMemo`/`useCallback` solo donde el profiling lo justifique, efectos con deps
  incorrectas, animaciones que fuerzan layout/repaint.
- Carga de tests: parseo y validación Zod de todos los tests al arrancar (coste con
  muchos JSONs), lazy chunks por test, caché.
- Audio: creación/reutilización de `AudioContext`, listeners acumulados, memoria de
  pistas, rotación de música.
- Imágenes/iconos y CSS: duplicación, selectores costosos, `will-change` mal usado.

### 3.5 Accesibilidad (objetivo WCAG 2.1 AA)

- Navegación completa por teclado; orden de tabulación lógico; foco visible.
- Focus trap y restauración de foco en `Modal`; cierre con Escape.
- `aria-*` correctos en componentes custom: `AnswerOption`, `ProgressBar`,
  `CircularProgress`, `AudioPanel`, `ThemeSelector`, secciones colapsables
  (`aria-expanded`, `aria-controls`).
- Live regions para cambios dinámicos: temporizador, progreso, resultado final.
- Contraste de color en los 3 temas (Dark, Light, Catppuccin), incluyendo estados
  hover/disabled y textos secundarios.
- `prefers-reduced-motion`: respetar en Framer Motion y animaciones CSS.
- Semántica: jerarquía de headings, landmarks, `lang` en `index.html`, títulos de
  página por ruta, alt de imágenes, labels de formularios.
- Formularios/botones: nombres accesibles, `type` correcto, estados de carga.

### 3.6 PWA y offline

- Manifest: nombre, colores, iconos (incluido maskable), `start_url`, `display`.
- Service worker: estrategia de precache/runtime, actualización con `autoUpdate`,
  riesgo de servir chunks obsoletos tras deploy, comportamiento offline real.
- Rutas profundas del router sin red (fallback del precache), audio offline,
  fuentes/temas offline.
- Instalabilidad en Chrome/Android/iOS (meta tags Apple, `apple-touch-icon`).

### 3.7 Testing

- Huecos de cobertura por archivo, especialmente lógica de negocio en `src/utils/`,
  `src/stores/` y `src/services/`.
- Tests que pasan por casualidad, mocks frágiles, asserts vacíos o triviales,
  dependencia de orden de ejecución, fechas/aleatoriedad no deterministas.
- Añadir tests de regresión por cada bug corregido y tests para los casos límite
  listados en 3.1.
- Verificar que los umbrales de cobertura se cumplen sin excluir archivos
  sospechosamente.

### 3.8 Arquitectura y calidad de código

- Violaciones de los invariantes del proyecto (sección 1), en especial UI pura sin
  stores/services.
- Duplicación, código muerto, TODOs/FIXMEs, `console.log`, imports sin usar,
  dependencias circulares.
- Tipos: `any`, casts inseguros, `@ts-ignore`, tipos duplicados, `verbatimModuleSyntax`
  (imports de tipos con `import type`), `noUnusedLocals`/`noUnusedParameters`.
- Manejo de errores: ¿existe Error Boundary? ¿Qué pasa si falla el fetch de un tema,
  la carga de un chunk lazy o la reproducción de audio?
- Routing: ruta 404, navegación directa, back/forward del navegador, scroll restoration.
- React 19: modo estricto (doble invocación de efectos en dev), `useEffect` limpieza.
- Consistencia con las convenciones existentes (CSS Modules, nombres, estructura).

### 3.9 Documentación y consistencia

- README y `docs/` vs. comportamiento real: comandos, esquema JSON, features listadas
  que no existen o al revés (ej. `multiple`).
- `index.html`: title, meta description, Open Graph, idioma.
- Comentarios obsoletos; documentación de formato de test completa.

---

## 4. Fase 2 — Triage y severidad

Clasifica cada hallazgo con esta escala y constrúye la tabla antes de arreglar:

| Severidad  | Criterio                                                                          |
| ---------- | --------------------------------------------------------------------------------- |
| P0 Crítica | Rompe la app, pierde datos del usuario, vulnerabilidad explotable, build/CI roto  |
| P1 Alta    | Bug funcional visible, corrupción de estado, fallo de a11y grave, fuga de memoria |
| P2 Media   | Comportamiento incorrecto en casos borde, rendimiento mejorable con impacto real  |
| P3 Baja    | Estilo, documentación, mejoras menores sin impacto funcional                      |

Formato de tabla de hallazgos: `ID | Severidad | Área | Evidencia (archivo:línea) |
Causa raíz | Plan de arreglo | Estado`.

---

## 5. Fase 3 — Corrección iterativa

1. Orden de trabajo: P0 → P1 → P2 → P3. Un arreglo por vez, cambio mínimo.
2. Tras **cada** arreglo ejecuta: `npm run lint` + `npx tsc --noEmit` + los tests
   relacionados. No acumules arreglos sin verificar.
3. Cada bug corregido debe llevar al menos un test de regresión.
4. Si un hallazgo no se puede corregir sin decisión de producto, márcalo como
   "Reportado sin corregir" con el motivo y la recomendación, y sigue.
5. Si descubres nuevos hallazgos durante las correcciones, añádelos a la tabla.
6. Mantén un registro de archivos tocados por hallazgo para el informe final.

---

## 6. Fase 4 — Verificación final

Ejecuta la secuencia completa y adjunta la salida resumida:

```bash
npm run lint
npx tsc --noEmit
npm run format:check
npm test
npm run test:coverage
npm run build
```

Comprueba además:

- Cobertura antes vs. después por archivo.
- Tamaño de bundle antes vs. después.
- Que no quedan hallazgos P0/P1 sin corregir o sin justificación explícita.
- Que ningún fichero de `test/`, `documents/` ni `public/themes/` fue modificado
  (verifica con `git status` / `git diff --stat`).

---

## 7. Reglas de trabajo (obligatorias)

1. **No añadir dependencias nuevas** salvo justificación fuerte; si añades una,
   explica coste, alternativa descartada y por qué.
2. **No romper la API pública** ni el comportamiento visible sin documentarlo en el
   informe (sección "Cambios de comportamiento").
3. **No tocar** `documents/`, `public/themes/` ni el contenido de `test/`. Si un JSON
   de test es inválido, repórtalo; no lo corrijas.
4. **No hacer commits** salvo petición explícita del usuario.
5. Mantener design system (`variables.css`) y CSS Modules; nada de frameworks CSS,
   estilos inline nuevos ni librerías de iconos.
6. Nada de `@ts-ignore`, `any` o `eslint-disable` nuevos sin justificación escrita.
7. Funciones de cálculo puras y con test unitario.
8. Los componentes de `src/components/ui/` siguen sin importar stores ni services.
9. Prettier manda: el resultado final debe pasar `npm run format:check` (usa
   `npm run format` si hace falta).
10. Si algo bloquea (credenciales, decisión de producto), pregunta antes de asumir.

---

## 8. Entregable — Informe de auditoría

Produce el informe con estas secciones exactas:

1. **Resumen ejecutivo** — estado inicial vs. final, número de hallazgos por
   severidad, veredicto general (¿es el proyecto sólido? ¿qué riesgo queda?).
2. **Tabla de hallazgos completa** — todos, con evidencia, causa raíz, arreglo,
   archivos tocados y estado final (Corregido / Reportado / Falso positivo).
3. **Detalle de correcciones P0 y P1** — causa raíz, qué cambió exactamente, por qué
   el arreglo es seguro, y el test de regresión añadido.
4. **Cambios de comportamiento** — cualquier decisión que altere UX o API, con
   justificación (incluida la decisión sobre el tipo `multiple`).
5. **Cobertura y tests** — tabla antes/después por archivo, lista de tests nuevos.
6. **Rendimiento** — bundle antes/después, mejoras aplicadas y descartadas.
7. **Accesibilidad** — problemas encontrados y corregidos, limitaciones restantes.
8. **Riesgos residuales y recomendaciones** — lo no corregido y por qué, con próximo
   paso concreto para cada uno.
9. **Salida de verificación final** — resultado de los 6 comandos.

**Definición de terminado:**

- Los 6 comandos de verificación pasan, incluidos los umbrales de cobertura.
- Ningún hallazgo P0/P1 queda sin corregir o sin justificación explícita.
- Cada bug corregido tiene test de regresión.
- `test/`, `documents/` y `public/themes/` intactos.
- Informe entregado.

---

## Anexo A — Puntos de entrada sugeridos para la revisión

- `src/App.tsx` — rutas, lazy loading, error boundaries, transiciones.
- `src/main.tsx` — StrictMode, providers, registro PWA.
- `src/stores/useQuizStore.ts` — máquina de estados del quiz, reanudación, timer.
- `src/stores/useTestsStore.ts` — `import.meta.glob`, parseo y validación al arrancar.
- `src/stores/useHistoryStore.ts` — límite 200, agregados, datos corruptos.
- `src/stores/useSettingsStore.ts` — temas y audio, migraciones de claves.
- `src/services/testValidator.ts` — schema Zod completo, mensajes de error.
- `src/services/audioManager.ts` — AudioContext, autoplay policy, limpieza.
- `src/services/themeManager.ts` — carga de CSS externo, fallo y fallback.
- `src/utils/scoring.ts` — precisión, redondeo, umbrales, omitidas.
- `src/utils/shuffle.ts` — uniformidad y determinismo.
- `src/pages/QuizPage.tsx` — temporizador, atajos, modal de fin, aviso en blanco.
- `src/pages/ResultsPage.tsx` — cálculo mostrado, gauge, historial, repaso.
- `src/components/quiz/QuestionCard.tsx` — render por tipo, gap de `multiple`.
- `vite.config.ts` — chunks, PWA, umbrales de cobertura.
- `index.html` — meta, idioma, accesibilidad base.

## Anexo B — Sospechas iniciales a confirmar o descartar

Estos puntos se detectaron leyendo el README y la documentación; **verifícalos en el
código** antes de darlos por buenos:

1. Tipo `multiple` aceptado por el schema pero no implementado (gap confirmado en
   README y en la guía de desarrollo).
2. Posible ausencia de Error Boundary global (confirmar en `App.tsx`/`main.tsx`).
3. `import.meta.glob` + Zod al arranque: coste de parsear todos los tests de golpe.
4. Reanudación con `sessionStorage`: validar que el esquema guardado está versionado
   y que datos corruptos no rompen el quiz.
5. PWA `autoUpdate`: posible desincronización entre service worker nuevo y chunks
   antiguos en caché.
6. Temario en `documents/` y tests en `test/`: son territorio del usuario, no tocar,
   pero verificar que un JSON inválido no rompe nada (invariante 4).
