import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InvoicePreviewModal } from '../InvoicePreviewModal';
import { createTestInvoice, createTestCompanyInfo } from '@/test/helpers/invoice';
import { convertToPdfInvoice } from '@/lib/pdf/utils';
import type { Mock } from 'vitest';

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

// PDF変換のモック
vi.mock('@/lib/pdf/utils', () => ({
  convertToPdfInvoice: vi.fn()
}));

describe('InvoicePreviewModal', () => {
  const mockInvoice = createTestInvoice();
  const mockCompanyInfo = createTestCompanyInfo();

  beforeEach(() => {
    vi.clearAllMocks();
    // URLオブジェクトのモック
    global.URL.createObjectURL = vi.fn(() => 'mock-url');
    global.URL.revokeObjectURL = vi.fn();
    // convertToPdfInvoiceのデフォルト動作を設定
    (convertToPdfInvoice as Mock).mockReturnValue({
      ...mockInvoice,
      items: mockInvoice.items.map(item => ({
        ...item,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate
      }))
    });
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

  it('should show error toast when PDF generation fails', async () => {
    (convertToPdfInvoice as Mock).mockReturnValue(null);

    render(
      <InvoicePreviewModal
        open={true}
        onClose={() => {}}
        invoice={mockInvoice}
        companyInfo={mockCompanyInfo}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('PDFの生成に失敗しました')).toBeInTheDocument();
      expect(screen.getByText('請求書データの変換に失敗しました')).toBeInTheDocument();
    });
  });

  it('should show error toast when print fails', async () => {
    render(
      <InvoicePreviewModal
        open={true}
        onClose={() => {}}
        invoice={mockInvoice}
        companyInfo={mockCompanyInfo}
      />
    );

    await waitFor(() => {
      const printButton = screen.getByText('印刷');
      expect(printButton).not.toBeDisabled();
    });

    // contentWindowをnullに設定してエラーを発生させる
    Object.defineProperty(HTMLIFrameElement.prototype, 'contentWindow', {
      value: null,
      writable: true
    });

    const printButton = screen.getByText('印刷');
    fireEvent.click(printButton);

    await waitFor(() => {
      expect(screen.getByText('印刷の準備に失敗しました')).toBeInTheDocument();
      expect(screen.getByText('印刷用ウィンドウの作成に失敗しました')).toBeInTheDocument();
    });
  });
});