import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    async embrace({ name, path }) {
      // Baseline migration for existing database
      console.log(`Processing migration: ${name}`)
    }
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})

