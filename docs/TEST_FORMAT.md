# Formato de Tests JSON

Este documento describe el formato exacto que deben seguir los archivos de test JSON para ser compatibles con QuizMind.

## Estructura General

```json
{
  "id": "identificador-unico",
  "title": "Título del Test",
  "description": "Descripción opcional",
  "category": "Categoría",
  "tags": ["tema", "parcial"],
  "difficulty": "easy|medium|hard|mixed",
  "passThreshold": 0.6,
  "timeLimit": 30,
  "shuffleQuestions": false,
  "shuffleAnswers": false,
  "questions": [...]
}
```

## Dónde colocar el test

Guarda el archivo `.json` en la carpeta `test/` de la raíz del proyecto (junto a `src/`, `docs/`, etc.). La aplicación descubre todos los archivos automáticamente: no hay índice que mantener ni registro manual.

- Con `npm run dev` en marcha, al añadir o quitar un JSON la app se recarga sola.
- Para la versión compilada, vuelve a ejecutar `npm run build`.
- Si un archivo es inválido, se ignora y aparece un aviso en la pantalla de inicio; la app sigue funcionando.

## Campos

| Campo              | Tipo    | Requerido | Descripción                                                                                                               |
| ------------------ | ------- | --------- | ------------------------------------------------------------------------------------------------------------------------- |
| `id`               | string  | Sí        | Identificador único del test. Sin espacios, max 50 caracteres.                                                            |
| `title`            | string  | Sí        | Título del test. 1-100 caracteres.                                                                                        |
| `description`      | string  | No        | Descripción detallada. Max 300 caracteres.                                                                                |
| `category`         | string  | No        | Categoría para filtrar tests.                                                                                             |
| `difficulty`       | enum    | Sí        | `easy`, `medium`, `hard` o `mixed` (mixta).                                                                               |
| `passThreshold`    | number  | No        | Umbral de aprobación (0-1). Default: 0.6. Determina la nota mínima mostrada en resultados.                                |
| `timeLimit`        | number  | No        | Límite de tiempo en minutos (entero positivo). Muestra cuenta atrás y finaliza solo al llegar a 0. Sin campo: sin límite. |
| `tags`             | array   | No        | Etiquetas para filtrar (máx 10, cada una de 1-30 caracteres). Se muestran como chips en la pantalla de inicio.            |
| `shuffleQuestions` | boolean | No        | Mezclar orden de preguntas. Default: false.                                                                               |
| `shuffleAnswers`   | boolean | No        | Mezclar orden de respuestas. Default: false.                                                                              |
| `questions`        | array   | Sí        | Array de preguntas. Mínimo 1.                                                                                             |

## Formato de Pregunta

```json
{
  "id": "q1",
  "text": "Texto de la pregunta",
  "type": "single",
  "answers": [...],
  "explanation": "Explicación opcional"
}
```

| Campo         | Tipo   | Requerido | Descripción                                                                                                |
| ------------- | ------ | --------- | ---------------------------------------------------------------------------------------------------------- |
| `id`          | string | Sí        | Identificador único de la pregunta (no puede repetirse dentro del test; la validación rechaza duplicados). |
| `text`        | string | Sí        | Texto de la pregunta. No vacío.                                                                            |
| `type`        | enum   | Sí        | `single`. El valor `multiple` se rechaza en la validación: el archivo se omite con aviso.                  |
| `answers`     | array  | Sí        | 2-6 opciones de respuesta.                                                                                 |
| `explanation` | string | No        | Explicación que se muestra al revisar.                                                                     |

## Formato de Respuesta

```json
{
  "id": "a1",
  "text": "Texto de la respuesta",
  "correct": true
}
```

| Campo     | Tipo    | Requerido | Descripción                                                                                                                                                                                                                   |
| --------- | ------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`      | string  | Sí        | Identificador único de la respuesta (no puede repetirse dentro de la pregunta; la validación rechaza duplicados).                                                                                                             |
| `text`    | string  | Sí        | Texto de la respuesta. No vacío.                                                                                                                                                                                              |
| `correct` | boolean | Sí*       | Marca la respuesta correcta. En preguntas `single` se admite como máximo UNA respuesta correcta. Si ninguna la tiene, la pregunta queda **anulada** (permitido): se muestra como tal en la revisión y no cuenta para la nota. |

## Ejemplo Completo

```json
{
  "id": "historia-espanola",
  "title": "Historia de España",
  "description": "Test sobre eventos históricos españoles",
  "category": "Humanidades",
  "tags": ["historia", "examen"],
  "difficulty": "medium",
  "passThreshold": 0.7,
  "timeLimit": 45,
  "shuffleQuestions": true,
  "shuffleAnswers": true,
  "questions": [
    {
      "id": "q1",
      "text": "¿En qué año terminó la Guerra Civil Española?",
      "type": "single",
      "answers": [
        { "id": "a1", "text": "1936" },
        { "id": "a2", "text": "1939", "correct": true },
        { "id": "a3", "text": "1945" },
        { "id": "a4", "text": "1950" }
      ],
      "explanation": "La Guerra Civil Española terminó en 1939 con la caída de Madrid."
    }
  ]
}
```
