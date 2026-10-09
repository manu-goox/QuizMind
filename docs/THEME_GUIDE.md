# Guía de Temas

QuizMind usa variables CSS para el sistema de temas. Los temas son archivos CSS que redefinen estas variables sobre `:root`.

## Variables de un Tema

Un tema debe definir **los colores**; la tipografía, el espaciado, los radios y las sombras viven en `src/styles/variables.css` y no necesitan redefinirse (aunque un tema puede hacerlo).

Variables que todo tema debería definir (lista canónica en `public/themes/dark.css`):

```css
:root {
  /* Núcleo */
  --bg-primary: #0a0a18; /* Fondo principal */
  --bg-secondary: #11112a; /* Fondo de tarjetas */
  --bg-hover: #1a1a3d; /* Fondo hover */
  --text-primary: #f1f1f4; /* Texto principal */
  --text-secondary: #8b8fa3; /* Texto secundario */
  --accent: #e94560; /* Color de acento */
  --accent-hover: #c73e54; /* Acento en hover */
  --border: rgba(255, 255, 255, 0.06);
  --correct: #10b981; /* Respuesta correcta */
  --wrong: #ef4444; /* Respuesta incorrecta */
  --font-family: 'Inter', system-ui, sans-serif;

  /* Capas de fondo adicionales */
  --bg-tertiary: #161632;
  --bg-elevated: #1c1c3d;

  /* Variantes de color */
  --accent-glow: rgba(233, 69, 96, 0.3);
  --accent-subtle: rgba(233, 69, 96, 0.08);
  --correct-glow: rgba(16, 185, 129, 0.25);
  --correct-subtle: rgba(16, 185, 129, 0.08);
  --wrong-glow: rgba(239, 68, 68, 0.25);
  --wrong-subtle: rgba(239, 68, 68, 0.08);

  /* Texto muted y glassmorphism */
  --text-muted: #7c819c; /* Contraste ≥ 4.5:1 sobre bg-primary */
  --glass-bg: rgba(255, 255, 255, 0.02);
  --glass-border: rgba(255, 255, 255, 0.06);

  /* AURORA — color extendido */
  --accent-2: #a855f7; /* Segundo acento (gradientes) */
  --accent-3: #38bdf8; /* Tercer acento (detalles de sección) */
  --accent-gradient: linear-gradient(
    135deg,
    var(--accent) 0%,
    var(--accent-2) 100%
  );
  --warning: #fbbf24;
  --warning-glow: rgba(251, 191, 36, 0.25);
  --warning-subtle: rgba(251, 191, 36, 0.1);
  --correct-2: #6ee7b7; /* Extremo claro del gradiente de progreso */
  --overlay: rgba(4, 4, 14, 0.62); /* Fondo de modales */
  --on-accent: #ffffff; /* Texto sobre el acento */
  --border-strong: rgba(255, 255, 255, 0.12);
  --glass-highlight: rgba(255, 255, 255, 0.08); /* Brillo superior */
  --aurora-1: rgba(233, 69, 96, 0.14); /* Glows ambientales */
  --aurora-2: rgba(168, 85, 247, 0.12);
  --aurora-3: rgba(56, 189, 248, 0.08);
  --grain-opacity: 0; /* Grano de película (0 = sin textura) */
}
```

Si un tema omite las variables extendidas (`--bg-tertiary`, `--accent-glow`, etc.) heredará los valores oscuros por defecto de `variables.css` y se verá mal (por ejemplo, fondos elevados oscuros en un tema claro). Lo mismo aplica al bloque **AURORA**: cada tema debe ajustar `--warning-*`, `--overlay`, `--on-accent`, `--border-strong`, `--glass-highlight`, `--aurora-*` y `--grain-opacity` a su paleta (ver `dark.css`, `light.css` y `catppuccin.css` como referencia).

## Crear Nuevo Tema

1. Crear archivo CSS en `public/themes/mi-tema.css`
2. Definir las variables de color (copiar `dark.css` como base)
3. Editar `public/themes/index.json` para añadir entrada:

```json
{
  "themes": [
    {
      "id": "mi-tema",
      "name": "Mi Tema",
      "file": "/themes/mi-tema.css"
    }
  ]
}
```

El tema aparecerá automáticamente en el selector del header. El tema guardado se aplica antes del primer render (sin parpadeo).

## Buenas Prácticas

- Usar colores con buen contraste para accesibilidad
- Mantener consistencia en la paleta de colores
- Testear en diferentes tamaños de pantalla
