import { format } from 'date-fns';
import { INVOICE_STATUS, TAX_RATES } from '../../src/types/validation/invoiceSchema';
import { VENDOR_STATUS } from '../../src/types/validation/vendorSchema';

type InvoiceItem = {
  itemName: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
};

type CreateInvoiceParams = {
  registrationNumber?: string;
  vendorId?: string;
  status?: keyof typeof INVOICE_STATUS;
  issueDate?: string;
  dueDate?: string;
  items?: InvoiceItem[];
};

/**
 * テストデータのロードヘルパー
 */
export const loadTestData = {
  invoice: (key: string) => {
    return cy.fixture('invoices.json').then((data) => {
      const paths = key.split('.');
      return paths.reduce((obj, path) => obj[path], data);
    });
  },
  vendor: (key: string) => {
    return cy.fixture('vendors.json').then((data) => {
      const paths = key.split('.');
      return paths.reduce((obj, path) => obj[path], data);
    });
  }
};

/**
 * 請求書データの作成ヘルパー
 */
export const createTestInvoice = (params: CreateInvoiceParams = {}) => {
  const defaultInvoice = {
    registrationNumber: 'T1234567890123',
    vendorId: 'test-vendor-id',
    status: 'DRAFT' as const,
    issueDate: format(new Date(), 'yyyy-MM-dd'),
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    items: [
      {
        itemName: 'テスト商品',
        quantity: 1,
        unitPrice: 1000,
        taxRate: 0.10
      }
    ]
  };

  const invoice = { ...defaultInvoice, ...params };

  cy.get('[data-cy=registration-number]').type(invoice.registrationNumber);
  cy.get('[data-cy=vendor-select]').click().type(`${invoice.vendorId}{enter}`);
  cy.get('[data-cy=issue-date]').type(invoice.issueDate);
  cy.get('[data-cy=due-date]').type(invoice.dueDate);

  invoice.items.forEach((item, index) => {
    if (index > 0) {
      cy.get('[data-cy=add-item-button]').click();
    }
    cy.get(`[data-cy=item-name-${index}]`).type(item.itemName);
    cy.get(`[data-cy=item-quantity-${index}]`).type(String(item.quantity));
    cy.get(`[data-cy=item-unit-price-${index}]`).type(String(item.unitPrice));
    cy.get(`[data-cy=item-tax-rate-${index}]`).select(String(item.taxRate));
  });
};

/**
 * 取引先データの作成ヘルパー
 */
export const createTestVendor = (params = {}) => {
  loadTestData.vendor('validVendors.0').then((defaultVendor) => {
    const vendor = { ...defaultVendor, ...params };

    cy.get('[data-cy=vendor-name]').type(vendor.name);
    cy.get('[data-cy=vendor-registration-number]').type(vendor.registrationNumber);
    cy.get('[data-cy=vendor-email]').type(vendor.email);
    cy.get('[data-cy=vendor-phone]').type(vendor.phone);
    cy.get('[data-cy=vendor-postal-code]').type(vendor.address.postalCode);
    cy.get('[data-cy=vendor-prefecture]').type(vendor.address.prefecture);
    cy.get('[data-cy=vendor-city]').type(vendor.address.city);
    cy.get('[data-cy=vendor-street]').type(vendor.address.street);
    if (vendor.address.building) {
      cy.get('[data-cy=vendor-building]').type(vendor.address.building);
    }
  });
};

/**
 * エラーメッセージの検証ヘルパー
 */
export const assertErrorMessage = (fieldName: string, message: string) => {
  cy.get(`[data-cy=${fieldName}-error]`)
    .should('be.visible')
    .and('contain', message);
};

/**
 * 税率計算の検証ヘルパー
 */
export const assertTaxCalculation = ({
  subtotal,
  taxRate,
  expectedTotal
}: {
  subtotal: number;
  taxRate: number;
  expectedTotal: number;
}) => {
  const formattedSubtotal = new Intl.NumberFormat('ja-JP').format(subtotal);
  const formattedTotal = new Intl.NumberFormat('ja-JP').format(expectedTotal);
  
  cy.get(`[data-cy=tax-rate-${taxRate * 100}-subtotal]`)
    .should('contain', formattedSubtotal);
  cy.get('[data-cy=total-amount]')
    .should('contain', formattedTotal);
};

/**
 * ページネーションの検証ヘルパー
 */
export const assertPagination = (totalItems: number, itemsPerPage: number) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // 総件数の確認
  cy.get('[data-cy=total-count]')
    .should('contain', String(totalItems));
  
  // 1ページ目の表示件数確認
  cy.get('[data-cy=invoice-list-item]')
    .should('have.length', Math.min(itemsPerPage, totalItems));
  
  if (totalPages > 1) {
    // 2ページ目に移動して確認
    cy.get('[data-cy=pagination-next]').click();
    cy.get('[data-cy=current-page]').should('contain', '2');
    cy.get('[data-cy=invoice-list-item]').should('exist');
  }
}; 