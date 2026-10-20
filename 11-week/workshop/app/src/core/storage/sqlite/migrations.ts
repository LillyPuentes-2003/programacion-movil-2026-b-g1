// Migraciones versionadas y hacia adelante (persistence.md): una migración publicada no se vuelve
// a tocar; un cambio de esquema se agrega como una migración nueva.

// Versión 1 — tablas en español. Se conserva como registro histórico: ya no se ejecuta.
export const MIGRATION_V1 = `
CREATE TABLE IF NOT EXISTS negocios (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  cached_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS profesionales (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  negocio_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  cached_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_profesionales_negocio ON profesionales(negocio_id);

CREATE TABLE IF NOT EXISTS servicios (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  price_cop INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL,
  image_url TEXT,
  is_published INTEGER NOT NULL,
  negocio_id TEXT NOT NULL,
  profesional_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  cached_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_servicios_type ON servicios(type);
CREATE INDEX IF NOT EXISTS idx_servicios_negocio ON servicios(negocio_id);
`.trim()

// Versión 2 — tablas en inglés y singular (ADR-012). Las de la versión 1 son solo caché del
// catálogo, así que se descartan en vez de copiarse: la próxima carga con red las vuelve a llenar.
// Además sus valores de `type` estaban en español y ya no coinciden con los de la API.
export const MIGRATION_V2 = `
DROP TABLE IF EXISTS servicios;
DROP TABLE IF EXISTS profesionales;
DROP TABLE IF EXISTS negocios;

CREATE TABLE IF NOT EXISTS business (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  cached_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS professional (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  business_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  cached_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_professional_business ON professional(business_id);

CREATE TABLE IF NOT EXISTS service (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  price_cop INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL,
  image_url TEXT,
  is_published INTEGER NOT NULL,
  business_id TEXT NOT NULL,
  professional_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  cached_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_service_type ON service(type);
CREATE INDEX IF NOT EXISTS idx_service_business ON service(business_id);
`.trim()

export const SCHEMA_VERSION = 2
