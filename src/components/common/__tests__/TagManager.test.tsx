/// <reference types="@testing-library/jest-dom" />

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TagManager } from '../TagManager'
import { useTags } from '@/hooks/useTags'
import { describe, it, expect, vi, Mock, afterEach } from 'vitest'
import { TagFormData } from '@/types/tag'

// モックの設定
vi.mock('@/hooks/useTags')

const mockUseTags = vi.mocked(useTags)

describe('TagManager', () => {
  const defaultProps = {
    selectedTags: [],
    onTagsChange: vi.fn(),
    entityType: 'invoice',
    entityId: '1'
  }

  beforeEach(() => {
    mockUseTags.mockReturnValue({
      tags: [],
      addTag: vi.fn(),
      removeTag: vi.fn(),
      isLoading: false,
      error: null,
      setTags: vi.fn(),
      updateTags: vi.fn()
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('タグを追加できること', async () => {
    const mockAddTag = vi.fn().mockResolvedValue({ id: '1', name: 'テストタグ' })
    mockUseTags.mockReturnValue({
      tags: [],
      addTag: mockAddTag,
      removeTag: vi.fn(),
      isLoading: false,
      error: null,
      setTags: vi.fn(),
      updateTags: vi.fn()
    })

    render(<TagManager {...defaultProps} />)

    const input = screen.getByPlaceholderText('タグを追加...')
    await userEvent.type(input, 'テストタグ{enter}')

    expect(mockAddTag).toHaveBeenCalledWith('テストタグ')
  })

  it('タグを削除できること', async () => {
    const mockRemoveTag = vi.fn()
    mockUseTags.mockReturnValue({
      tags: [{ id: '1', name: 'テストタグ' }],
      addTag: vi.fn(),
      removeTag: mockRemoveTag,
      isLoading: false,
      error: null,
      setTags: vi.fn(),
      updateTags: vi.fn()
    })

    render(<TagManager {...defaultProps} selectedTags={[{ id: '1', name: 'テストタグ' }]} />)

    const deleteButton = screen.getByLabelText('削除')
    await userEvent.click(deleteButton)

    expect(defaultProps.onTagsChange).toHaveBeenCalledWith([])
  })

  it('エラーメッセージが表示されること', () => {
    mockUseTags.mockReturnValue({
      tags: [],
      addTag: vi.fn(),
      removeTag: vi.fn(),
      isLoading: false,
      error: 'エラーが発生しました',
      setTags: vi.fn(),
      updateTags: vi.fn()
    })

    render(<TagManager {...defaultProps} />)

    expect(screen.getByText('エラーが発生しました')).toBeInTheDocument()
  })

  it('読み取り専用モードで削除ボタンが表示されないこと', () => {
    mockUseTags.mockReturnValue({
      tags: [{ id: '1', name: 'テストタグ' }],
      addTag: vi.fn(),
      removeTag: vi.fn(),
      isLoading: false,
      error: null,
      setTags: vi.fn(),
      updateTags: vi.fn()
    })

    render(<TagManager {...defaultProps} selectedTags={[{ id: '1', name: 'テストタグ' }]} readOnly />)

    expect(screen.queryByLabelText('削除')).not.toBeInTheDocument()
  })
}) 