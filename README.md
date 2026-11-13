# CourseHub API

API persistente de cursos, estudiantes y matrículas. Los tres recursos viven en PostgreSQL, las matrículas relacionan un estudiante con un curso, y las consultas de listado se filtran, paginan y ordenan con parámetros validados.

## Requisitos

- Node.js 20 o superior
- npm
- PostgreSQL 14 o superior, con una base vacía llamada `coursehub`

## Instalación

Desde la carpeta del proyecto Nest (`coursehub-api/` dentro de este repositorio):

```bash
cd coursehub-api
npm install
```

Copia la plantilla de entorno y completa el valor local de la contraseña. El resto puede quedarse como está si PostgreSQL escucha en `localhost:5432` con el usuario `postgres` y la base `coursehub`.

```bash
copy .env.example .env
```

En PowerShell:

```powershell
Copy-Item .env.example .env
```

Abre `.env` y sustituye `DATABASE_PASSWORD`. Ese valor es la contraseña de tu PostgreSQL local; no hace falta mostrarla ni commitearla. Si tu servidor no usa el puerto `5432`, cambia también `DATABASE_PORT`. Crea la base si todavía no existe:

```bash
psql -U postgres -c "CREATE DATABASE coursehub;"
```

`.env` está en `.gitignore`. `.env.example` solo trae valores de ejemplo.

## Variables de entorno

`ConfigModule` valida estas variables al arrancar. Si falta alguna, o si `NODE_ENV` no es uno de los tres valores permitidos, el proceso termina antes de abrir el puerto.

| Variable | Obligatoria | Ejemplo | Uso |
| --- | --- | --- | --- |
| `NODE_ENV` | sí | `development` | `development` activa `synchronize`. `production` y `test` lo dejan en `false`. |
| `PORT` | sí | `4500` | Puerto HTTP. La app lo lee con `ConfigService`. |
| `DATABASE_HOST` | sí | `localhost` | Host de PostgreSQL |
| `DATABASE_PORT` | sí | `5432` | Puerto de PostgreSQL |
| `DATABASE_USER` | sí | `postgres` | Usuario de la base |
| `DATABASE_PASSWORD` | sí | `cambia-esta-clave` | Contraseña local. Reemplázala en `.env`. |
| `DATABASE_NAME` | sí | `coursehub` | Nombre de la base |
| `CORS_ORIGINS` | no | `http://localhost:3000` | Orígenes web permitidos, separados por coma |

La conexión se arma en `createTypeOrmOptions` con `ConfigService`. No hay host, puerto ni contraseña escritos en el código.

## Cómo iniciar

```bash
npm run start:dev
```

Al arrancar, el log indica el ambiente y la política de esquema:

```text
NODE_ENV=development; TypeORM synchronize=true
```

En desarrollo, TypeORM crea y ajusta las tablas al iniciar. Los datos permanecen en PostgreSQL: reiniciar la API no borra cursos, estudiantes ni matrículas.

Producción no modifica el esquema. Hay que construir y arrancar con `NODE_ENV=production`:

```powershell
npm run build
$env:NODE_ENV="production"
npm run start:prod
```

El log queda así:

```text
NODE_ENV=production; TypeORM synchronize=false
```

`synchronize: true` no es la política de producción. La regla está en `isSynchronizeEnabled`: solo devuelve `true` cuando `NODE_ENV` es `development`.

En producción la API debe servirse por HTTPS. El token Bearer viaja en cada petición y, sin TLS, puede interceptarse en una red no confiable. La terminación TLS suele quedar en un proxy, balanceador o plataforma de despliegue. Los secretos (`JWT_SECRET`, `DATABASE_PASSWORD`) viven solo en el entorno y nunca en el repositorio.

## Endpoints

| Método | Ruta | Descripción |
| --- | --- | --- |
| `POST` | `/courses` | Crear un curso |
| `GET` | `/courses` | Listar cursos con filtro, página y orden |
| `GET` | `/courses/:id` | Obtener un curso |
| `PATCH` | `/courses/:id` | Actualizar un curso |
| `DELETE` | `/courses/:id` | Eliminar un curso |
| `POST` | `/estudiantes` | Crear un estudiante |
| `GET` | `/estudiantes` | Listar estudiantes con filtros, búsqueda, página y orden |
| `GET` | `/estudiantes/:id` | Obtener un estudiante |
| `PATCH` | `/estudiantes/:id` | Actualizar un estudiante |
| `PATCH` | `/estudiantes/:id/status` | Activar o desactivar un estudiante |
| `DELETE` | `/estudiantes/:id` | Eliminar un estudiante activo |
| `POST` | `/enrollments` | Matricular a un estudiante activo en un curso |
| `GET` | `/enrollments` | Consultar matrículas con filtros, búsqueda y página |
| `GET` | `/enrollments/students/:studentId` | Matrículas de un estudiante, con su curso |
| `GET` | `/enrollments/courses/:courseId` | Matrículas de un curso, con su estudiante |
| `DELETE` | `/enrollments/:id` | Cancelar una matrícula |

