# Gestor Inteligente de Trámites Académicos

Sistema de gestión, análisis y respuesta automatizada de solicitudes académicas con inteligencia artificial.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 16.2 (App Router) + React 19 |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS v4 |
| Base de datos | PostgreSQL |
| ORM | Prisma 7 (Driver Adapters) |
| Autenticación | NextAuth v5 (Credentials) |
| IA | Anthropic Claude 3.5 Sonnet |
| Email | IMAP (imapflow + mailparser) |
| Deploy | Docker + Dokploy |

## Arquitectura

```
Usuario (email)               Admin / Empleado (web)
     │                              │
     ▼                              ▼
┌──────────┐              ┌──────────────────┐
│   IMAP   │ ──email──►   │   Next.js App    │
│ (Gmail)  │              │                  │
└──────────┘              │  ┌────────────┐  │
                          │  │   Claude   │  │
┌──────────┐              │  │  (Anthropic)│  │
│  Formul. │ ──web───►   │  └────────────┘  │
│   Web    │              │                  │
└──────────┘              │  ┌────────────┐  │
                          │  │PostgreSQL  │  │
                          │  │ (Prisma)   │  │
                          │  └────────────┘  │
                          └──────────────────┘
```

## Funcionalidades

### Recepción de solicitudes
- **Formulario web**: carga manual desde el panel
- **IMAP automático**: sincroniza una casilla de correo (Gmail, etc.) y convierte emails entrantes en solicitudes
- **Detección de alumno**: vincula automáticamente por email, con historial de trámites

### Análisis con IA (Claude)
- Clasifica el tipo de trámite: CERTIFICADO, INSCRIPCIÓN, CONSULTA, OTRO
- Asigna prioridad: ALTA, NORMAL, BAJA
- Extrae datos relevantes del texto
- Genera una respuesta institucional propuesta
- Referencia normativas vigentes almacenadas en el sistema
- Considera el historial del alumno para contextualizar

### Gestión de respuestas
- Respuesta automática generada por IA
- Flujo de aprobación humana (borrador → aprobar y enviar)
- Edición antes de enviar

### Panel CRM
- Vista kanban con 4 columnas (Pendientes / En Proceso / Completados / Rechazados)
- Búsqueda y filtros por tipo de trámite y prioridad
- Panel lateral con detalle y acciones rápidas
- Sidebar de normativas

### Administración
- Gestión de usuarios (admin/empleado)
- Configuración de cuentas IMAP
- CRUD de normativas institucionales
- Vista de todas las solicitudes
- Trazabilidad completa (auditoría)

## Modelo de datos

```
User (admin/empleado)
Alumno (estudiantes con historial)
Solicitud (trámite)
├── AnalisisIA (resultado de Claude)
├── Respuesta (borrador o enviada)
├── Adjunto (archivos)
└── Auditoria (trazabilidad)

CuentaEmail (config IMAP)
Normativa (regulaciones institucionales)
```

## Requisitos

- Node.js 20+
- PostgreSQL 14+
- Docker (para deploy)

## Desarrollo local

```bash
# Clonar
git clone git@github.com:brandall2021/tramites.git
cd tramites

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Crear base de datos y migrar
npx prisma migrate dev

# Generar cliente Prisma
npx prisma generate

# Seed (datos demo)
npx prisma db seed

# Iniciar dev
npm run dev
```

### Usuarios demo (seed)

| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@tramites.edu | admin123 | Admin |
| empleado@tramites.edu | empleado123 | Empleado |

## Variables de entorno

| Variable | Obligatoria | Descripción |
|----------|------------|-------------|
| `DATABASE_URL` | ✅ | Conexión a PostgreSQL |
| `ANTHROPIC_API_KEY` | ✅ | API key de Anthropic para Claude |
| `NEXTAUTH_SECRET` | ✅ | Secreto para firmar tokens JWT |
| `NEXTAUTH_URL` | ✅ | URL pública del sitio |

### Ejemplo `.env`

```env
DATABASE_URL="postgresql://usuario:password@host:5432/tramites?schema=public"
ANTHROPIC_API_KEY="sk-ant-..."
NEXTAUTH_SECRET="generar-con openssl rand -base64 32"
NEXTAUTH_URL="https://tramites.tudominio.com"
```

## Deploy con Dokploy

### 1. En Dokploy

1. Crear un nuevo proyecto
2. Conectar repositorio: `git@github.com:brandall2021/tramites.git`
3. Tipo de deploy: **Docker** (usa el Dockerfile incluido)
4. Puerto: **3000**

### 2. Variables de entorno en Dokploy

Configurar en la sección "Environment" del proyecto:

```
DATABASE_URL=postgresql://usuario:password@host:5432/tramites?schema=public
ANTHROPIC_API_KEY=sk-ant-...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://tramites.tudominio.com
```

### 3. Base de datos

La aplicación ejecuta `prisma migrate deploy` automáticamente al iniciar (ver `start.sh`).
Asegurate de tener una base de datos PostgreSQL accesible desde el contenedor.

### 4. Configuración Gmail (IMAP)

Después del deploy, desde el panel admin:
1. Ir a **Admin → Cuentas Email**
2. Agregar cuenta con:
   - Host: `imap.gmail.com`
   - Puerto: `993`
   - Usuario: tu email
   - Contraseña: **contraseña de aplicación** (no la contraseña normal)
3. Para generar la contraseña de aplicación: https://myaccount.google.com/apppasswords
4. IMPORTANTE: Activar IMAP en configuración de Gmail

### 5. Normativas

Desde el panel admin se pueden cargar las normativas institucionales que la IA usará
para generar respuestas contextualizadas.

### Dockerfile

El proyecto incluye un Dockerfile multi-stage optimizado para producción:

```dockerfile
# Etapa 1: Instalar dependencias
# Etapa 2: Build de Next.js + generación Prisma
# Etapa 3: Runner final (imagen ~200MB)
```

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Login |
| `/dashboard` | Dashboard con estadísticas |
| `/crm` | Panel CRM kanban |
| `/solicitudes` | Lista de solicitudes |
| `/solicitudes/[id]` | Detalle de solicitud |
| `/solicitudes/nueva` | Nueva solicitud (manual) |
| `/admin/usuarios` | Gestión de usuarios (admin) |
| `/admin/cuentas-email` | Configuración IMAP (admin) |
| `/admin/solicitudes` | Todas las solicitudes (admin) |

## API

| Ruta | Método | Descripción |
|------|--------|-------------|
| `/api/auth/[...nextauth]` | POST | Autenticación |
| `/api/solicitudes` | GET/POST | Listar/crear solicitudes |
| `/api/solicitudes/[id]` | GET/PATCH/DELETE | CRUD solicitud |
| `/api/analizar/[id]` | POST | Analizar con Claude |
| `/api/responder/[id]` | POST/PATCH | Crear/aprobar respuesta |
| `/api/imap/sync` | POST | Sincronizar correo IMAP |
| `/api/cuentas-email` | GET/POST | CRUD cuentas email |
| `/api/cuentas-email/[id]` | PATCH/DELETE | Editar/eliminar cuenta |
| `/api/admin/usuarios` | GET/POST | CRUD usuarios (admin) |
| `/api/admin/usuarios/[id]` | PATCH/DELETE | Editar/eliminar usuario |

## Licencia

MIT
