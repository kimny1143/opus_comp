import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { VendorForm } from '../VendorForm'
import { Tag } from '@/components/shared/form/schemas/commonSchema'
import { useTags } from '@/hooks/useTags'
import { act } from 'react'
import { expect, describe, it, beforeEach, vi } from 'vitest'

// タグ取得APIのモック
vi.mock('@/hooks/useTags')
const mockUseTags = useTags as jest.Mock

// fetchのモック
const mockFetch = vi.fn()
global.fetch = mockFetch

const mockTags: Tag[] = [
  { id: '1', name: 'テストタグ1' },
  { id: '2', name: 'テストタグ2' },
  { id: '3', name: 'テストタグ3' }
]

describe('VendorForm', () => {
  const mockOnSubmit = vi.fn()
  const mockInitialData = {
    category: 'CORPORATION' as const,
    status: 'ACTIVE' as const,
    name: 'テスト取引先',
    tags: [
      { id: '1', name: 'テストタグ1' },
      { id: '2', name: 'テストタグ2' }
    ],
    bankInfo: {
      accountType: 'ORDINARY' as const,
      bankName: 'テスト銀行',
      branchName: 'テスト支店',
      accountNumber: '1234567',
      accountHolder: 'テスト名義'
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseTags.mockReturnValue({
      data: mockTags,
      isLoading: false,
      error: null
    })

    mockFetch.mockResolvedValue({
      json: async () => ({
        success: true,
        tags: mockTags
      })
    })
  })

  it('初期データを正しく表示できる', async () => {
    await act(async () => {
      render(<VendorForm initialData={mockInitialData} onSubmit={mockOnSubmit} />)
    })
    
    await waitFor(() => {
      const selectedTags = screen.getAllByRole('button', { name: '削除' })
        .map(button => button.parentElement?.textContent?.replace('削除', ''))
      expect(selectedTags).toContain('テストタグ1')
      expect(selectedTags).toContain('テストタグ2')
      expect(selectedTags).toHaveLength(2)
    })
  })

  it('フォーム送信時にタグデータが正しく含まれている', async () => {
    render(<VendorForm initialData={mockInitialData} onSubmit={mockOnSubmit} />)
    
    const submitButton = screen.getByRole('button', { name: /保存/ })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
        tags: expect.arrayContaining([
          expect.objectContaining({ id: '2', name: 'テストタグ2' })
        ])
      }))
    })
  })

  it('readOnlyモードでフォームが正しく表示される', async () => {
    render(
      <VendorForm 
        initialData={mockInitialData} 
        onSubmit={mockOnSubmit} 
        readOnly={true} 
      />
    )

    const inputs = screen.getAllByRole('textbox')
    inputs.forEach(input => {
      expect(input).toBeDisabled()
    })

    const selects = screen.getAllByRole('combobox')
    selects.forEach(select => {
      expect(select).toBeDisabled()
    })
  })
}) 