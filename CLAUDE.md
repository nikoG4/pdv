# Proyecto POS - Punto de Venta

## Estructura del proyecto
- **Backend:** Spring Boot en `/backend_pdv`
- **Frontend:** React + Vite + Tailwind en `/frontend_pdv`
- Ambos tienen sus propios repositorios Git.

---

## BACKEND (Spring Boot)

### Arquitectura
```
controllers/   → Extienden BaseController<T> (CRUD genérico automático)
services/      → Extienden BaseService<T> (lógica de negocio, logs, reportes)
repositories/  → Extienden BaseRepository<T, Long> (JPA)
models/        → Extienden Auditable (createdBy, updatedBy, deletedAt)
auth/          → JWT + sistema de permisos con @CheckPermission
config/        → GlobalExceptionHandler, SecurityConfig, WebConfig
requests/      → DTOs de entrada (solo cuando necesario, ej: UserRequest)
```

### Patrón para crear un módulo nuevo
Siempre seguir este patrón (basado en el módulo Client como referencia):

**1. Model** → Extender `Auditable`, usar Lombok `@Data @EqualsAndHashCode(callSuper=true)`
```java
@Entity @Table(name = "nombre_tabla")
@Data @EqualsAndHashCode(callSuper = true)
public class NuevoModelo extends Auditable {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    // campos...
}
```

**2. Repository** → Extender `BaseRepository`, sin métodos extra salvo que sea necesario
```java
@Repository
public interface NuevoModeloRepository extends BaseRepository<NuevoModelo, Long> {}
```

**3. Service** → Extender `BaseService<T>`, definir `columns` para búsqueda, implementar `update()`
```java
@Service
public class NuevoModeloService extends BaseService<NuevoModelo> {
    @Autowired private NuevoModeloRepository repo;
    public NuevoModeloService() {
        this.repository = repo; // IMPORTANTE: asignar en constructor
        this.columns = List.of("id", "campo1", "campo2"); // para búsqueda
    }
    @Override
    public NuevoModelo update(NuevoModelo t, Long id) { ... }
}
```

**4. Controller** → Extender `BaseController<T>`, solo agregar endpoints extra si necesario
```java
@RestController @RequestMapping("/api/nuevo-modulo") @Validated
public class NuevoModeloController extends BaseController<NuevoModelo> {
    protected NuevoModeloController(NuevoModeloService service) { super(service); }
}
```

### Sistema de permisos
- `@CheckPermission(action = "create|read|update|delete|active|all")`
- Los permisos siguen el formato `NombreEntidad.accion` (ej: `Client.create`)
- Ya está implementado en `BaseController`, no necesita código extra

### Soft delete
- Los modelos usan soft delete mediante `Auditable.deletedAt`
- `BaseService.delete()` setea `deletedBy` y guarda (NO hace delete físico)
- `findActive()` filtra por `deletedAt IS NULL`

### Reportes (JasperReports)
- Los `.jrxml` y `.jasper` van en `src/main/resources/reports/<modulo>/`
- Usar `BaseService.generatePdfReport(reportPath, parameters)`

### Base de datos
- Ver `database.sql` y `schema.sql` para la estructura
- No usar Flyway ni Liquibase, el schema se define en SQL directamente

---

## FRONTEND (React + Vite + Tailwind)

### Estructura de componentes
Cada módulo sigue esta estructura de 4 archivos en `src/components/NombreModulo/`:
```
index.jsx   → Listado: paginación, búsqueda, botones CRUD con control de permisos
form.jsx    → Formulario crear/editar (recibe selectedX y handlers)
view.jsx    → Vista detalle de un registro
report.jsx  → (opcional) Visor de reporte PDF
```

### Servicios
- En `src/services/NombreService.js`
- Son clases con métodos: `getAll({page, size, q})`, `save()`, `update(id, data)`, `delete(id)`
- Usan `axiosInstance` de `./axiosConfig`
- Siempre hacer `alert(error.response.data)` en el catch

### Patrón index.jsx
```jsx
// Estados estándar de todo listado:
const [items, setItems] = useState([]);
const [selectedItem, setSelectedItem] = useState(null);
const [viewItem, setViewItem] = useState(null);
const [isModalOpen, setIsModalOpen] = useState(false);
const [itemToDelete, setItemToDelete] = useState(null);
const [currentPage, setCurrentPage] = useState(0);
const [pageSize] = useState(10);
const [totalElements, setTotalElements] = useState(0);
const [searchTerm, setSearchTerm] = useState("");
const { user } = useContext(AuthContext);

// Fetch con paginación y búsqueda
// Control de permisos: user?.authorities.includes('Entidad.accion')
// Vistas: viewItem → view.jsx | selectedItem → form.jsx | null → tabla
```

