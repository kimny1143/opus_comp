import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, expect } from 'vitest'
import '@testing-library/jest-dom'
import { InvoiceForm } from '../InvoiceForm'
import { InvoiceStatus, Prisma } from '@prisma/client'
import { AccountType } from '@/types/bankAccount'

// モックデータ
const mockInitialData = {
  status: InvoiceStatus.DRAFT,
  issueDate: new Date('2025-02-01'),
  dueDate: new Date('2025-03-01'),
  items: [
    {
      itemName: 'テスト商品',
      quantity: 1,
      unitPrice: new Prisma.Decimal(1000),
      taxRate: new Prisma.Decimal(0.1),
      description: 'テスト説明'
    }
  ],
  bankInfo: {
    accountType: AccountType.ORDINARY,
    bankName: 'テスト銀行',
    branchName: 'テスト支店',
    accountNumber: '1234567',
    accountHolder: 'テスト太郎'
  },
  notes: 'テスト備考',
  vendorId: 'test-vendor-id',
  tags: [{ name: 'テストタグ' }],
  registrationNumber: 'T1234567890123'
}

const mockOnSubmit = vi.fn()

describe('InvoiceForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('初期表示時に必要なフィールドが表示されること', () => {
    render(<InvoiceForm onSubmit={mockOnSubmit} />)

    // 必須フィールドの存在確認
    expect(screen.getByLabelText(/ステータス/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/発行日/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/支払期限/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/登録番号/i)).toBeInTheDocument()
  })

  it('登録番号のバリデーションが正しく機能すること', async () => {
    render(<InvoiceForm onSubmit={mockOnSubmit} />)
    
    const registrationNumberInput = screen.getByLabelText(/登録番号/i)

    // 不正な形式
    await userEvent.type(registrationNumberInput, 'invalid')
    fireEvent.blur(registrationNumberInput)
    
    await waitFor(() => {
      expect(screen.getByText(/登録番号はTで始まる13桁の数字である必要があります/i)).toBeInTheDocument()
    })

    // 正しい形式
    await userEvent.clear(registrationNumberInput)
    await userEvent.type(registrationNumberInput, 'T1234567890123')
    fireEvent.blur(registrationNumberInput)
    
    await waitFor(() => {
      expect(screen.queryByText(/登録番号はTで始まる13桁の数字である必要があります/i)).not.toBeInTheDocument()
    })
  })

  it('品目の税率選択が正しく機能すること', async () => {
    render(<InvoiceForm onSubmit={mockOnSubmit} />)

    // 初期値が10%であることを確認
    const taxRateSelect = screen.getByLabelText(/税率/i)
    expect(taxRateSelect).toHaveValue('0.1')

    // 8%を選択
    await userEvent.selectOptions(taxRateSelect, '0.08')
    expect(taxRateSelect).toHaveValue('0.08')

    // 軽減税率の説明が表示されることを確認
    expect(screen.getByText(/飲食料品\(酒類を除く\)/i)).toBeInTheDocument()
    expect(screen.getByText(/週2回以上発行される新聞\(定期購読\)/i)).toBeInTheDocument()

    // 10%に戻す
    await userEvent.selectOptions(taxRateSelect, '0.1')
    expect(taxRateSelect).toHaveValue('0.1')
  })

  it('品目の追加・削除が正しく機能すること', async () => {
    render(<InvoiceForm onSubmit={mockOnSubmit} />)

    // 品目追加ボタンをクリック
    const addButton = screen.getByRole('button', { name: '品目を追加' })
    await userEvent.click(addButton)

    // 品目が追加されたことを確認
    const itemRows = screen.getAllByTestId('cy=item-row')
    expect(itemRows).toHaveLength(2)

    // 削除ボタンをクリック
    const deleteButtons = screen.getAllByRole('button', { name: '削除' })
    await userEvent.click(deleteButtons[1])

    // 品目が削除されたことを確認
    await waitFor(() => {
      const updatedItemRows = screen.getAllByTestId('cy=item-row')
      expect(updatedItemRows).toHaveLength(1)
    })
  })

  it('Decimal型の金額が正しく処理されること', async () => {
    const decimalInitialData = {
      ...mockInitialData,
      items: [{
        itemName: 'Decimal型テスト',
        quantity: 2,
        unitPrice: new Prisma.Decimal(1500.50),
        taxRate: new Prisma.Decimal(0.08),
        description: 'Decimal型の金額テスト'
      }]
    }

    render(<InvoiceForm onSubmit={mockOnSubmit} initialData={decimalInitialData} />)

    // 初期表示時の金額確認(Decimal型から正しく変換されていることを確認)
    await waitFor(() => {
      expect(screen.getByTestId('cy=subtotal')).toHaveTextContent('¥3,001')
      expect(screen.getByTestId('cy=tax')).toHaveTextContent('¥240')
      expect(screen.getByTestId('cy=total')).toHaveTextContent('¥3,241')
    })

    // フォーム送信時のデータ確認
    const submitButton = screen.getByText('保存')
    await userEvent.click(submitButton)

    await waitFor(() => {
      const submittedData = mockOnSubmit.mock.calls[0][0]
      expect(submittedData.items[0].unitPrice).toBeInstanceOf(Prisma.Decimal)
      expect(submittedData.items[0].taxRate).toBeInstanceOf(Prisma.Decimal)
      expect(submittedData.items[0].unitPrice.toString()).toBe('1500.50')
      expect(submittedData.items[0].taxRate.toString()).toBe('0.08')
    })
  })

  it('税率変更時に金額計算が正しく行われること', async () => {
    render(<InvoiceForm onSubmit={mockOnSubmit} initialData={mockInitialData} />)

    // 初期表示時の金額確認(10%)
    expect(screen.getByTestId('cy=subtotal')).toHaveTextContent('¥1,000')
    expect(screen.getByTestId('cy=tax')).toHaveTextContent('¥100')
    expect(screen.getByTestId('cy=total')).toHaveTextContent('¥1,100')

    // 税率を8%に変更
    const taxRateSelect = screen.getByLabelText(/税率/i)
    await userEvent.selectOptions(taxRateSelect, '0.08')

    // 金額が更新されることを確認
    await waitFor(() => {
      expect(screen.getByTestId('cy=subtotal')).toHaveTextContent('¥1,000')
      expect(screen.getByTestId('cy=tax')).toHaveTextContent('¥80')
      expect(screen.getByTestId('cy=total')).toHaveTextContent('¥1,080')
    })

    // 税率を10%に戻す
    await userEvent.selectOptions(taxRateSelect, '0.1')

    // 金額が元に戻ることを確認
    await waitFor(() => {
      expect(screen.getByTestId('cy=subtotal')).toHaveTextContent('¥1,000')
      expect(screen.getByTestId('cy=tax')).toHaveTextContent('¥100')
      expect(screen.getByTestId('cy=total')).toHaveTextContent('¥1,100')
    })
  })

  it('金額計算が正しく行われること', async () => {
    render(<InvoiceForm onSubmit={mockOnSubmit} initialData={mockInitialData} />)

    // 初期表示時の金額確認
    expect(screen.getByTestId('cy=subtotal')).toHaveTextContent('¥1,000')
    expect(screen.getByTestId('cy=tax')).toHaveTextContent('¥100')
    expect(screen.getByTestId('cy=total')).toHaveTextContent('¥1,100')

    // 数量を変更
    const quantityInput = screen.getByTestId('cy=item-quantity')
    await userEvent.clear(quantityInput)
    await userEvent.type(quantityInput, '2')

    // 金額が更新されることを確認
    await waitFor(() => {
      expect(screen.getByTestId('cy=subtotal')).toHaveTextContent('¥2,000')
      expect(screen.getByTestId('cy=tax')).toHaveTextContent('¥200')
      expect(screen.getByTestId('cy=total')).toHaveTextContent('¥2,200')
    })
  })

  it('フォームが正しく送信されること', async () => {
    render(<InvoiceForm onSubmit={mockOnSubmit} initialData={mockInitialData} />)

    // フォーム送信
    const submitButton = screen.getByText('保存')
    await userEvent.click(submitButton)

    // onSubmitが呼ばれたことを確認
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1)
    })

    // 送信されたデータの確認
    const submittedData = mockOnSubmit.mock.calls[0][0]
    expect(submittedData).toMatchObject({
      status: InvoiceStatus.DRAFT,
      items: expect.arrayContaining([
        expect.objectContaining({
          itemName: 'テスト商品',
          quantity: 1,
          unitPrice: expect.any(Prisma.Decimal),
          taxRate: expect.any(Prisma.Decimal)
        })
      ]),
      registrationNumber: 'T1234567890123'
    })
  })
})