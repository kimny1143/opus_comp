import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { InvoiceStatus } from '@/types/invoice';

export async function POST(request: NextRequest) {
  try {
    const { action, invoiceIds } = await request.json();

    switch (action) {
      case 'updateStatus':
        const { status } = await request.json();
        await prisma.invoice.updateMany({
          where: {
            id: {
              in: invoiceIds
            }
          },
          data: {
            status: status as unknown as InvoiceStatus
          }
        });
        break;

      case 'delete':
        await prisma.invoice.deleteMany({
          where: {
            id: {
              in: invoiceIds
            }
          }
        });
        break;

      default:
        throw new Error('Invalid action');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '操作に失敗しました' },
      { status: 500 }
    );
  }
} 