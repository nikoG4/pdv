# PDV — Sistema de Punto de Venta

Sistema full-stack de punto de venta y gestión comercial con backend en **Java + Spring Boot** y frontend en **React + Vite**.

El proyecto está organizado en dos aplicaciones principales y usa una arquitectura modular para reutilizar operaciones CRUD, permisos, auditoría, búsquedas y reportes entre los distintos módulos del sistema.

> **Estado:** proyecto en desarrollo. El repositorio contiene backend, frontend y scripts/configuración de despliegue; antes de usarlo fuera de un entorno local es necesario reemplazar la configuración de desarrollo y gestionar los secretos mediante variables de entorno o un gestor de secretos.

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

## Ejecutar el backend

Primero configura la conexión a PostgreSQL y los secretos de la aplicación para tu entorno.

En Windows:

```powershell
cd backend_pdv
.\mvnw.cmd spring-boot:run
```

En Linux/macOS:

```bash
cd backend_pdv
./mvnw spring-boot:run
```

Por defecto el backend utiliza el puerto `8080`.

## Ejecutar el frontend

```bash
cd frontend_pdv
npm install
npm run dev
```

Build de producción:

```bash
npm run build
```

## Sistema de permisos

Los permisos siguen la convención:

```text
NombreEntidad.read
NombreEntidad.create
NombreEntidad.update
NombreEntidad.delete
NombreEntidad.active
NombreEntidad.all
```

El backend valida permisos mediante `@CheckPermission`, mientras que el frontend utiliza las authorities del usuario para mostrar u ocultar acciones disponibles.

## Soft delete y auditoría

Las entidades que heredan de `Auditable` conservan información como creación, modificación y eliminación. La eliminación normal del sistema es lógica: se completa `deletedAt`/`deletedBy` en lugar de borrar físicamente el registro.

## Reportes

Los reportes Jasper se organizan dentro de:

```text
backend_pdv/src/main/resources/reports/
```

Los servicios pueden utilizar la infraestructura común de `BaseService` para generar PDFs a partir de plantillas JasperReports.

## Seguridad y configuración

Este repositorio contiene configuración pensada para desarrollo local. Para un despliegue real:

- no reutilices secretos JWT incluidos en configuraciones de desarrollo;
- no mantengas credenciales de base de datos en archivos versionados;
- usa variables de entorno o un gestor de secretos;
- restringe correctamente CORS;
- usa credenciales independientes por entorno;
- revisa permisos y usuarios antes de exponer la API públicamente.

## Desarrollo de nuevos módulos

La guía interna del repositorio documenta el patrón utilizado para agregar una nueva entidad completa: modelo, repository, service, controller, servicio frontend, listado, formulario, vista detalle y permisos SQL.

Consulta [`AGENTS.md`](AGENTS.md) para las convenciones detalladas del proyecto.