### Componentes UI reutilizables (en src/components/ui/)
- `TableData` → tabla con paginación
- `Modal`, `ConfirmModal` → modales
- `Button`, `Input`, `Card`, `CardContent`
- `PaginatedSelect` → select con paginación para relaciones
- `Toolbar` → barra de herramientas
- `PdfViewer` → visor de reportes

### Routing
- Ver `src/components/Home/Home.jsx` para agregar nuevas rutas/secciones
- Ver `src/components/ui/sidebar.jsx` para agregar items al menú lateral

### Control de permisos en frontend
```jsx
{user?.authorities.includes('Entidad.create') && (<Button>Crear</Button>)}
// En getActions(): push solo si user tiene el permiso correspondiente
```

---

## Convenciones de nombres
| Capa | Backend | Frontend |
|------|---------|----------|
| Modelo/Entidad | `NombreEntidad.java` | - |
| Tabla BD | `nombre_entidades` (plural snake_case) | - |
| Endpoint | `/api/nombre-entidades` | - |
| Servicio frontend | `NombreEntidadService.js` | |
| Componente | - | `NombreEntidad/` (PascalCase) |
| Permiso | `NombreEntidad.accion` | igual |

---

## Cómo crear un módulo completo
Al pedirte que crees un módulo nuevo, seguí SIEMPRE este orden:

**Backend:**
1. `models/NuevoModelo.java`
2. `repositories/NuevoModeloRepository.java`
3. `services/NuevoModeloService.java`
4. `controllers/NuevoModeloController.java`

**Frontend:**
5. `services/NuevoModeloService.js`
6. `components/NuevoModelo/form.jsx`
7. `components/NuevoModelo/view.jsx`
8. `components/NuevoModelo/index.jsx`
9. Agregar ruta en `Home.jsx` y item en `sidebar.jsx`

**Base de datos — OBLIGATORIO:**
10. Generar el script SQL de permisos para el módulo y agregarlo en `database.sql`

---

## Permisos SQL — REGLA OBLIGATORIA

**Siempre que se cree un módulo nuevo**, generar automáticamente el INSERT de permisos siguiendo este formato exacto:

```sql
INSERT INTO permissions (name, description, module)
VALUES
    ('NombreEntidad.active',  'Listar [entidad] activos',   '[Nombre módulo]'),
    ('NombreEntidad.all',     'Ver todos los [entidad]',    '[Nombre módulo]'),
    ('NombreEntidad.read',    'Ver [entidad]',              '[Nombre módulo]'),
    ('NombreEntidad.create',  'Crear [entidad]',            '[Nombre módulo]'),
    ('NombreEntidad.update',  'Actualizar [entidad]',       '[Nombre módulo]'),
    ('NombreEntidad.delete',  'Eliminar [entidad]',         '[Nombre módulo]')
ON CONFLICT (name) DO NOTHING;
```

**Ejemplo real (módulo Client):**
```sql
INSERT INTO permissions (name, description, module)
VALUES
    ('Client.active',  'Listar clientes activos', 'Clientes'),
    ('Client.all',     'Ver todos los clientes',  'Clientes'),
    ('Client.read',    'Ver cliente',             'Clientes'),
    ('Client.create',  'Crear cliente',           'Clientes'),
    ('Client.update',  'Actualizar cliente',      'Clientes'),
    ('Client.delete',  'Eliminar cliente',        'Clientes')
ON CONFLICT (name) DO NOTHING;
```

- El `NombreEntidad` debe coincidir exactamente con el nombre de la clase Java (ej: `CashOutflow`, `Product`, `Client`)
- El script debe agregarse al final del archivo `backend_pdv/database.sql`
- También mostrarlo en pantalla al finalizar para que pueda ejecutarse manualmente si se desea

---

## Tecnologías
- **Backend:** Java 17+, Spring Boot, Spring Security, Spring Data JPA, Lombok, JWT, JasperReports
- **Frontend:** React 18, Vite, Tailwind CSS, Axios, shadcn/ui components
- **BD:** MySQL/PostgreSQL (ver `application.properties`)
