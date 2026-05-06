# Formato de Tests JSON

Este documento describe el formato exacto que deben seguir los archivos de test JSON para ser compatibles con QuizMind.

## Estructura General

```json
{
  "id": "identificador-unico",
  "title": "Título del Test",
  "description": "Descripción opcional",
  "category": "Categoría",
  "difficulty": "easy|medium|hard",
  "passThreshold": 0.6,
  "shuffleQuestions": false,
  "shuffleAnswers": false,
  "questions": [...]
}
```

## Campos

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | string | Sí | Identificador único del test. Sin espacios, max 50 caracteres. |
| `title` | string | Sí | Título del test. 1-100 caracteres. |
| `description` | string | No | Descripción detallada. Max 300 caracteres. |
| `category` | string | No | Categoría para filtrar tests. |
| `difficulty` | enum | Sí | `easy`, `medium` o `hard`. |
| `passThreshold` | number | No | Umbral de aprobación (0-1). Default: 0.6. |
| `shuffleQuestions` | boolean | No | Mezclar orden de preguntas. Default: false. |
| `shuffleAnswers` | boolean | No | Mezclar orden de respuestas. Default: false. |
| `questions` | array | Sí | Array de preguntas. Mínimo 1. |

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

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | string | Sí | Identificador único de la pregunta. |
| `text` | string | Sí | Texto de la pregunta. No vacío. |
| `type` | enum | Sí | `single` (por ahora). `multiple` en futuras versiones. |
| `answers` | array | Sí | 2-6 opciones de respuesta. |
| `explanation` | string | No | Explicación que se muestra al revisar. |

## Formato de Respuesta

```json
{
  "id": "a1",
  "text": "Texto de la respuesta",
  "correct": true
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | string | Sí | Identificador único de la respuesta. |
| `text` | string | Sí | Texto de la respuesta. No vacío. |
| `correct` | boolean | Sí* | Marca la respuesta correcta. Solo UNA respuesta debe ser `true`. |

## Ejemplo Completo

```json
{
  "id": "historia-espanola",
  "title": "Historia de España",
  "description": "Test sobre eventos históricos españoles",
  "category": "Humanidades",
  "difficulty": "medium",
  "passThreshold": 0.7,
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