import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// Esquema versión 2 (ver persistence.md y ADR-012): tablas business, professional, service, en
// inglés y singular. Caché de solo lectura del catálogo — la app nunca escribe estas filas, solo
// las reemplaza con lo que llega del servidor.

export const businesses = sqliteTable('business', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  address: text('address').notNull(),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  cachedAt: integer('cached_at').notNull(),
})

export const professionals = sqliteTable(
  'professional',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    businessId: text('business_id').notNull(),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
    cachedAt: integer('cached_at').notNull(),
  },
  (table) => [index('idx_professional_business').on(table.businessId)],
)

export const services = sqliteTable(
  'service',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    type: text('type').notNull(),
    description: text('description'),
    priceCop: integer('price_cop').notNull(),
    durationMinutes: integer('duration_minutes').notNull(),
    imageUrl: text('image_url'),
    isPublished: integer('is_published').notNull(),
    businessId: text('business_id').notNull(),
    professionalId: text('professional_id').notNull(),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
    cachedAt: integer('cached_at').notNull(),
  },
  (table) => [
    index('idx_service_type').on(table.type),
    index('idx_service_business').on(table.businessId),
  ],
)
