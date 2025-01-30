import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // データベース接続確認
    const dbCheck = await prisma.$queryRaw`SELECT 1`
    const memoryUsage = process.memoryUsage()
    
    return NextResponse.json(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: {
          connected: true,
          latency: Date.now() // クエリ実行時間を計測可能
        },
        system: {
          memory: {
            heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
            heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
            rss: Math.round(memoryUsage.rss / 1024 / 1024)
          }
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: 'Service unavailable',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    )
  }
} 
