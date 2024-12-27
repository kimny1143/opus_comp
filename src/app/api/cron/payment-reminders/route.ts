import { NextRequest, NextResponse } from 'next/server';
import { sendPaymentDueReminders, sendOverdueReminders } from '@/lib/notification/payment-reminder';

export async function POST(request: NextRequest) {
  try {
    // 認証トークンの検証
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await Promise.all([
      sendPaymentDueReminders(),
      sendOverdueReminders()
    ]);

    return NextResponse.json({
      success: true,
      message: 'Payment reminders sent successfully'
    });
  } catch (error) {
    console.error('Failed to send payment reminders:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '支払いリマインダーの送信に失敗しました'
      },
      { status: 500 }
    );
  }
} 