import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/api-utils'
import { Prisma, InvoiceStatus } from '@prisma/client'
import { serializeDecimal } from '@/lib/utils/decimal-serializer'

interface InvoiceItem {
  itemName: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  description?: string;
}

interface ProcessedInvoiceItem {
  itemName: string;
  description: string | null;
  quantity: number;
  unitPrice: number;
  taxRate: number;
}

interface CreateInvoiceData {
  purchaseOrderId: string;
  vendorId: string;
  issueDate?: string;
  dueDate?: string;
  items: InvoiceItem[];
}

// GET: 請求書一覧の取得
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: '認証が必要です' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 10
    const statusParam = searchParams.get('status')
    const purchaseOrderId = searchParams.get('purchaseOrderId')

    // statusParam を InvoiceStatus 型にキャスト
    const status = statusParam as InvoiceStatus | undefined;
    const validStatus = status && Object.values(InvoiceStatus).includes(status) ? status : undefined;

    const where: Prisma.InvoiceWhereInput = {
      ...(status && { status }),
      ...(purchaseOrderId && { purchaseOrderId }),
    }

    // 完了済みの発注書で、まだ請求書が作成されていないものを取得
    const completedPurchaseOrders = await prisma.purchaseOrder.findMany({
      where: {
        status: 'COMPLETED',
        invoices: {
          none: {}
        }
      },
      include: {
        vendor: true,
        items: true
      }
    })

    const [total, invoices] = await Promise.all([
      prisma.invoice.count({ where }),
      prisma.invoice.findMany({
        where,
        include: {
          template: {
            include: {
              templateItems: true
            }
          },
          purchaseOrder: {
            include: {
              vendor: true
            }
          },
          items: true,
          vendor: true,
          statusHistory: {
            include: {
              user: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      })
    ])

    // レスポンスデータをシリアライズ
    const serializedInvoices = serializeDecimal(invoices);
    
    return NextResponse.json({
      success: true,
      data: {
        invoices: serializedInvoices,
        completedPurchaseOrders,
        metadata: {
          total,
          page,
          limit
        }
      }
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// POST: 請求書の新規作成
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: '認証が必要です' }, { status: 401 })
    }

    console.log('リクエストの処理を開始')
    const rawData = await request.text()
    console.log('受信したデータ:', rawData)

    let data: CreateInvoiceData
    try {
      data = JSON.parse(rawData)
    } catch (parseError) {
      console.error('JSONパースエラー:', parseError)
      return NextResponse.json({ 
        success: false, 
        error: 'リクエストデータのパースに失敗しました' 
      }, { status: 400 })
    }

    // データのバリデーション
    if (!data || typeof data !== 'object') {
      console.error('不正なデータ形式:', data)
      return NextResponse.json({ 
        success: false, 
        error: 'リクエストデータが不正です' 
      }, { status: 400 })
    }

    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: '請求書の項目が必要です' 
      }, { status: 400 })
    }

    if (!data.purchaseOrderId || typeof data.purchaseOrderId !== 'string') {
      return NextResponse.json({ 
        success: false, 
        error: '発注書IDが必要です' 
      }, { status: 400 })
    }

    if (!data.vendorId || typeof data.vendorId !== 'string') {
      return NextResponse.json({ 
        success: false, 
        error: '取引先IDが必要です' 
      }, { status: 400 })
    }

    // 数値型の変換とバリデーション
    const items: ProcessedInvoiceItem[] = data.items.map((item: InvoiceItem, index: number) => {
      if (!item.itemName || typeof item.itemName !== 'string') {
        throw new Error(`項目${index + 1}の商品名が不正です`)
      }

      const quantity = Number(item.quantity)
      const unitPrice = Number(item.unitPrice)
      const taxRate = Number(item.taxRate)

      if (isNaN(quantity) || quantity <= 0) {
        throw new Error(`項目${index + 1}の数量が不正です`)
      }
      if (isNaN(unitPrice) || unitPrice < 0) {
        throw new Error(`項目${index + 1}の単価が不正です`)
      }
      if (isNaN(taxRate) || taxRate < 0) {
        throw new Error(`項目${index + 1}の税率が不正です`)
      }

      return {
        itemName: item.itemName,
        description: item.description || null,
        quantity,
        unitPrice,
        taxRate: taxRate / 100, // 10を0.1に変換
      }
    })

    // 合計金額の計算
    const totalAmount = items.reduce((sum: number, item: ProcessedInvoiceItem) => {
      return sum + (item.quantity * item.unitPrice * (1 + item.taxRate))
    }, 0)

    // 請求書の作成
    const createData = {
      purchaseOrderId: data.purchaseOrderId,
      vendorId: data.vendorId,
      status: 'DRAFT' as const,
      issueDate: data.issueDate ? new Date(data.issueDate) : new Date(),
      dueDate: data.dueDate ? new Date(data.dueDate) : new Date(),
      createdById: session.user.id,
      updatedById: session.user.id,
      totalAmount,
      templateId: null,
      invoiceNumber: `INV-${new Date().getTime()}`,
      bankInfo: Prisma.JsonNull,
      items: {
        create: items
      }
    } satisfies Prisma.InvoiceUncheckedCreateInput

    console.log('作成するデータ:', createData)

    const invoice = await prisma.invoice.create({
      data: createData,
      include: {
        template: {
          include: {
            templateItems: true
          }
        },
        purchaseOrder: {
          include: {
            vendor: true
          }
        },
        items: true,
        vendor: true,
        statusHistory: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    // レスポンスデータをシリアライズ
    const serializedInvoice = serializeDecimal(invoice);

    return NextResponse.json({ 
      success: true, 
      data: serializedInvoice 
    })

  } catch (error) {
    // エラーオブジェクトを文字列に変換して出力
    const errorDetail = error instanceof Error ? error.message : String(error)
    console.log('Invoice creation error:', errorDetail)
    
    const errorMessage = error instanceof Error ? error.message : '請求書の作成に失敗しました'
    return NextResponse.json({ 
      success: false, 
      error: errorMessage
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}