Un listado sin coincidencias responde `200` con `items: []` y `meta.total: 0`. Un `404` solo aparece cuando se pide un curso, estudiante o matrícula que no existe. Un parámetro inválido responde `400`.

Las lecturas son públicas. Las escrituras requieren JWT y rol, según la matriz de la sección siguiente.

## Autorización

La autenticación responde «¿quién eres?»; la autorización decide si puedes ejecutar la acción. `JwtAuthGuard` valida el token y deja la identidad en `request.user`; `RolesGuard` lee los roles declarados con `@Roles()` junto a la ruta. El orden importa: primero identidad (`401`), después permiso (`403`).

Los roles son cerrados (`UserRole`): `admin`, `teacher` y `student`. Una cuenta nueva recibe `student`, y el rol nunca se toma del cuerpo de la petición. El rol viaja dentro del JWT junto a `sub` y `email`, así que un cambio de rol exige volver a iniciar sesión.

| Ruta | Quién puede |
| --- | --- |
| `GET` de cursos, estudiantes y matrículas | cualquiera |
| `POST /courses` | `admin` y `teacher`; el curso queda a nombre del usuario autenticado |
| `PATCH /courses/:id` | `admin`, o `teacher` propietario del curso |
| `DELETE /courses/:id` | `admin` |
| Escrituras de `/estudiantes` y `/enrollments` | `admin` |

Sin token, o con firma inválida o vencida: `401`. Token válido sin el rol requerido o sin la propiedad del curso: `403`. La propiedad se comprueba en el servicio con `createdByUserId`; un `ownerId` enviado por el cliente se ignora. Un curso antiguo sin propietario solo lo puede modificar un `admin`.

Para las cuentas de práctica, cambia el rol en la base local y vuelve a iniciar sesión:

```sql
UPDATE users SET role = 'teacher' WHERE email = 'docente@coursehub.test';
UPDATE users SET role = 'admin' WHERE email = 'admin@coursehub.test';
```

## CORS y límite de peticiones

`app.enableCors` acepta solo los orígenes de `CORS_ORIGINS`, con `Content-Type` y `Authorization` como cabeceras permitidas. `origin: '*'` no se usa. CORS indica qué orígenes puede leer un navegador; no protege la API de Postman ni sustituye a JWT y a los guards.

`ThrottlerModule` limita a 20 solicitudes por minuto y por IP. `POST /auth/login` baja a 5 por minuto porque recibe credenciales. Al superar el límite la respuesta es `429 Too Many Requests`, sin revelar si el correo o la contraseña eran correctos. El contador vive en memoria del proceso: es suficiente para desarrollo y para una sola instancia.

## Errores

Todas las respuestas de error pasan por un filtro global (`HttpExceptionFilter`) y comparten la misma forma:

```json
{
  "statusCode": 404,
  "error": "Not Found",
  "message": "Course 3 not found",
  "path": "/courses/3",
  "timestamp": "2026-11-13T15:20:00.000Z"
}
```

`400` conserva los mensajes de validación en un arreglo. `401` no distingue si falló el correo o la contraseña. `403` indica que la identidad existe pero no tiene permiso. Un error inesperado responde `500` con `Internal server error`: la traza y el detalle quedan solo en el log del servidor.

## Registro de solicitudes y tiempos

`RequestLoggerMiddleware` se aplica a todas las rutas y, al terminar la respuesta, registra `método ruta estado duración`. No guarda la cabecera `Authorization`, contraseñas, tokens ni el cuerpo de la petición. `TimingInterceptor` mide además lo que tarda el manejador y lo registra en nivel debug; si el manejador falla, no oculta el error.

## Capas del módulo de cursos

La actualización de un curso separa HTTP, regla de negocio y persistencia:

```text
CoursesController        conoce HTTP, pipes, guards y @CurrentUser
  ↓
UpdateCourseUseCase      decide quién puede editar y cómo
  ↓
CourseRepository         contrato con findById y save
  ↓
TypeOrmCourseRepository  traduce el contrato a TypeORM
```

`COURSE_REPOSITORY` se registra con `provide` y `useClass`. La regla de propiedad vive en `UpdateCourseUseCase`, junto al caso de uso, y se prueba con un repositorio falso sin HTTP ni PostgreSQL. El resto del módulo sigue en `CoursesService`: la refactorización es gradual y el contrato HTTP de `PATCH /courses/:id` no cambió.

## Consultas de cursos

`GET /courses`

