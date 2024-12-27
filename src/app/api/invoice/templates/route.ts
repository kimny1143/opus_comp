import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// テンプレート一覧の取得
export async function GET() {
  try {
    const templates = await prisma.invoiceTemplate.findMany({
      orderBy: {
        updatedAt: Prisma.SortOrder.desc
      }
    });
    return NextResponse.json({ success: true, templates });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '取得に失敗しました' },
      { status: 500 }
    );
  }
}

// 新規テンプレートの保存
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const template = await prisma.invoiceTemplate.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    return NextResponse.json({ success: true, template });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '保存に失敗しました' },
      { status: 500 }
    );
  }
} 