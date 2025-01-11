import { PrismaClient, InvoiceStatus, Vendor, VendorCategory, PurchaseOrderStatus } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

interface MockInvoiceParams {
  status?: InvoiceStatus;
  dueDate?: Date;
  vendorId?: string;
  invoiceNumber?: string;
  totalAmount?: number;
}

interface MockVendorParams {
  name?: string;
  category?: VendorCategory;
}

export const createTestUser = async (email: string = 'test@example.com') => {
  const hashedPassword = await hash('password123', 10);
  return prisma.user.upsert({
    where: { email },
    update: {
      hashedPassword
    },
    create: {
      email,
      hashedPassword,
      name: 'Test User',
      role: 'USER'
    }
  });
};

export const createMockVendor = async (params: MockVendorParams = {}): Promise<Vendor> => {
  const { 
    name = `TestVendor-${Date.now()}`,
    category = VendorCategory.CORPORATION
  } = params;

  const user = await createTestUser();
  
  return prisma.vendor.create({
    data: {
      name,
      email: `${name.toLowerCase().replace(/\s+/g, '-')}@example.com`,
      phone: '123-456-7890',
      address: '123 Test St, Test City, TS 12345',
      category,
      createdById: user.id
    }
  });
};

export const createMockInvoice = async (params: MockInvoiceParams = {}) => {
  const {
    status = InvoiceStatus.DRAFT,
    dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    vendorId,
    invoiceNumber = `TEST-${Date.now()}`,
    totalAmount = 100000
  } = params;

  // ベンダーが指定されていない場合は新規作成
  const vendor = vendorId ? await prisma.vendor.findUnique({ where: { id: vendorId } })
                         : await createMockVendor();
  
  if (!vendor) {
    throw new Error('Vendor not found');
  }

  const user = await createTestUser();

  // 発注書の作成
  const purchaseOrder = await prisma.purchaseOrder.create({
    data: {
      orderNumber: `PO-${Date.now()}`,
      vendorId: vendor.id,
      status: PurchaseOrderStatus.COMPLETED,
      totalAmount,
      taxAmount: totalAmount * 0.1,
      orderDate: new Date(),
      createdById: user.id
    }
  });

  return prisma.invoice.create({
    data: {
      invoiceNumber,
      status,
      dueDate,
      totalAmount,
      issueDate: new Date(),
      bankInfo: {
        bankName: 'Test Bank',
        accountNumber: '1234567890',
        accountType: 'Savings'
      },
      purchaseOrderId: purchaseOrder.id,
      vendorId: vendor.id,
      createdById: user.id
    },
    include: {
      vendor: true,
      purchaseOrder: true
    }
  });
}; 