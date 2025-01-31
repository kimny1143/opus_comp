import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { VendorList } from '../VendorList'
import { VendorCategory, VendorStatus } from '@prisma/client'

const mockVendors = [
  {
    id: '1',
    name: 'テスト株式会社',
    category: VendorCategory.CORPORATION,
    code: 'TEST001',
    status: VendorStatus.ACTIVE,
    email: 'test@example.com',
    phone: '03-1234-5678',
    updatedAt: new Date('2025-01-31'),
    tags: ['システム開発', 'IT'],
    createdBy: { name: '作成者' },
    updatedBy: { name: '更新者' }
  },
  {
    id: '2',
    name: '山田商事',
    category: VendorCategory.CORPORATION,
    code: 'TEST002',
    status: VendorStatus.INACTIVE,
    email: 'yamada@example.com',
    phone: '03-8765-4321',
    updatedAt: new Date('2025-01-30'),
    tags: ['物品調達'],
    createdBy: { name: '作成者' },
    updatedBy: { name: '更新者' }
  }
]

describe('VendorList', () => {
  it('取引先一覧を表示できる', () => {
    render(<VendorList vendors={mockVendors} />)
    
    expect(screen.getByText('テスト株式会社')).toBeInTheDocument()
    expect(screen.getByText('山田商事')).toBeInTheDocument()
  })

  it('キーワード検索でフィルタリングできる', () => {
    render(<VendorList vendors={mockVendors} />)
    
    const searchInput = screen.getByPlaceholderText('取引先名・コードで検索...')
    fireEvent.change(searchInput, { target: { value: 'テスト' } })

    expect(screen.getByText('テスト株式会社')).toBeInTheDocument()
    expect(screen.queryByText('山田商事')).not.toBeInTheDocument()
  })

  it('区分でフィルタリングできる', () => {
    render(<VendorList vendors={mockVendors} />)
    
    const categorySelect = screen.getByRole('combobox', { name: /区分/i })
    fireEvent.change(categorySelect, { target: { value: VendorCategory.CORPORATION } })

    expect(screen.getByText('テスト株式会社')).toBeInTheDocument()
    expect(screen.getByText('山田商事')).toBeInTheDocument()
  })

  it('ステータスでフィルタリングできる', () => {
    render(<VendorList vendors={mockVendors} />)
    
    const statusSelect = screen.getByRole('combobox', { name: /ステータス/i })
    fireEvent.change(statusSelect, { target: { value: VendorStatus.ACTIVE } })

    expect(screen.getByText('テスト株式会社')).toBeInTheDocument()
    expect(screen.queryByText('山田商事')).not.toBeInTheDocument()
  })

  it('タグでフィルタリングできる', () => {
    render(<VendorList vendors={mockVendors} />)
    
    const tagInput = screen.getByRole('textbox', { name: /タグ/i })
    fireEvent.change(tagInput, { target: { value: 'IT' } })
    fireEvent.keyDown(tagInput, { key: 'Enter' })

    expect(screen.getByText('テスト株式会社')).toBeInTheDocument()
    expect(screen.queryByText('山田商事')).not.toBeInTheDocument()
  })

  it('表示モードを切り替えできる', () => {
    render(<VendorList vendors={mockVendors} />)
    
    // デフォルトはリスト表示
    expect(screen.getByRole('table')).toBeInTheDocument()

    // グリッド表示に切り替え
    const gridButton = screen.getByRole('button', { name: /grid/i })
    fireEvent.click(gridButton)

    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(2)
  })
})