| Parámetro | Regla | Por defecto |
| --- | --- | --- |
| `level` | `beginner`, `intermediate` o `advanced` si se envía; coincidencia exacta | — |
| `page` | entero mayor o igual que 1 | `1` |
| `limit` | entero de 1 a 50 | `10` |
| `sortBy` | `id`, `title` o `level` | `id` |
| `order` | `ASC` o `DESC` | `ASC` |

La respuesta incluye `items` y `meta` (`total`, `page`, `limit`, `totalPages`).

```http
GET /courses?level=beginner&page=1&limit=2&sortBy=title&order=ASC
GET /courses?sortBy=level&order=DESC
```

`GET /courses?level=no-existe` responde `200` y `items: []`. `GET /courses?sortBy=name` y `GET /courses?limit=51` responden `400`.

## Consultas de estudiantes

`GET /estudiantes`

| Parámetro | Regla | Por defecto |
| --- | --- | --- |
| `career` | carrera exacta si se envía | — |
| `semester` | entero de 1 a 10 | — |
| `isActive` | `true` o `false` | — |
| `search` | texto opcional; se compara, sin distinguir mayúsculas, con el nombre o el correo | — |
| `page` | entero mayor o igual que 1 | `1` |
| `limit` | entero de 1 a 50 | `10` |
| `sortBy` | `id`, `name`, `email`, `career` o `semester` | `id` |
| `order` | `ASC` o `DESC` | `ASC` |

La respuesta incluye `items` y `meta` (`total`, `page`, `limit`, `totalPages`). Los filtros se combinan con `AND` y `search` viaja como parámetro `:search`, no concatenado en el SQL.

```http
GET /estudiantes?search=ana&career=Ingenier%C3%ADa%20de%20Software&page=1&limit=5&sortBy=name&order=ASC
GET /estudiantes?isActive=false&sortBy=semester&order=DESC
```

`GET /estudiantes?sortBy=age` y `GET /estudiantes?limit=51` responden `400`.

El correo del estudiante es único en la base de datos (`UQ_estudiantes_email`). Repetirlo responde `409 Conflict`, tanto si lo detecta el servicio antes de insertar como si PostgreSQL rechaza la escritura.

## Consultas de matrículas

`GET /enrollments` devuelve cada matrícula con su estudiante y su curso. `search` se compara, sin distinguir mayúsculas, con el nombre del estudiante o el título del curso. El texto viaja como parámetro `:search`; no se concatena dentro del SQL.

| Parámetro | Regla | Por defecto |
| --- | --- | --- |
| `search` | texto opcional | — |
| `studentId` | entero mayor o igual que 1 | — |
| `courseId` | entero mayor o igual que 1 | — |
| `activeOnly` | `true` o `false`. Solo `true` limita a estudiantes activos | — |
| `page` | entero mayor o igual que 1 | `1` |
| `limit` | entero de 1 a 50 | `10` |

```http
GET /enrollments?search=nest&activeOnly=true&page=1&limit=5
GET /enrollments?studentId=4&courseId=1
GET /enrollments?search=inexistente
```

La última petición responde `200`, `items: []` y `total: 0`.

## Matrículas

Una matrícula vincula exactamente un estudiante y un curso (`ManyToOne` en ambos lados). La restricción `UQ_enrollments_student_course` impide repetir la pareja. El servicio también rechaza el duplicado antes de insertar y traduce el error `23505` de PostgreSQL a `409`.

```http
POST /enrollments
Content-Type: application/json

{"studentId": 4, "courseId": 1}
```

| Situación | Respuesta |
| --- | --- |
| Estudiante o curso inexistente | `404 Not Found` |
| Estudiante inactivo | `400 Bad Request` |
| Pareja estudiante–curso ya matriculada | `409 Conflict` |
| Id de ruta no numérico, por ejemplo `GET /courses/abc` | `400 Bad Request` |

Niveles válidos de un curso: `beginner`, `intermediate`, `advanced`.

## Demostración

La secuencia de la entrega está en [docs/demostracion.md](docs/demostracion.md). Las mismas peticiones están en [coursehub-api/coursehub.http](coursehub-api/coursehub.http).

## Pruebas

```bash
npm test
```

Cubren la validación de variables, la política de `synchronize`, los filtros de cursos, la búsqueda parametrizada, la paginación y el orden de estudiantes, el correo único, el guard de roles, el caso de uso de actualización con un repositorio falso, la forma de los errores, el middleware de registro y las reglas de matrícula (inexistente, inactivo, duplicado y restricción única).

## Organización

Los controladores delegan. Los DTO validan la entrada con `ValidationPipe` (`whitelist` y `forbidNonWhitelisted`). Los servicios concentran las reglas: estudiante activo, pareja única, paginación y columnas de orden permitidas. La actualización de cursos es el primer caso de uso con puerto y adaptador; los componentes transversales (logging, errores, tiempos) se aplican una sola vez desde `AppModule`.
