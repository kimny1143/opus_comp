import type { NextApiRequest, NextApiResponse } from 'next'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: '必須項目が入力されていません' })
    }

    // メールアドレスの重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return res.status(400).json({ message: 'このメールアドレスは既に使用されています' })
    }

    const hashedPassword = await hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'user', // デフォルトロールを設定
      },
    })

    res.status(201).json({ message: 'ユーザーが作成されました', userId: user.id })
  } catch (error) {
    console.error('Signup error:', error)
    res.status(500).json({ message: 'サーバーエラーが発生しました' })
  }
} 