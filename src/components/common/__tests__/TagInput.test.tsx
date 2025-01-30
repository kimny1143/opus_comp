/// <reference types="@testing-library/jest-dom" />

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TagInput } from '../TagInput'

describe('TagInput', () => {
  const mockTags = [
    {
      id: '1',
      name: 'タグ1',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      name: 'タグ2',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]

  const mockOnAdd = vi.fn()
  const mockOnDelete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('既存のタグが正しく表示される', () => {
    render(
      <TagInput
        tags={mockTags}
        onAdd={mockOnAdd}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByText('タグ1')).toBeInTheDocument()
    expect(screen.getByText('タグ2')).toBeInTheDocument()
  })

  it('新しいタグを追加できる（フォーム送信）', async () => {
    render(
      <TagInput
        tags={mockTags}
        onAdd={mockOnAdd}
        onDelete={mockOnDelete}
        placeholder="タグを入力"
      />
    )

    const input = screen.getByPlaceholderText('タグを入力')
    const submitButton = screen.getByTestId('add-tag-button')

    await userEvent.type(input, '新しいタグ')
    fireEvent.click(submitButton)

    expect(mockOnAdd).toHaveBeenCalledWith('新しいタグ')
  })

  it('新しいタグを追加できる（Enterキー）', async () => {
    render(
      <TagInput
        tags={mockTags}
        onAdd={mockOnAdd}
        onDelete={mockOnDelete}
        placeholder="タグを入力"
      />
    )

    const input = screen.getByPlaceholderText('タグを入力')
    await userEvent.type(input, '新しいタグ{enter}')

    expect(mockOnAdd).toHaveBeenCalledWith('新しいタグ')
  })

  it('空のタグは追加できない', () => {
    render(
      <TagInput
        tags={mockTags}
        onAdd={mockOnAdd}
        onDelete={mockOnDelete}
        placeholder="タグを入力"
      />
    )

    const submitButton = screen.getByTestId('add-tag-button')
    fireEvent.click(submitButton)

    expect(mockOnAdd).not.toHaveBeenCalled()
  })

  it('タグを削除できる', () => {
    render(
      <TagInput
        tags={mockTags}
        onAdd={mockOnAdd}
        onDelete={mockOnDelete}
        placeholder="タグを入力"
      />
    )

    const deleteButtons = screen.getAllByTestId('delete-tag-button')
    fireEvent.click(deleteButtons[0])

    expect(mockOnDelete).toHaveBeenCalledWith(mockTags[0])
  })

  it('disabled状態では入力と追加が無効化される', () => {
    render(
      <TagInput
        tags={mockTags}
        onAdd={mockOnAdd}
        onDelete={mockOnDelete}
        placeholder="タグを入力"
        disabled
      />
    )

    const input = screen.getByPlaceholderText('タグを入力')
    const submitButton = screen.getByTestId('add-tag-button')

    expect(input).toBeDisabled()
    expect(submitButton).toBeDisabled()
  })

  it('カスタムプレースホルダーが表示される', () => {
    render(
      <TagInput
        tags={mockTags}
        onAdd={mockOnAdd}
        onDelete={mockOnDelete}
        placeholder="カスタムプレースホルダー"
      />
    )

    expect(screen.getByPlaceholderText('カスタムプレースホルダー')).toBeInTheDocument()
  })
}) 