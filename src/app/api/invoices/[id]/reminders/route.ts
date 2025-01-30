import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ReminderType } from '@prisma/client';

export async function GET(request: NextRequest, props: { params: Promise<{ invoiceId: string }> }) {
  const params = await props.params;
  try {
    const settings = await prisma.reminderSetting.findMany({
      where: {
        invoiceId: params.invoiceId
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Failed to fetch reminder settings:', error);
    return NextResponse.json(
      { error: 'リマインダー設定の取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, props: { params: Promise<{ invoiceId: string }> }) {
  const params = await props.params;
  try {
    const body = await request.json();
    const { type, daysBeforeOrAfter } = body;

    const setting = await prisma.reminderSetting.create({
      data: {
        invoiceId: params.invoiceId,
        type: type as ReminderType,
        daysBeforeOrAfter: daysBeforeOrAfter
      }
    });

    return NextResponse.json(setting);
  } catch (error) {
    console.error('Failed to create reminder setting:', error);
    return NextResponse.json(
      { error: 'リマインダー設定の作成に失敗しました' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, props: { params: Promise<{ invoiceId: string }> }) {
  const params = await props.params;
  try {
    const body = await request.json();
    const { reminderId, ...data } = body;

    const setting = await prisma.reminderSetting.update({
      where: {
        id: reminderId,
        invoiceId: params.invoiceId
      },
      data
    });

    return NextResponse.json(setting);
  } catch (error) {
    console.error('Failed to update reminder setting:', error);
    return NextResponse.json(
      { error: 'リマインダー設定の更新に失敗しました' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ invoiceId: string }> }) {
  const params = await props.params;
  try {
    const body = await request.json();
    const { reminderId } = body;

    await prisma.reminderSetting.delete({
      where: {
        id: reminderId,
        invoiceId: params.invoiceId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete reminder setting:', error);
    return NextResponse.json(
      { error: 'リマインダー設定の削除に失敗しました' },
      { status: 500 }
    );
  }
} 