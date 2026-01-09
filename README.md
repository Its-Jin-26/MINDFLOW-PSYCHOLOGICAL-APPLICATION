# MINDFLOW PSYCHOLOGICAL APPLICATION

Aplicación web para el acompañamiento psicológico y el seguimiento de hábitos, estados de ánimo y objetivos personales.

Incluye:

- **Autenticación** (registro, login optimizado y perfil de usuario).
- **Espacio emocional** para registrar estado de ánimo diario y notas.
- **Hábitos diarios** con check-ins y cálculo de streaks.
- **Objetivos** vinculados a los hábitos, con fecha objetivo y días objetivo.
- **Progreso** con métricas, indicador de días consecutivos y promedio semanal.

El proyecto está optimizado tanto para **escritorio** como para **dispositivos móviles**, con un layout y navegación específicos para cada caso.

---

## Tech stack

- **Frontend**
  - React + Vite
  - TypeScript
  - Tailwind CSS
  - React Router

- **Backend**
  - Node.js / Express
  - TypeScript
  - Prisma ORM
  - PostgreSQL (Neon)
  - JWT + bcryptjs para autenticación

- **Infraestructura / Deployment**
  - Frontend: **Vercel** (build de Vite)
  - Backend: **Render** (servicio Node.js)
  - Base de datos: **Neon PostgreSQL**

---

## Arquitectura general

El repositorio está organizado en dos partes principales:

- `src/` – código del **frontend** (React + Vite).
- `server/` – código del **backend** (Express + Prisma).

Comunicación entre capas:

- El frontend consume el backend a través de `VITE_API_URL`.
- El backend expone endpoints REST para:
  - Autenticación (`/auth/*`).
  - Usuario (`/user`, `/user/reset`).
  - Moods (`/moods`).
  - Hábitos y check-ins (`/habits`, `/habits/today`, `/habits/:id/checkin`).
  - Objetivos (`/goals`).
  - Progreso (`/progress`).

### Flujo funcional de los módulos

- **Login / Registro**
  - Rutas: `/app/login` y `/app/register`.
  - Al cargar estas pantallas, el frontend realiza un ping silencioso a `/health` para "despertar" el backend en Render.
  - De esta forma, cuando el usuario pulsa **Iniciar Sesión** o **Registrarse**, la petición a `/auth/login` o `/auth/register` es prácticamente inmediata incluso tras periodos de inactividad.

- **Hábitos → Objetivos → Progreso**
  - Al crear un hábito diario se puede asociar un **objetivo** con fecha límite y/o días objetivo.
  - Cada día, el usuario marca sus hábitos en `/app/dashboard/habits`.
  - Cuando **todos los hábitos activos del día** están marcados como completados, el sistema suma un día a los **días consecutivos (streak)**.
  - Cuando se cumple el número de días objetivo, el objetivo asociado pasa automáticamente a estado cumplido.
  - En `/app/dashboard/progress` se muestra:
    - El número de días consecutivos.
    - Un **indicador de pasos** (7 días) que refleja visualmente la racha.
    - Un porcentaje de **promedio semanal** basado en los últimos 7 días.

---

## Rediseño para dispositivos móviles

MindFlow ha sido adaptado para ofrecer una experiencia optimizada en móviles.

### Navbar y navegación

- **Navbar más alto** en móvil (`h-20`) con:
  - Logo e icono de MindFlow más grande.
  - Texto `MindFlow` en `text-lg`.
  - Botones de acción con área táctil ampliada.

- **Botones del header unificados**:
  - ThemeSwitcher, usuario y menú hamburguesa usan el mismo tamaño: `h-12 w-12` en móvil, `h-10 w-10` en escritorio.
  - Íconos de Lucide (`Moon`, `User`, `Menu`, etc.) centrados y de la misma medida.

### Menú hamburguesa (móvil)

- Botón de menú ubicado a la derecha en el navbar.
- Al pulsar:
  - Se muestra un **backdrop** oscuro a pantalla completa.
  - Se desliza un **panel lateral** desde la derecha hacia la izquierda con animación suave (`translate-x-full → translate-x-0`).
  - El panel contiene los módulos principales: Dashboard, Espacio Emocional, Hábitos Diarios, Objetivos, Progreso.
  - El panel se cierra al:
    - Pulsar fuera (en el backdrop).
    - Seleccionar una opción de navegación.

### Menú de usuario (móvil)

- El icono de usuario abre un panel lateral similar al menú hamburguesa:
  - Backdrop oscuro a pantalla completa.
  - Panel que se desliza desde la derecha con animación.
  - Muestra nombre del usuario e identificador.
  - Acciones:
    - **Configuración** → navega a `/app/dashboard/settings`.
    - **Cerrar Sesión** → borra el token y redirige a la pantalla de login.
  - Botones y textos ampliados para mejorar la precisión de toque (padding vertical mayor, `text-base`).

### Contenido centrado

- En móvil, el contenido principal se presenta:
  - Sin sidebar lateral (la navegación pasa a los paneles móviles).
  - Centrado y con ancho limitado (`max-w-xl`) para mantener legibilidad.
  - Espaciado optimizado entre tarjetas y secciones.

---

## Rutas principales del frontend

- `/app/login` – pantalla de login.
- `/app/register` – registro de usuario.
- `/app/dashboard` – home del dashboard con resumen diario.
- `/app/dashboard/emotional` – espacio emocional (estado de ánimo + notas).
- `/app/dashboard/habits` – hábitos diarios y check-ins.
- `/app/dashboard/goals` – gestión de objetivos.
- `/app/dashboard/progress` – métricas y gráfico de progreso.
- `/app/dashboard/settings` – configuración de perfil y acciones de cuenta.

---

## Desarrollo futuro

Algunas posibles mejoras futuras:

- Más visualizaciones de progreso (líneas de tiempo, comparativas).
- Notificaciones o recordatorios para hábitos.
- Integración con calendarios externos.
- Mejoras de accesibilidad adicionales (navegación por teclado completa, ARIA avanzada).

---

## Licencia

Nertek Systems Technologies © 2025. Todos los derechos de esta aplicación están reservados.