// Configuración exclusiva de las pruebas e2e: nunca apunta a la base de
// desarrollo. Cada valor puede sobrescribirse desde fuera (CI o un PostgreSQL
// local con otro puerto), pero los valores por defecto ya son ejecutables.
process.env.NODE_ENV = 'test';
process.env.PORT ??= '4501';
process.env.DATABASE_HOST ??= 'localhost';
process.env.DATABASE_PORT ??= '5432';
process.env.DATABASE_USER ??= 'postgres';
process.env.DATABASE_PASSWORD ??= 'postgres';
process.env.DATABASE_NAME ??= 'coursehub_test';
process.env.JWT_SECRET ??=
  'clave-de-pruebas-e2e-con-mas-de-32-caracteres';
process.env.JWT_EXPIRES_IN ??= '15m';

if (!process.env.DATABASE_NAME.endsWith('_test')) {
  throw new Error(
    `Las pruebas e2e vacían la base de datos y DATABASE_NAME debe terminar en _test; recibido: ${process.env.DATABASE_NAME}`,
  );
}
