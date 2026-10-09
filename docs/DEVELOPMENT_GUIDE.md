# Guía de Desarrollo

Este documento es para desarrolladores que trabajen en el proyecto después del lanzamiento inicial.

## Requisitos y Comandos

- Node.js ≥ 18 y `npm install`
- `npm run dev` — servidor de desarrollo
- `npm run build` — typecheck (`tsc`) + build de producción
- `npm test` — tests unitarios (Vitest)
- `npm run test:coverage` — cobertura (umbrales en `vite.config.ts`)
- `npm run lint` — ESLint (flat config en `eslint.config.js`)
- `npm run format` / `npm run format:check` — Prettier (`.prettierrc`)

## Carga de Tests

Los JSON de la carpeta `test/` (raíz) se descubren en tiempo de compilación con `import.meta.glob` (`src/stores/useTestsStore.ts`), se parsean y validan con Zod al arrancar, y quedan en memoria. No hay índice ni fetch.

- En desarrollo, añadir/quitar un `.json` en `test/` provoca una recarga automática.
- En producción los tests van incrustados en el bundle: hay que recompilar (`npm run build`) tras añadir archivos.
- Un JSON malformado se omite con aviso visible; nunca rompe la app.

## Organización y Extras

- `src/utils/testGroups.ts` — agrupa por categoría, ordena y filtra por tags (chips de la Home)
- `src/utils/failedQuestions.ts` — preguntas falladas (solo respondidas incorrectas) para el botón "Repasar fallos", que arranca en modo práctica (feedback inmediato, no registra historial)
- `src/utils/historyStats.ts` — mejor/media nota del historial por test
- Modo práctica y límite de tiempo (`timeLimit` en el JSON) se gestionan en `useQuizStore` + `QuizPage`; el temporizador se ancla a `startTime` (sobrevive a recargas, ver `src/utils/timer.ts`) y el botón/atajo Saltar se deshabilita en preguntas ya respondidas

## PWA

`vite-plugin-pwa` genera el service worker en cada `npm run build` (auto-update, precache). Los iconos se generan desde `public/favicon.svg` con `npx pwa-assets-generator` (config en `pwa-assets.config.ts`); si cambias el favicon, vuelve a ejecutarlo.

## CI

`.github/workflows/ci.yml` ejecuta en cada push/PR: `npm ci` → `npm run lint` → `npx tsc --noEmit` → `npm test` → `npm run build` (Node 22).

## Agregar Nueva Pantalla

1. Crear componente en `src/pages/NuevaPantalla.tsx`
2. Añadir ruta en `src/App.tsx` dentro de `<Routes>`
3. Crear estado en store si necesita estado propio
4. Envolver con `<PageWrapper>` para coherencia visual
5. Añadir transición con Framer Motion

## Agregar Nuevo Tipo de Pregunta

1. Añadir tipo al enum en esquema Zod (`src/services/testValidator.ts`)
2. Actualizar documentación en `docs/TEST_FORMAT.md`
3. Crear componente de renderizado en `src/components/quiz/QuestionType[NuevoTipo].tsx`
4. Añadir case en `QuestionCard` según `question.type`
5. Actualizar `src/utils/scoring.ts` si el tipo requiere diferente puntaje
6. Añadir tests unitarios (`*.test.ts` junto al módulo)

## Agregar Nuevo Evento de Audio

1. Añadir el caso a `SoundType` en `src/types/index.ts`
2. Definir el tono/efecto en `src/services/audioManager.ts` (los efectos se sintetizan con Web Audio API)
3. Llamar `audioManager.play('nuevo-evento')` en el componente
4. Para música: añadir el MP3 en `public/sounds/` y registrarlo en `public/sounds/index.json`

## Persistencia

- Ajustes (tema, audio): `localStorage` (`quizmind-settings`)
- Historial de intentos: `localStorage` (`quizmind-history`, máx 200) vía `useHistoryStore`
- Test en curso (respuestas, progreso, reanudar): `sessionStorage` vía `useQuizStore`

## Principios de Mantenimiento

- No modificar archivos en `test/`, `documents/` ni `public/themes/` - son territorio del usuario
- Componentes UI (`src/components/ui/`) no deben importar stores ni services - solo props
- Funciones de cálculo (scoring, validación, shuffling) deben ser puras con test unitario en Vitest
- Un JSON malformado nunca debe romper la app: mostrar error y seguir funcionando
- Antes de release: ejecutar `npm run lint`, `npx tsc --noEmit`, `npm test` y `npm run build`
