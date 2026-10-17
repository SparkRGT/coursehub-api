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

## Endpoints

| Método | Ruta | Descripción |
| --- | --- | --- |
| `POST` | `/courses` | Crear un curso |
| `GET` | `/courses` | Listar cursos con filtro, página y orden |
| `GET` | `/courses/:id` | Obtener un curso |
| `PATCH` | `/courses/:id` | Actualizar un curso |
| `DELETE` | `/courses/:id` | Eliminar un curso |
| `POST` | `/estudiantes` | Crear un estudiante |
| `GET` | `/estudiantes` | Listar estudiantes |
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

Cubren la validación de variables, la política de `synchronize`, los filtros de cursos, la búsqueda parametrizada y las reglas de matrícula (inexistente, inactivo, duplicado y restricción única).

## Organización

Los controladores delegan. Los DTO validan la entrada con `ValidationPipe` (`whitelist` y `forbidNonWhitelisted`). Los servicios concentran las reglas: estudiante activo, pareja única, paginación y columnas de orden permitidas.
