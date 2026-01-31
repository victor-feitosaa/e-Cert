import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pkg from 'pg'

const { Pool } = pkg

// Pool de conexão do PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

// Adapter exigido pelo Prisma 7
const adapter = new PrismaPg(pool)

// Prisma Client
const prisma = new PrismaClient({
  adapter,
  log:
    process.env.NODE_ENV === 'development'
      ? ['query', 'info', 'warn', 'error']
      : ['warn', 'error'],
})

// Conexão explícita (opcional, mas didática)
const connectDB = async () => {
  try {
    await prisma.$connect()
    console.log('Connected to database')
  } catch (error) {
    console.error('Failed to connect to database:', error)
    process.exit(1)
  }
}

// Encerramento limpo
const disconnectDB = async () => {
  await prisma.$disconnect()
  await pool.end()
  console.log('Disconnected from database')
}

export { prisma, connectDB, disconnectDB }
