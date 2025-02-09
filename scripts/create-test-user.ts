const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10)

  // 管理者ユーザーの作成
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      hashedPassword,
      role: 'ADMIN'
    }
  })

  // 一般ユーザーの作成
  await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      hashedPassword,
      role: 'USER'
    }
  })

  console.log('テストユーザーを作成しました:')
  console.log('管理者: admin@example.com / password123')
  console.log('一般ユーザー: user@example.com / password123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })