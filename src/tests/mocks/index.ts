export * from './vendor'
export * from './invoice'
export * from './purchaseOrder'

// 共通のモックデータ生成オプション
export const mockOptions = {
  dateFormat: {
    withTime: true,
    timezone: 'Asia/Tokyo'
  },
  idPrefix: {
    vendor: 'vendor_',
    invoice: 'invoice_',
    purchaseOrder: 'po_'
  },
  defaultUser: {
    id: 'user_1',
    name: 'テストユーザー'
  }
} as const 