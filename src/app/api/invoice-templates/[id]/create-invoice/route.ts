import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { InvoiceTemplate } from '@prisma/client'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  const template = await prisma.invoiceTemplate.findFirst({
    where: {
      id: request.url.split('/').pop(),
      userId: session.user.id,
    },
    include: {
      items: true,
    },
  })

  if (!template) {
    return NextResponse.json({ error: 'テンプレートが見つかりません' }, { status: 404 })
  }

  // 以降のコード...
} 