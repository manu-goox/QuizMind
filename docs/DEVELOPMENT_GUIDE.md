# Guía de Desarrollo

Este documento es para desarrolladores que trabajen en el proyecto después del lanzamiento inicial.

## Agregar Nueva Pantalla

1. Crear componente en `src/pages/NuevaPantalla.jsx`
2. Añadir ruta en `App.jsx` dentro de `<Routes>`
3. Crear estado en store si necesita estado propio
4. Envolver con `<PageWrapper>` para coherencia visual
5. Añadir transición con Framer Motion

## Agregar Nuevo Tipo de Pregunta

1. Añadir tipo al enum en esquema Zod (`src/services/testValidator.js`)
2. Actualizar documentación en `docs/TEST_FORMAT.md`
3. Crear componente de renderizado en `src/components/quiz/QuestionType[NuevoTipo].jsx`
4. Añadir case en `QuestionCard` según `question.type`
5. Actualizar `scoring.js` si el tipo requiere diferente puntaje

## Agregar Nuevo Evento de Audio

1. Añadir archivo MP3/OGG en `public/sounds/`
2. Registrar en objeto SOUNDS en `src/services/audioManager.js`
3. Llamar `AudioManager.play("nuevo-evento")` en componente

## Principios de Mantenimiento

- No modificar archivos en `public/tests/` ni `public/themes/` - son territorio del usuario
- Estado persistente entre sesiones va en localStorage vía hook `useSettings`
- Componentes UI (`src/components/ui/`) no deben importar stores ni services - solo props
- Funciones de cálculo (scoring, validación, shuffling) deben ser puras con test unitario en Vitest
- Antes de release: ejecutar `npm run build` y verificar locally