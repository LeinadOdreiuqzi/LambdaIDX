# LambdaIDX

> **Infraestructura de conocimiento jerárquico.** Un sistema de gestión de contenido diseñado para organizar, navegar y publicar bases de conocimiento de cualquier dominio temático.

LambdaIDX no está atado a ningún tema en particular. Puedes usarlo para documentar ciencias, ingeniería, filosofía, medicina, legislación, manuales técnicos o cualquier corpus de conocimiento que necesite una estructura jerárquica clara, búsqueda eficiente y una experiencia de lectura de alto nivel.

---

## ¿Qué es LambdaIDX?

LambdaIDX es una plataforma full-stack de código abierto para construir **bases de conocimiento jerárquicas navegables**. Proporciona:

- Un **panel de administración** para crear, editar y publicar contenido en una estructura de árbol multinivel
- Una **interfaz pública** optimizada para lectura, búsqueda y navegación jerárquica
- Un **sistema de páginas anidadas** con profundidad ilimitada (raíz → rama → hoja)
- **Búsqueda full-text** integrada con índice en tiempo real
- **Caché de alto rendimiento** para servir el árbol de navegación en milisegundos

El dominio temático lo defines tú. LambdaIDX solo provee la infraestructura.

---

## Casos de Uso

| Dominio | Ejemplo de uso |
|---|---|
| **Enciclopedias temáticas** | Base de conocimiento jerárquica por disciplinas |
| **Documentación técnica** | Manuales de productos con secciones y subsecciones |
| **Bases de datos internas** | Repositorio organizacional de procedimientos y políticas |
| **Portales educativos** | Contenido estructurado por cursos, módulos y lecciones |
| **Wikis privadas** | Gestión de conocimiento de equipos o empresas |
| **Archivos de investigación** | Repositorios de papers, notas y referencias estructuradas |

---

## Cómo Funciona

### Modelo de Datos: El Árbol de Páginas

El concepto central es una **página**, que puede contener páginas hijas con profundidad ilimitada:

```
Raíz (depth: 0)
└── Categoría A (depth: 1)
    ├── Subcategoría A1 (depth: 2)
    │   └── Artículo A1.1 (depth: 3)
    └── Subcategoría A2 (depth: 2)
└── Categoría B (depth: 1)
    └── Artículo B1 (depth: 2)
```

Cada página tiene:
- **Slug único** para URLs limpias y SEO
- **Path calculado** para navegación por breadcrumbs
- **Contenido rico** en formato JSON (TipTap)
- **Metadatos SEO** (título, descripción, OG)
- **Estado** (borrador / publicado)
- **Orden de visualización** configurable

### Flujo de Contenido

```
Admin Panel (autenticado)
    → Crear / Editar página (TipTap editor)
    → Asignar jerarquía (padre, profundidad, orden)
    → Publicar
        → Disponible en URL pública: /index/[...slug]
        → Indexado en Meilisearch
        → Árbol de navegación actualizado en caché (Redis)
```

### Rutas Públicas

| Ruta | Descripción |
|---|---|
| `/` | Landing page del sistema |
| `/index/[...slug]` | Visualización de cualquier nodo del árbol |
| `/login` | Acceso al panel de administración |

### API Interna

| Endpoint | Método | Descripción |
|---|---|---|
| `/api/hierarchy/tree` | `GET` | Árbol de navegación completo |
| `/api/pages` | `GET / POST` | Listar y crear páginas |
| `/api/pages/[id]` | `GET / PUT / DELETE` | Operaciones sobre una página |
| `/api/pages/[id]/publish` | `POST` | Publicar una página |
| `/api/search` | `GET` | Búsqueda full-text |

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Lenguaje** | TypeScript |
| **UI** | React 19, Tailwind CSS v4, Framer Motion |
| **Editor** | TipTap (rich text, JSON output) |
| **Base de datos** | PostgreSQL + Prisma ORM |
| **Caché** | Redis |
| **Búsqueda** | Meilisearch |
| **Autenticación** | Sesiones custom con cookie httpOnly |
| **Package manager** | pnpm |
| **Deploy** | Vercel (recomendado) |

---

## Instalación

### Requisitos previos

- Node.js 20+
- pnpm
- Docker (para PostgreSQL, Redis y Meilisearch)

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/lambdaidx.git
cd lambdaidx
```

### 2. Instalar dependencias

```bash
pnpm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Autenticación (obligatorio en producción; genera uno con: openssl rand -base64 32)
AUTH_SECRET=

