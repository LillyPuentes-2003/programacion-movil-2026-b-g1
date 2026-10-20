import { CapacitorSQLite, SQLiteConnection, type SQLiteDBConnection } from '@capacitor-community/sqlite'
import { Capacitor } from '@capacitor/core'
import { drizzle, type SqliteRemoteDatabase } from 'drizzle-orm/sqlite-proxy'

import * as schema from './schema'
import { MIGRATION_V2 } from './migrations'

const DATABASE_NAME = 'manicita'

const sqliteConnection = new SQLiteConnection(CapacitorSQLite)
let dbConnection: SQLiteDBConnection | null = null
let db: SqliteRemoteDatabase<typeof schema> | null = null

async function ensureWebStore(): Promise<void> {
  if (Capacitor.getPlatform() !== 'web') return
  if (!document.querySelector('jeep-sqlite')) {
    document.body.appendChild(document.createElement('jeep-sqlite'))
  }
  await customElements.whenDefined('jeep-sqlite')
  await sqliteConnection.initWebStore()
}

async function openConnection(): Promise<SQLiteDBConnection> {
  await ensureWebStore()

  const consistent = (await sqliteConnection.checkConnectionsConsistency()).result ?? false
  const alreadyOpen = (await sqliteConnection.isConnection(DATABASE_NAME, false)).result ?? false

  const connection =
    consistent && alreadyOpen
      ? await sqliteConnection.retrieveConnection(DATABASE_NAME, false)
      : await sqliteConnection.createConnection(DATABASE_NAME, false, 'no-encryption', 1, false)

  await connection.open()
  // Idempotente: los DROP de la V2 solo afectan a las tablas en español de la V1, si existen.
  await connection.execute(MIGRATION_V2)
  return connection
}

// Composition root: se llama una sola vez al iniciar la app (ver core/di/AppProviders). El resto
// del código pide la instancia ya abierta con getDb(), nunca abre su propia conexión.
export async function initDb(): Promise<SqliteRemoteDatabase<typeof schema>> {
  if (db) return db

  dbConnection = await openConnection()
  const connection = dbConnection

  db = drizzle(async (sql, params, method) => {
    if (method === 'run') {
      await connection.run(sql, params, false)
      return { rows: [] }
    }
    const result = await connection.query(sql, params)
    return { rows: result.values ?? [] }
  }, { schema })

  return db
}

export function getDb(): SqliteRemoteDatabase<typeof schema> {
  if (!db) {
    throw new Error('initDb() todavía no se ha llamado — arranca desde core/di/AppProviders')
  }
  return db
}
