import { Page } from '@playwright/test';

export interface OrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
}

export const fillOrderItem = async (page: Page, index: number, item: OrderItem) => {
  await page.fill(`input[name="items.${index}.name"]`, item.name);
  await page.fill(`input[name="items.${index}.quantity"]`, String(item.quantity));
  await page.fill(`input[name="items.${index}.unitPrice"]`, String(item.unitPrice));
  await page.fill(`input[name="items.${index}.taxRate"]`, String(item.taxRate));
};

export const addNewOrderItem = async (page: Page) => {
  await page.click('button[aria-label="品目を追加"]');
};

export const getMockOrderItem = (overrides: Partial<OrderItem> = {}): OrderItem => {
  return {
    name: 'テスト商品',
    quantity: 1,
    unitPrice: 1000,
    taxRate: 0.10,
    ...overrides
  };
};

export const submitForm = async (page: Page) => {
  await page.click('button[type="submit"]');
};

export const waitForValidation = async (page: Page) => {
  // バリデーションの完了を待つ（200ms以内）
  await page.waitForTimeout(200);
}; 