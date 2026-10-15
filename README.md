# CourseHub API consultable

Listados paginados de cursos y matrículas. El detalle del contrato está en [coursehub-api/README.md](coursehub-api/README.md).

Ejemplos:

```http
GET /courses?level=beginner&page=1&limit=2&sortBy=title&order=ASC
GET /courses?sortBy=level&order=DESC
GET /enrollments?search=nest&activeOnly=true&page=1&limit=5
GET /enrollments?studentId=4&courseId=1
```

Una búsqueda sin coincidencias, como `GET /enrollments?search=inexistente`, responde `200` con `items: []`.
