// src/lib/db.ts
import mongoose, { Connection } from 'mongoose'

// Environment variables dengan validation yang lebih ketat
const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || ''
const NODE_ENV = process.env.NODE_ENV || 'development'

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  )
}

// Interface untuk global caching
interface MongooseCache {
  conn: Connection | null
  promise: Promise<Connection> | null
}

// Global is used here to maintain a cached connection across hot reloads in development
let cached: MongooseCache = (global as any).mongoose

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null }
}

// Connection options yang lebih komprehensif
const options = {
  bufferCommands: false,
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4, // Use IPv4, skip trying IPv6
  retryWrites: true,
  retryReads: true,
}

/**
 * Global function to connect to MongoDB
 * Uses connection caching to prevent multiple connections in serverless environments
 */
export async function connectToDatabase(): Promise<Connection> {
  // If a connection already exists, return it
  if (cached.conn) {
    console.log('🔄 Using existing MongoDB connection')
    return cached.conn
  }

  // If no connection exists but a promise is in progress, wait for it
  if (!cached.promise) {
    console.log('🔗 Creating new MongoDB connection...')
    
    cached.promise = mongoose.connect(MONGODB_URI, options).then((mongoose) => {
      console.log('✅ MongoDB connected successfully')
      return mongoose.connection
    })
  }

  try {
    cached.conn = await cached.promise
    
    // Event listeners untuk monitoring connection
    cached.conn.on('connected', () => {
      console.log('🟢 MongoDB connected')
    })

    cached.conn.on('error', (err) => {
      console.error('🔴 MongoDB connection error:', err)
      cached.conn = null
      cached.promise = null
    })

    cached.conn.on('disconnected', () => {
      console.log('🟡 MongoDB disconnected')
      if (NODE_ENV === 'production') {
        cached.conn = null
        cached.promise = null
      }
    })

    return cached.conn
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error)
    cached.promise = null
    throw error
  }
}

/**
 * Disconnect from MongoDB
 * Useful for cleanup in tests or when shutting down the application
 */
export async function disconnectFromDatabase(): Promise<void> {
  try {
    if (cached.conn) {
      await mongoose.disconnect()
      cached.conn = null
      cached.promise = null
      console.log('🔌 MongoDB disconnected successfully')
    }
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error)
    throw error
  }
}

/**
 * Check if database is connected
 */
export function isDatabaseConnected(): boolean {
  return cached.conn?.readyState === 1
}

/**
 * Get connection status
 */
export function getConnectionStatus(): string {
  if (!cached.conn) return 'disconnected'
  
  switch (cached.conn.readyState) {
    case 0:
      return 'disconnected'
    case 1:
      return 'connected'
    case 2:
      return 'connecting'
    case 3:
      return 'disconnecting'
    default:
      return 'unknown'
  }
}

/**
 * Get database statistics
 */
export async function getDatabaseStats() {
  if (!isDatabaseConnected()) {
    throw new Error('Database is not connected')
  }

  try {
    const admin = cached.conn!.db.admin()
    const stats = await admin.serverStatus()
    
    return {
      status: 'connected',
      host: stats.host,
      version: stats.version,
      uptime: stats.uptime,
      connections: stats.connections,
      network: stats.network,
      memory: stats.mem
    }
  } catch (error) {
    console.error('Error getting database stats:', error)
    throw error
  }
}

/**
 * Health check function
 */
export async function healthCheck(): Promise<{
  status: string
  timestamp: string
  database: string
  latency?: number
}> {
  const timestamp = new Date().toISOString()
  
  try {
    if (!isDatabaseConnected()) {
      await connectToDatabase()
    }

    const startTime = Date.now()
    await cached.conn!.db.admin().ping()
    const latency = Date.now() - startTime

    return {
      status: 'healthy',
      timestamp,
      database: 'mongodb',
      latency
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp,
      database: 'mongodb',
    }
  }
}

// Export the cached object for advanced use cases
export { cached }

// Graceful shutdown handler
if (typeof process !== 'undefined') {
  process.on('SIGINT', async () => {
    console.log('🛑 Received SIGINT, closing MongoDB connection...')
    await disconnectFromDatabase()
    process.exit(0)
  })

  process.on('SIGTERM', async () => {
    console.log('🛑 Received SIGTERM, closing MongoDB connection...')
    await disconnectFromDatabase()
    process.exit(0)
  })
}

export default connectToDatabase