/// <reference types="cypress" />
// @ts-check

import { format } from 'date-fns';

describe('請求書フロー', () => {
  beforeEach(() => {
    cy.log('テストセッションのセットアップを開始');
    cy.setupTestSession();
  });

  it('請求書の作成と編集', () => {
    cy.log('請求書作成テストを開始');
    // Click create new invoice button
    cy.get('[data-cy=create-invoice-btn]').click();
    
    // Fill invoice form
    cy.get('[data-cy=invoice-title]').type('Test Invoice');
    cy.get('[data-cy=invoice-amount]').type('1000');
    cy.get('[data-cy=invoice-date]').type(format(new Date(), 'yyyy-MM-dd'));
    
    // Submit form
    cy.get('[data-cy=submit-invoice]').click();
    
    // Assert invoice was created
    cy.get('[data-cy=invoice-list]')
      .should('contain', 'Test Invoice')
      .and('contain', '1000');
  });

  it('should edit existing invoice', () => {
    // Create test invoice via API
    cy.createInvoice({
      title: 'Invoice to Edit',
      amount: 500,
      status: 'DRAFT'
    });
    
    cy.visit('/invoices', { failOnStatusCode: false });
    cy.url().should('include', '/invoices');
    
    // Edit invoice
    cy.get('[data-cy=edit-invoice-btn]').first().click();
    cy.get('[data-cy=invoice-title]').clear().type('Updated Invoice');
    cy.get('[data-cy=submit-invoice]').click();
    
    // Assert changes
    cy.get('[data-cy=invoice-list]')
      .should('contain', 'Updated Invoice');
  });

  it('should delete invoice', () => {
    // Create test invoice via API
    cy.createInvoice({
      title: 'Invoice to Delete',
      amount: 300,
      status: 'DRAFT'
    });
    
    cy.visit('/invoices', { failOnStatusCode: false });
    cy.url().should('include', '/invoices');
    
    // Delete invoice
    cy.get('[data-cy=delete-invoice-btn]').first().click();
    cy.get('[data-cy=confirm-delete]').click();
    
    // Assert invoice was deleted
    cy.get('[data-cy=invoice-list]')
      .should('not.contain', 'Invoice to Delete');
  });

  it('should show validation errors for required fields', () => {
    cy.visit('/invoices', { failOnStatusCode: false });
    cy.url().should('include', '/invoices');
    
    cy.get('[data-cy=create-invoice-btn]').click();
    
    // Submit empty form
    cy.get('[data-cy=submit-invoice]').click();
    
    // Assert validation messages
    cy.get('[data-cy=invoice-title-error]')
      .should('be.visible')
      .and('contain', '必須項目です');
    cy.get('[data-cy=invoice-amount-error]')
      .should('be.visible')
      .and('contain', '必須項目です');
    cy.get('[data-cy=invoice-date-error]')
      .should('be.visible')
      .and('contain', '必須項目です');
  });

  it('should show error for invalid amount', () => {
    cy.visit('/invoices', { failOnStatusCode: false });
    cy.url().should('include', '/invoices');
    
    cy.get('[data-cy=create-invoice-btn]').click();
    
    // Enter invalid amount
    cy.get('[data-cy=invoice-title]').type('Test Invoice');
    cy.get('[data-cy=invoice-amount]').type('-1000');
    cy.get('[data-cy=invoice-date]').type(format(new Date(), 'yyyy-MM-dd'));
    
    cy.get('[data-cy=submit-invoice]').click();
    
    // Assert error message
    cy.get('[data-cy=invoice-amount-error]')
      .should('be.visible')
      .and('contain', '金額は0以上の数値を入力してください');
  });

  it('should handle unauthorized access', () => {
    // セッションをクリア
    cy.session('anonymous', () => {
      cy.clearCookies()
      cy.clearLocalStorage()
    })

    // 請求書ページへのアクセス試行
    cy.visit('/invoices', { failOnStatusCode: false })

    // ログインページへリダイレクトされることを確認
    cy.url().should('include', '/login')
    cy.get('[data-cy=login-required-message]')
      .should('be.visible')
      .and('contain', 'ログインが必要です')
  });
});