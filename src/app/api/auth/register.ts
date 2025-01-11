import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { hash } from 'bcrypt';
import * as jwt from 'jsonwebtoken';

// Prisma Client のインスタンスを作成
const prisma = new PrismaClient();

interface RegisterRequestBody {
  name?: string;
  email: string;
  password: string;
}

interface ErrorResponse {
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any | ErrorResponse>
) {
  try {
    // POSTメソッドのみ許可
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    const { name, email, password } = req.body as RegisterRequestBody;

    // リクエストボディをログに出力
    console.log('リクエストボディ:', req.body);

    // 必須項目のバリデーション
    if (!email || !password) {
      return res.status(400).json({ message: '必須項目が入力されていません' });
    }

    // メールアドレスの形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'メールアドレスの形式が正しくありません' });
    }

    // パスワードの長さチェック
    if (password.length < 8) {
      return res.status(400).json({ message: 'パスワードは8文字以上である必要があります' });
    }

    // メールアドレスの重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'このメールアドレスは既に登録されています' });
    }

    // パスワードのハッシュ化
    const hashedPassword = await hash(password, 10);

    // ユーザーの作成
    const newUser = await prisma.user.create({
      data: {
        name: name?.trim() || email.split('@')[0],
        email: email.toLowerCase().trim(),
        hashedPassword,
        role: 'user',
      },
    });

    // newUserの内容をログに出力
    console.log('新規ユーザー:', newUser);

    // secretKeyを環境変数から取得
    const secretKey = process.env.SECRET_KEY;

    // secretKeyの値をログに出力
    console.log('SECRET_KEYの値:', secretKey);

    if (!secretKey) {
      throw new Error('SECRET_KEYが環境変数に定義されていません');
    }

    // JWTトークンを生成
    const payload = {
      id: newUser.id,
      email: newUser.email,
    };

    console.log('ペイロード:', payload);

    const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });

    // レスポンスを送信
    return res.status(201).json({ token });

  } catch (error: any) {
    console.error('Registration error:', error.message);
    console.error('エラー詳細:', error);

    if (error instanceof PrismaClientKnownRequestError) {
      console.error('Prisma エラー:', error.message);
      return res.status(500).json({ message: 'データベースエラーが発生しました' });
    } else {
      console.error('未知のエラー:', error);
      return res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
  }
} 