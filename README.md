# LambdaIDX

Una plataforma web de código abierto para gestión de conocimiento con jerarquías profundas y experiencias de lectura premium.

## Características

- **Editor de contenido rico** con TipTap para crear y editar documentos
- **Gestión jerárquica** de contenido con estructura multinivel
- **Búsqueda avanzada** con Meilisearch para encontrar información rápidamente
- **Caché de alto rendimiento** con Redis para respuestas rápidas
- **Base de datos robusta** con PostgreSQL y Prisma ORM
- **Interfaz moderna** con Next.js 16 y React 19
- **Tema claro/oscuro** con persistencia de preferencias
- **Diseño responsive** que funciona en cualquier dispositivo

## Stack Tecnológico

- **Frontend**: Next.js 16, React 19, TypeScript
- **Estilos**: Tailwind CSS v4
- **Base de datos**: PostgreSQL con Prisma ORM
- **Caché**: Redis
- **Búsqueda**: Meilisearch
- **Editor**: TipTap (editor de contenido rico)
- **Gestor de paquetes**: pnpm

## Requisitos Previos

- Node.js 20 o superior
- pnpm
- Docker (para servicios de infraestructura)

## Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/tu-usuario/lambdaidx.git
cd lambdaidx
```

2. Instala las dependencias:
```bash
pnpm install
```

3. Configura las variables de entorno:
```bash
cp .env.example .env
```

Edita `.env` con tus configuraciones:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/lambdaidx
REDIS_URL=redis://localhost:6379
REDIS_KEY_PREFIX=lambdaidx:
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_API_KEY=your-api-key-here
```

4. Inicia la infraestructura (PostgreSQL, Redis, Meilisearch):
```bash
pnpm run infra:up
```

5. Configura la base de datos:
```bash
pnpm run db:push
pnpm run db:seed
```

6. Inicia el servidor de desarrollo:
```bash
pnpm run dev
```
## Scripts Disponibles

- `pnpm dev` - Inicia el servidor de desarrollo
- `pnpm build` - Construye la aplicación para producción
- `pnpm start` - Inicia el servidor de producción
- `pnpm lint` - Ejecuta ESLint
- `pnpm infra:up` - Inicia los servicios Docker
- `pnpm infra:down` - Detiene los servicios Docker
- `pnpm infra:logs` - Muestra los logs de los servicios Docker
- `pnpm db:push` - Sincroniza el esquema de base de datos
- `pnpm db:seed` - Población inicial de datos
- `pnpm backend:bootstrap` - Configura todo el backend (infra + db + seed)

## Estructura del Proyecto

```
lambdaidx/
├── app/              # Páginas y layouts de Next.js
│   ├── (admin)/      # Rutas de administración
│   ├── (public)/     # Rutas públicas
│   └── api/          # Rutas de API
├── components/       # Componentes React
│   ├── features/     # Componentes de características
│   └── shared/       # Componentes compartidos
├── lib/             # Utilidades y configuraciones
├── services/        # Servicios de negocio
├── prisma/          # Esquema de base de datos
└── public/          # Archivos estáticos
```

## Desarrollo

El proyecto sigue las convenciones de Next.js App Router. Los componentes están organizados por características y compartidos según su reutilización.

### Agregar una nueva página

1. Crea el archivo en `app/(public)/` o `app/(admin)/`
2. Sigue el patrón de componentes existentes
3. Usa los estilos globales de `globals.css`

### Modificar el esquema de base de datos

1. Edita `prisma/schema.prisma`
2. Ejecuta `pnpm run db:push`

## Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## Licencia

MIT License

## Soporte

Para preguntas o problemas, abre un issue en el repositorio.
