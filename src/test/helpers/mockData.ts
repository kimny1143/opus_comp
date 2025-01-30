import { PrismaClient, InvoiceStatus, Vendor, VendorCategory, User, PurchaseOrderStatus, Prisma } from '@prisma/client';
import bcryptjs from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { vi } from 'vitest';

// モックPrismaクライアントの作成
export const mockPrisma = vi.mocked({
  user: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  vendor: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  purchaseOrder: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  invoice: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  $transaction: vi.fn((callback) => callback(mockPrisma)),
  $connect: vi.fn(),
  $disconnect: vi.fn(),
  $on: vi.fn(),
}) as unknown as PrismaClient;

// インターフェース定義
type MockInvoiceParams = Partial<{
  status: InvoiceStatus;
  issueDate: Date;
  dueDate: Date;
  vendorId: string;
  invoiceNumber: string;
  totalAmount: number;
  bankInfo: {
    bankName: string;
    branchName: string;
    accountType: string;
    accountNumber: string;
    accountName: string;
  };
  items: Array<{
    itemName: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    description?: string;
  }>;
}>;

type MockVendorParams = Partial<{
  name: string;
  category: VendorCategory;
  email: string;
  phone: string;
  address: string;
}> & Required<Pick<Vendor, 'name' | 'category'>>;

// モックデータ作成関数
export const createTestUser = async (email: string): Promise<User> => {
  const hashedPassword = await bcryptjs.hash('testpassword', 10);
  const data: Prisma.UserUncheckedCreateInput = {
    id: uuidv4(),
    email,
    name: 'Test User',
    hashedPassword,
    role: 'USER',
  };

  return mockPrisma.user.create({ data });
};

export const createMockVendor = async (
  params: MockVendorParams = {
    name: 'Test Vendor',
    category: VendorCategory.CORPORATION,
  },
  userId?: string
): Promise<Vendor> => {
  const defaultParams: MockVendorParams = {
    name: 'Test Vendor',
    category: VendorCategory.CORPORATION,
    email: 'test@example.com',
    phone: '0123456789',
    address: 'Test Address',
  };

  const mergedParams = { ...defaultParams, ...params };
  const createdById = userId || (await createTestUser('vendor-creator@example.com')).id;
  
  const data: Prisma.VendorUncheckedCreateInput = {
    id: uuidv4(),
    ...mergedParams,
    createdById,
  };

  return mockPrisma.vendor.create({ data });
};

export const createMockInvoice = async (
  params: MockInvoiceParams = {},
  userId?: string
) => {
  const createdById = userId || (await createTestUser('invoice-creator@example.com')).id;
  const vendor = await createMockVendor(undefined, createdById);
  
  const purchaseOrderData: Prisma.PurchaseOrderUncheckedCreateInput = {
    id: uuidv4(),
    orderNumber: `PO-${Date.now()}`,
    status: PurchaseOrderStatus.COMPLETED,
    totalAmount: new Prisma.Decimal(10000),
    taxAmount: new Prisma.Decimal(1000),
    orderDate: new Date(),
    vendorId: vendor.id,
    createdById,
  };

  const purchaseOrder = await mockPrisma.purchaseOrder.create({
    data: purchaseOrderData,
  });

  const defaultParams: MockInvoiceParams = {
    status: InvoiceStatus.DRAFT,
    issueDate: new Date(),
    dueDate: new Date(),
    invoiceNumber: 'INV-TEST-001',
    totalAmount: 10000,
    bankInfo: {
      bankName: 'Test Bank',
      branchName: 'Test Branch',
      accountType: '普通',
      accountNumber: '1234567',
      accountName: 'Test Account',
    },
    items: [
      {
        itemName: 'Test Item',
        quantity: 1,
        unitPrice: 1000,
        taxRate: 0.1,
        description: 'Test Description',
      },
    ],
  };

  const mergedParams = { ...defaultParams, ...params };

  const data: Prisma.InvoiceUncheckedCreateInput = {
    id: uuidv4(),
    status: mergedParams.status || InvoiceStatus.DRAFT,
    issueDate: mergedParams.issueDate || new Date(),
    dueDate: mergedParams.dueDate || new Date(),
    invoiceNumber: mergedParams.invoiceNumber || `INV-${Date.now()}`,
    vendorId: vendor.id,
    purchaseOrderId: purchaseOrder.id,
    createdById,
    bankInfo: mergedParams.bankInfo as any,
    totalAmount: new Prisma.Decimal(mergedParams.totalAmount || 0),
  };

  if (mergedParams.items) {
    (data as any).items = {
      create: mergedParams.items.map(item => ({
        ...item,
        createdById,
      })),
    };
  }

  return mockPrisma.invoice.create({
    data,
    include: {
      items: true,
      vendor: true,
      purchaseOrder: true,
    }
  });
};

// モックのリセット
export const resetMocks = () => {
  vi.clearAllMocks();
}; 