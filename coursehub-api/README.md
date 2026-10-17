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
