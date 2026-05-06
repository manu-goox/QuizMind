# Guía de Temas

QuizMind usa variables CSS para el sistema de temas. Los temas son archivos CSS que redefinen estas variables.

## Variables CSS

Todos los temas deben definir estas variables:

```css
:root {
  --bg-primary: #1a1a2e;       /* Fondo principal */
  --bg-secondary: #16213e;     /* Fondo de tarjetas */
  --bg-hover: #1f3460;         /* Fondo hover */
  --text-primary: #eaeaea;      /* Texto principal */
  --text-secondary: #a0a0a0;   /* Texto secundario */
  --accent: #e94560;           /* Color de acento */
  --accent-hover: #c73e54;     /* Acento en hover */
  --border: #2a2a4a;           /* Bordes */
  --correct: #10b981;          /* Respuesta correcta (verde) */
  --wrong: #ef4444;            /* Respuesta incorrecta (rojo) */
  --progress-fill: #e94560;    /* Barra de progreso */
  --font-family: 'Inter', system-ui, sans-serif;
}
```

## Crear Nuevo Tema

1. Crear archivo CSS en `public/themes/mi-tema.css`
2. Definir todas las variables CSS
3. Editar `public/themes/index.json` para añadir entrada:

```json
{
  "themes": [
    ...temas existentes...,
    {
      "id": "mi-tema",
      "name": "Mi Tema",
      "file": "/themes/mi-tema.css"
    }
  ]
}
```

El tema aparecerá automáticamente en el selector.

## Buenas Prácticas

- Usar colores con buen contraste para accesibilidad
- Mantener consistencia en la paleta de colores
- Testear en diferentes tamaños de pantalla