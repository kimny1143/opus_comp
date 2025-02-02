import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InvoicePreviewModal } from '../InvoicePreviewModal';
import { QualifiedInvoice } from '@/types/invoice';
import { ItemCategory } from '@/types/itemCategory';
import { Prisma } from '@prisma/client';

// PDFKitのモック
vi.mock('pdfkit', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      on: vi.fn().mockReturnThis(),
      registerFont: vi.fn().mockReturnThis(),
      font: vi.fn().mockReturnThis(),
      fontSize: vi.fn().mockReturnThis(),
      text: vi.fn().mockReturnThis(),
      moveDown: vi.fn().mockReturnThis(),
      image: vi.fn().mockReturnThis(),
      moveTo: vi.fn().mockReturnThis(),
      lineTo: vi.fn().mockReturnThis(),
      stroke: vi.fn().mockReturnThis(),
      rect: vi.fn().mockReturnThis(),
      fillColor: vi.fn().mockReturnThis(),
      end: vi.fn(),
      y: 0
    }))
  };
});

describe('InvoicePreviewModal', () => {
  const mockInvoice: QualifiedInvoice = {
    id: '1',
    invoiceNumber: 'INV-001',
    issueDate: new Date('2025-02-01'),
    dueDate: new Date('2025-02-28'),
    status: 'DRAFT',
    notes: 'テスト用請求書',
    vendorId: '1',
    vendor: {
      id: '1',
      name: 'テスト取引先',
      address: '東京都渋谷区...',
      registrationNumber: 'T1234567890123'
    },
    issuer: {
      id: '1',
      name: 'テスト発行者',
      email: 'issuer@example.com',
      registrationNumber: 'T9876543210123',
      address: '東京都千代田区...'
    },
    taxSummary: {
      byRate: [{
        rate: 10,
        taxableAmount: '2000',
        taxAmount: '200'
      }],
      totalTaxableAmount: '2000',
      totalTaxAmount: '200'
    },
    items: [
      {
        id: '1',
        invoiceId: '1',
        itemName: 'テスト商品1',
        quantity: 2,
        unitPrice: '1000',
        taxRate: 10,
        description: '商品の説明1',
        taxAmount: 200,
        taxableAmount: 2000
      }
    ],
    totalAmount: '2200',
    templateId: null,
    purchaseOrderId: null,
    bankInfo: null,
    template: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdById: '1',
    updatedById: '1',
    sentAt: null,
    paidAt: null,
    canceledAt: null
  } as QualifiedInvoice;

  const mockCompanyInfo = {
    name: 'テスト株式会社',
    postalCode: '123-4567',
    address: '東京都千代田区...',
    tel: '03-1234-5678',
    email: 'test@example.com',
    registrationNumber: 'T9876543210123'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // URLオブジェクトのモック
    global.URL.createObjectURL = vi.fn(() => 'mock-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  it('should render modal with loading state initially', () => {
    render(
      <InvoicePreviewModal
        open={true}
        onClose={() => {}}
        invoice={mockInvoice}
        companyInfo={mockCompanyInfo}
      />
    );

    expect(screen.getByText('PDFを生成中...')).toBeInTheDocument();
  });

  it('should show PDF preview after generation', async () => {
    render(
      <InvoicePreviewModal
        open={true}
        onClose={() => {}}
        invoice={mockInvoice}
        companyInfo={mockCompanyInfo}
      />
    );

    await waitFor(() => {
      const iframe = screen.getByTitle('PDF Preview');
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute('src', 'mock-url');
    });
  });

  it('should enable download and print buttons after PDF generation', async () => {
    render(
      <InvoicePreviewModal
        open={true}
        onClose={() => {}}
        invoice={mockInvoice}
        companyInfo={mockCompanyInfo}
      />
    );

    await waitFor(() => {
      const downloadButton = screen.getByText('ダウンロード');
      const printButton = screen.getByText('印刷');
      expect(downloadButton).not.toBeDisabled();
      expect(printButton).not.toBeDisabled();
    });
  });

  it('should handle download button click', async () => {
    render(
      <InvoicePreviewModal
        open={true}
        onClose={() => {}}
        invoice={mockInvoice}
        companyInfo={mockCompanyInfo}
      />
    );

    await waitFor(() => {
      const downloadButton = screen.getByText('ダウンロード');
      expect(downloadButton).not.toBeDisabled();
    });

    const downloadButton = screen.getByText('ダウンロード');
    fireEvent.click(downloadButton);

    // ダウンロードリンクが作成されたことを確認
    expect(document.querySelector('a[download]')).toBeTruthy();
  });

  it('should handle close button click', () => {
    const onCloseMock = vi.fn();
    render(
      <InvoicePreviewModal
        open={true}
        onClose={onCloseMock}
        invoice={mockInvoice}
        companyInfo={mockCompanyInfo}
      />
    );

    const closeButton = screen.getByText('閉じる');
    fireEvent.click(closeButton);

    expect(onCloseMock).toHaveBeenCalled();
  });

  it('should cleanup URL object when modal is closed', async () => {
    const { rerender } = render(
      <InvoicePreviewModal
        open={true}
        onClose={() => {}}
        invoice={mockInvoice}
        companyInfo={mockCompanyInfo}
      />
    );

    await waitFor(() => {
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });

    rerender(
      <InvoicePreviewModal
        open={false}
        onClose={() => {}}
        invoice={mockInvoice}
        companyInfo={mockCompanyInfo}
      />
    );

    expect(global.URL.revokeObjectURL).toHaveBeenCalled();
  });
});