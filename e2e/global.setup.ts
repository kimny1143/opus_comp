import { test as setup } from '@playwright/test';
import { PrismaClient, Prisma, VendorCategory } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AccountType, BankInfo } from '../src/types/bankInfo';

const prisma = new PrismaClient();

setup('グローバルセットアップ', async () => {
  // データベースのクリーンアップ
  await prisma.$transaction([
    prisma.invoice.deleteMany(),
    prisma.vendor.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // テストユーザーの作成
  const hashedPassword = await bcrypt.hash('TestPass123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      hashedPassword,
      name: 'テストユーザー',
    },
  });

  // テスト用取引先の作成
  const vendor = await prisma.vendor.create({
    data: {
      name: 'テスト株式会社',
      email: 'test-vendor@example.com',
      registrationNumber: 'T123456789012',
      address: JSON.stringify({
        postalCode: '100-0001',
        prefecture: '東京都',
        city: '千代田区',
        street: '丸の内1-1-1',
      }),
      status: 'ACTIVE',
      category: VendorCategory.CORPORATION,
      createdBy: { connect: { id: user.id } }
    },
  });

  // テスト用請求書の作成
  const totalAmount = new Prisma.Decimal(10000);
  const taxRate = new Prisma.Decimal(0.1);

  const bankInfo: BankInfo = {
    bankName: 'テスト銀行',
    branchName: 'テスト支店',
    accountType: AccountType.ORDINARY,
    accountNumber: '1234567',
    accountHolder: 'テスト太郎'
  };

  await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2024-001',
      vendor: { connect: { id: vendor.id } },
      createdBy: { connect: { id: user.id } },
      issueDate: new Date('2024-03-01'),
      dueDate: new Date('2024-03-31'),
      status: 'PENDING',
      totalAmount,
      bankInfo: JSON.stringify(bankInfo),
      purchaseOrder: {
        create: {
          orderNumber: `PO-${Date.now()}`,
          orderDate: new Date(),
          status: 'COMPLETED',
          totalAmount,
          taxAmount: totalAmount.mul(taxRate),
          vendorId: vendor.id,
          createdById: user.id
        }
      },
      items: {
        create: [
          {
            itemName: 'テスト商品',
            quantity: 1,
            unitPrice: totalAmount,
            taxRate,
          },
        ],
      },
    },
  });

  await prisma.$disconnect();
}); 