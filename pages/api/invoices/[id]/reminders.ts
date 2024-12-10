import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ error: '認証が必要です' });
  }

  const { id } = req.query;
  if (typeof id !== 'string') {
    return res.status(400).json({ error: '無効なIDです' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const reminders = await prisma.reminderSetting.findMany({
          where: { invoiceId: id },
          include: {
            histories: {
              orderBy: { sentAt: 'desc' },
              take: 1,
            },
          },
        });
        res.status(200).json(reminders);
      } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'リマインダー設定の取得に失敗しました' });
      }
      break;

    case 'POST':
      try {
        const { type, daysBeforeOrAfter } = req.body;
        const reminder = await prisma.reminderSetting.create({
          data: {
            invoiceId: id,
            type,
            daysBeforeOrAfter,
          },
        });
        res.status(200).json(reminder);
      } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'リマインダー設定の作成に失敗しました' });
      }
      break;

    case 'PUT':
      try {
        const { reminderId, enabled, daysBeforeOrAfter } = req.body;
        const reminder = await prisma.reminderSetting.update({
          where: { id: reminderId },
          data: {
            enabled,
            daysBeforeOrAfter,
          },
        });
        res.status(200).json(reminder);
      } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'リマインダー設定の更新に失敗しました' });
      }
      break;

    case 'DELETE':
      try {
        const { reminderId } = req.body;
        await prisma.reminderSetting.delete({
          where: { id: reminderId },
        });
        res.status(204).end();
      } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'リマインダー設定の削除に失敗しました' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 