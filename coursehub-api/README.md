# CourseHub API

La guía de la entrega está en el [README del repositorio](../README.md): requisitos, variables, arranque, endpoints, consultas y demostración.

Desde esta carpeta:

```bash
npm install
copy .env.example .env
npm run start:dev
```

Sustituye `DATABASE_PASSWORD` en `.env` por la contraseña de tu PostgreSQL local. No la compartas ni la subas al repositorio. El archivo de ejemplo usa `cambia-esta-clave` a propósito.

Con `NODE_ENV=development` el arranque registra `TypeORM synchronize=true`. Con `NODE_ENV=production`, `synchronize=false`.

La documentación del contrato está en `http://localhost:4500/docs` y el JSON en `/docs-json`; se monta fuera de producción. Las rutas llevan la versión: `/v1/courses`, `/v1/auth/login`, etc.

## Colección de solicitudes

`collection/` es una colección Bruno con el flujo principal, variables de entorno sin secretos y aserciones por respuesta. Se ejecuta desde esa carpeta:

```bash
cd collection
npx @usebruno/cli run . --env local
```

Requiere la API en marcha y una cuenta con rol `admin` (ver [Autorización](../README.md#autorización)). `coursehub.http` sirve para explorar las mismas rutas a mano.

## Pruebas

```bash
npm test        # unitarias, sin base de datos
npm run test:e2e  # integración contra una base llamada coursehub_test
```

Las pruebas e2e vacían las tablas de la base indicada en `DATABASE_NAME`; el conjunto se niega a ejecutarse si ese nombre no termina en `_test`. Los valores esperados están en [.env.test.example](.env.test.example). El detalle de cada caso y el flujo de integración continua están en el [README del repositorio](../README.md#pruebas-de-integración-e2e).
