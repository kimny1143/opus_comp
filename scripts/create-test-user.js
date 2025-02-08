const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    const email = 'test@example.com'
    const password = 'password123'
    
    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // 既存のユーザーを確認
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('テストユーザーは既に存在します')
      return existingUser
    }

    // 新しいユーザーを作成
    const user = await prisma.user.create({
      data: {
        email,
        hashedPassword,
        name: 'Test User',
        role: 'USER'
      }
    })

    console.log('テストユーザーを作成しました:', user)
    return user
  } catch (error) {
    console.error('テストユーザーの作成に失敗しました:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser()