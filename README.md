# Habits Tracker — Mi Diario de Cruces 📅✕

Aplicación web para seguimiento diario de hábitos y tareas.
Marcá cada día del mes con una cruz (✕) cuando cumplas tus objetivos.

## Stack

- **React 19** + **TypeScript**
- **Vite 6** (build tool)
- **Tailwind CSS v4** (estilos)
- **Framer Motion** (animaciones)
- **Recharts** (gráficos)
- **i18next** (español / inglés)
- **Lucide React** (iconos)

## Funcionalidades

- ✅ Calendario mensual interactivo con animaciones
- ✅ Marcado rápido de días completados (cruz ✕)
- ✅ Plantilla diaria de hábitos personalizable
- ✅ Time Blocks — registro de horarios con emojis
- ✅ Event Journal — diario de eventos categorizados
- ✅ Progreso visual por día (barra de tareas)
- ✅ Estadísticas mensuales y rachas (current / max streak)
- ✅ Gráfico de rendimiento últimos 7 días
- ✅ Dark mode automático / manual
- ✅ Exportación e importación de datos (JSON)
- ✅ 100% offline — los datos se guardan en localStorage

## Cómo usar

1. **Configurá tu plantilla** — definí las tareas que querés cumplir cada día
2. **Marcá tus días** — hacé clic en un día para abrir el panel de detalles y marcar tareas
3. **Cruz rápida** — pasá el mouse sobre un día y tocá el check para marcar el día entero
4. **Seguí tu racha** — el panel de estadísticas muestra tu progreso mensual y rachas

## Correr localmente

```bash
npm install
npm run dev      # → http://localhost:3000
```

### Comandos disponibles

| Comando | Descripción |
|---------|------------|
| `npm run dev` | Servidor de desarrollo (puerto 3000) |
| `npm run build` | Build de producción → `dist/` |
| `npm run preview` | Vista previa del build |
| `npm run typecheck` | TypeScript type checking |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

## Licencia

MIT
