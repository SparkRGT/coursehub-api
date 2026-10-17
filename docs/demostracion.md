# Demostración CourseHub API

Secuencia reproducible, pensada para menos de diez minutos. Ejecuta los comandos desde `coursehub-api/` (la carpeta que contiene `package.json`). No muestres el contenido de `.env`.

## 1. Entorno

```powershell
Copy-Item .env.example .env
```

`.env.example` documenta todas las variables con valores de ejemplo. El único dato local que debes completar es `DATABASE_PASSWORD`: escríbela en `.env`, no en el ejemplo y no en la grabación. Si PostgreSQL no está en el puerto `5432`, ajusta `DATABASE_PORT`. Confirma que existe la base `coursehub`.

`NODE_ENV=development` deja `synchronize` activo. `PORT=4500` es el puerto HTTP.

## 2. Arranque

```powershell
npm run start:dev
```

En el log debe aparecer:

```text
NODE_ENV=development; TypeORM synchronize=true
```

Eso crea o ajusta las tablas solo en desarrollo. Los registros quedan en PostgreSQL.

## 3. Curso y estudiante activo

```http
POST http://localhost:4500/courses
Content-Type: application/json

{"title": "NestJS desde cero", "level": "beginner"}
```

```http
POST http://localhost:4500/estudiantes
Content-Type: application/json

{
  "name": "Ana Pérez",
  "email": "ana.perez@example.com",
  "age": 21,
  "career": "Ingeniería de Software",
  "semester": 5,
  "isActive": true
}
```

Anota el `id` del curso y el `id` del estudiante. En los ejemplos de abajo se usan `1` y `1`; cámbialos por los que devolvió la API.

## 4. Matrícula, reinicio y consulta

```http
POST http://localhost:4500/enrollments
Content-Type: application/json

{"studentId": 1, "courseId": 1}
```

La respuesta incluye el estudiante y el curso de esa matrícula. Detén la API y vuelve a ejecutar `npm run start:dev`. Luego:

```http
GET http://localhost:4500/enrollments?studentId=1&courseId=1
```

La matrícula sigue ahí. `items` trae `student` y `course`. `meta.total` es al menos `1`.

## 5. Duplicado y estudiante inactivo

Repite el mismo `POST /enrollments`. La respuesta es `409 Conflict`.

Desactiva al estudiante y vuelve a intentar con otro curso:

```http
PATCH http://localhost:4500/estudiantes/1/status
Content-Type: application/json

{"isActive": false}
```

```http
POST http://localhost:4500/courses
Content-Type: application/json

{"title": "Consultas SQL", "level": "intermediate"}
```

```http
POST http://localhost:4500/enrollments
Content-Type: application/json

{"studentId": 1, "courseId": 2}
```

La matrícula del estudiante inactivo responde `400 Bad Request`. Un `studentId` o `courseId` que no existe responde `404`.

## 6. Cursos: página, límite y orden

```http
GET http://localhost:4500/courses?page=1&limit=2&sortBy=title&order=ASC
```

`items` tiene como máximo 2 cursos, ordenados por título. `meta` informa `page`, `limit`, `total` y `totalPages`.

## 7. Matrículas: filtros combinados

```http
GET http://localhost:4500/enrollments?search=Nest&studentId=1&courseId=1&page=1&limit=5
```

`search` no distingue mayúsculas y va como parámetro ligado, no como texto pegado al SQL. Una búsqueda sin coincidencias también es válida:

```http
GET http://localhost:4500/enrollments?search=inexistente
```

Responde `200` con `items: []` y `total: 0`.

## 8. Parámetro inválido

```http
GET http://localhost:4500/courses?sortBy=name
```

Responde `400`. Lo mismo ocurre con `limit=51`, `page=0` o un campo que el DTO no declara.

## 9. synchronize en producción

El código solo habilita `synchronize` cuando `NODE_ENV` es `development`. Para señalar el otro ambiente, en otra terminal:

```powershell
npm run build
$env:NODE_ENV="production"
npm run start:prod
```

El log debe decir `TypeORM synchronize=false`. Ese proceso no altera tablas. Vuelve a `start:dev` para seguir desarrollando.

La misma secuencia está agrupada en `coursehub.http`.
