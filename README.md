# PDV — Sistema de Punto de Venta

Sistema full-stack de punto de venta y gestión comercial con backend en **Java + Spring Boot** y frontend en **React + Vite**.

El proyecto está organizado en dos aplicaciones principales y usa una arquitectura modular para reutilizar operaciones CRUD, permisos, auditoría, búsquedas y reportes entre los distintos módulos del sistema.

> **Estado:** proyecto en desarrollo. El repositorio contiene backend, frontend y scripts/configuración de despliegue. Los secretos y credenciales deben gestionarse mediante variables de entorno y no versionarse en el repositorio.

## Stack

### Backend

- Java 17+
- Spring Boot
- Spring Security
- Spring Data JPA
- JWT
- PostgreSQL
- Lombok
- JasperReports
- Docker

### Frontend

- React 18
- Vite
- Tailwind CSS
- Material UI
- Axios
- React Router
- Recharts
- React PDF / PDF Viewer

## Arquitectura

```text
pdv/
├── backend_pdv/     # API REST Spring Boot
├── frontend_pdv/    # Aplicación React/Vite
├── AGENTS.md        # Convenciones y arquitectura interna
└── CLAUDE.md        # Guía de desarrollo equivalente
```

El backend sigue una estructura por capas:

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
PostgreSQL
```

Las entidades de negocio reutilizan componentes base para reducir código repetido:

- `BaseController<T>` para operaciones CRUD comunes.
- `BaseService<T>` para lógica compartida, búsqueda, soft delete y reportes.
- `BaseRepository<T, Long>` sobre Spring Data JPA.
- `Auditable` para campos de creación, modificación y eliminación lógica.

## Funcionalidades técnicas destacadas

- Autenticación mediante JWT.
- Autorización granular por permisos del tipo `Entidad.accion`.
- CRUD genérico reutilizable para módulos de negocio.
- Búsqueda y paginación.
- Soft delete con trazabilidad.
- Auditoría de creación, modificación y eliminación.
- Generación de reportes PDF con JasperReports.
- Componentes React reutilizables para tablas, formularios, modales y visores PDF.
- Control de permisos también en la interfaz.
- Soporte para impresión desde el frontend mediante integración con herramientas de impresión web.

## Requisitos

- Java 17 o superior
- PostgreSQL
- Node.js + npm

## Configuración del backend

La configuración sensible se toma desde variables de entorno. Las principales son:

```text
DB_URL
DB_USERNAME
DB_PASSWORD
JWT_SECRET
JWT_EXPIRATION
PORT
CORS_ALLOW
PRINTER_NAME
UPLOAD_DIR
MAX_FILE_SIZE
MAX_REQUEST_SIZE
```

Ejemplo para PowerShell:

```powershell
$env:DB_URL="jdbc:postgresql://localhost:5432/postgres"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="tu_password_local"
$env:JWT_SECRET="genera-un-secreto-largo-y-aleatorio"
```

No uses secretos reales en `application.properties`, commits, issues ni documentación pública.

## Desarrollo

### Backend

```bash
cd backend_pdv
./mvnw spring-boot:run
```

En Windows:

```bat
cd backend_pdv
mvnw.cmd spring-boot:run
```

### Frontend

```bash
cd frontend_pdv
npm install
npm run dev
```

## Seguridad y permisos

El backend utiliza Spring Security y permisos con el formato:

```text
Entidad.create
Entidad.read
Entidad.update
Entidad.delete
Entidad.active
Entidad.all
```

Los mismos permisos se utilizan en el frontend para ocultar o habilitar acciones según las autoridades del usuario autenticado.

## Base de datos

La configuración actual está orientada a PostgreSQL. Revisa los scripts SQL y la configuración de cada entorno antes de desplegar.

## Reportes

Los reportes Jasper se almacenan en los recursos del backend y pueden generarse desde los servicios mediante la infraestructura compartida de reportes.

## Notas de seguridad

- Nunca publiques secretos JWT, contraseñas de base de datos o tokens de servicios.
- Usa variables de entorno o un gestor de secretos en producción.
- Si un secreto fue versionado alguna vez en un repositorio público, considéralo comprometido y rótalo.
- Revisa CORS antes de exponer la API fuera de una red controlada.

Consulta `AGENTS.md` para más detalles sobre la arquitectura interna y las convenciones de desarrollo.