/// <reference types="@testing-library/jest-dom" />

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Tag } from '../Tag'

describe('Tag', () => {
  const mockTag = {
    id: '1',
    name: 'テストタグ',
    createdAt: new Date(),
    updatedAt: new Date()
  }

  it('タグ名が正しく表示される', () => {
    render(<Tag tag={mockTag} />)
    expect(screen.getByText('テストタグ')).toBeInTheDocument()
  })

  it('削除ボタンが表示されない（onDelete未指定時）', () => {
    render(<Tag tag={mockTag} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('削除ボタンが表示され、クリックで削除関数が呼ばれる', () => {
    const onDelete = vi.fn()
    render(<Tag tag={mockTag} onDelete={onDelete} />)
    
    const deleteButton = screen.getByRole('button')
    expect(deleteButton).toBeInTheDocument()
    
    fireEvent.click(deleteButton)
    expect(onDelete).toHaveBeenCalledWith(mockTag)
  })

  it('サイズに応じて適切なスタイルが適用される', () => {
    const { rerender } = render(<Tag tag={mockTag} size="sm" />)
    const tag = screen.getByText('テストタグ').parentElement
    expect(tag).toHaveClass('text-xs px-2 py-0.5')

    rerender(<Tag tag={mockTag} size="md" />)
    expect(tag).not.toHaveClass('text-xs px-2 py-0.5')
  })

  it('カスタムクラス名が適用される', () => {
    render(<Tag tag={mockTag} className="custom-class" />)
    const tag = screen.getByText('テストタグ').parentElement
    expect(tag).toHaveClass('custom-class')
  })
}) 