# Base de datos
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lambdaidx

# Búsqueda
MEILISEARCH_HOST=http://127.0.0.1:7700
MEILISEARCH_API_KEY=masterKey
INTERNAL_API_KEY=
# Caché
REDIS_URL=redis://127.0.0.1:6379
REDIS_KEY_PREFIX=lambdaidx:
```

### 4. Levantar la infraestructura

```bash
pnpm run infra:up        # Levanta PostgreSQL, Redis y Meilisearch vía Docker
pnpm run db:push         # Sincroniza el esquema de Prisma con la base de datos
pnpm run db:seed         # Carga datos de ejemplo (opcional)
```

O todo en un solo comando:

```bash
pnpm run backend:bootstrap
```

### 5. Crear el usuario administrador

```bash
pnpm run admin:create
```

El script pedirá el email y contraseña del administrador. También puedes pasarlos directamente:

```bash
pnpm run admin:create -- --email admin@tudominio.com --password tuPassword123
```

### 6. Iniciar el servidor de desarrollo

```bash
pnpm run dev
```

Accede a `http://localhost:3000`.

---

## Estructura del Proyecto

```
lambdaidx/
├── app/
│   ├── (admin)/              # Panel de administración (protegido por auth)
│   │   └── admin/
│   │       ├── dashboard/    # Vista general del sistema
│   │       └── pages/        # CRUD de páginas y jerarquía
│   ├── (public)/             # Interfaz pública de lectura
│   │   └── index/[...slug]   # Renderización de cualquier nodo del árbol
│   ├── api/                  # Route Handlers (REST API interna)
│   └── login/                # Página de autenticación
├── components/
│   ├── features/             # Componentes por feature (editor, nav, landing)
│   └── shared/               # Componentes globales reutilizables
├── lib/                      # Prisma client, utilidades, helpers
├── services/                 # Lógica de negocio (PageService, CacheService)
├── prisma/                   # Schema y migraciones de base de datos
├── scripts/                  # Scripts administrativos (admin, seed, reindex)
└── types/                    # Tipos TypeScript globales
```

---

## Scripts Disponibles

| Comando | Descripción |
|---|---|
| `pnpm dev` | Servidor de desarrollo con Turbopack |
| `pnpm build` | Build de producción |
| `pnpm start` | Servidor de producción |
| `pnpm lint` | Lint con ESLint |
| `pnpm infra:up` | Inicia servicios Docker |
| `pnpm infra:down` | Detiene servicios Docker |
| `pnpm infra:logs` | Logs de los servicios |
| `pnpm db:push` | Sincroniza el esquema en desarrollo únicamente |
| `pnpm db:migrate:deploy` | Aplica migraciones versionadas en producción |
| `pnpm db:seed` | Carga datos de ejemplo |
| `pnpm backend:bootstrap` | Setup completo de backend |
| `pnpm admin:create` | Crea o actualiza usuario administrador |
| `pnpm search:reindex` | Reindexa contenido en Meilisearch |

---

## Personalización

Para adaptar LambdaIDX a tu propio dominio temático:

1. **Contenido**: Usa el panel de administración (`/login`) para crear tu árbol de páginas desde cero
2. **Branding**: Modifica `components/shared/logo.tsx` y los tokens de color en `app/globals.css`
3. **Landing page**: Edita `app/(public)/page.tsx` con tu propio mensaje y propuesta de valor
4. **Schema de búsqueda**: Ajusta los campos indexados en `services/search-service.ts`
5. **Modelo de datos**: Si necesitas campos adicionales, edita `prisma/schema.prisma` y ejecuta `pnpm db:push`

---

## Deploy en Producción

Stack recomendado para producción:

| Servicio | Proveedor sugerido |
|---|---|
| **Aplicación Next.js** | Vercel |
| **PostgreSQL** | Neon / Supabase / Railway |
| **Redis** | Upstash / Railway |
| **Meilisearch** | Meilisearch Cloud / Railway |

---

## Contribuir

Las contribuciones son bienvenidas:

1. Haz un fork del proyecto
2. Crea una rama: `git checkout -b feature/mi-mejora`
3. Realiza tus cambios y haz commit: `git commit -m 'feat: descripción'`
4. Push a tu rama: `git push origin feature/mi-mejora`
5. Abre un Pull Request

---

## Licencia

MIT License — libre para uso personal y comercial.
