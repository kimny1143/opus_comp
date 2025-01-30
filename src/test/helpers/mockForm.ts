import { vi } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ZodError } from 'zod'

// フォームイベントのモック
export const mockFormEvent = (values: Record<string, unknown> = {}) => {
  return {
    preventDefault: vi.fn(),
    target: {
      elements: Object.entries(values).reduce((acc, [key, value]) => {
        acc[key] = { value }
        return acc
      }, {} as Record<string, { value: unknown }>),
    },
  }
}

// フォーム送信のモック
export const mockFormSubmit = <T>(onSubmit: (data: T) => Promise<void>) => {
  return {
    // 成功時の送信
    success: async (data: T) => {
      const handler = vi.fn().mockImplementation(() => onSubmit(data))
      await handler(mockFormEvent())
      expect(handler).toHaveBeenCalled()
    },
    // バリデーションエラー時の送信
    error: async (data: T, errors: ZodError) => {
      const handler = vi.fn().mockImplementation(() => {
        throw errors
      })
      await expect(handler(mockFormEvent())).rejects.toThrow(ZodError)
    },
  }
}

// フォーム入力のヘルパー
export const formUtils = {
  // テキスト入力
  async typeText(label: string, value: string) {
    const input = screen.getByLabelText(label)
    await userEvent.clear(input)
    await userEvent.type(input, value)
    return input
  },

  // セレクトボックス選択
  async selectOption(label: string, value: string) {
    const select = screen.getByLabelText(label)
    await userEvent.selectOptions(select, value)
    return select
  },

  // チェックボックス操作
  async toggleCheckbox(label: string) {
    const checkbox = screen.getByLabelText(label)
    await userEvent.click(checkbox)
    return checkbox
  },

  // ラジオボタン選択
  async selectRadio(label: string) {
    const radio = screen.getByLabelText(label)
    await userEvent.click(radio)
    return radio
  },

  // ファイル選択
  async uploadFile(label: string, file: File) {
    const input = screen.getByLabelText(label)
    await userEvent.upload(input, file)
    return input
  },

  // フォーム送信
  async submitForm(submitButtonText: string) {
    const button = screen.getByRole('button', { name: submitButtonText })
    await userEvent.click(button)
    return button
  },
}

// フォームのアサーション
export const expectForm = {
  // 入力値の確認
  toHaveValue: (label: string, value: string) => {
    const input = screen.getByLabelText(label)
    expect(input).toHaveValue(value)
  },

  // エラーメッセージの確認
  toHaveError: async (message: string) => {
    await waitFor(() => {
      const error = screen.getByRole('alert')
      expect(error).toHaveTextContent(message)
    })
  },

  // 送信ボタンの状態確認
  submitButton: {
    // 有効状態の確認
    toBeEnabled: (buttonText: string) => {
      const button = screen.getByRole('button', { name: buttonText })
      expect(button).toBeEnabled()
    },
    // 無効状態の確認
    toBeDisabled: (buttonText: string) => {
      const button = screen.getByRole('button', { name: buttonText })
      expect(button).toBeDisabled()
    },
    // ローディング状態の確認
    toBeLoading: (buttonText: string) => {
      const button = screen.getByRole('button', { name: buttonText })
      expect(button).toHaveAttribute('aria-busy', 'true')
    },
  },

  // バリデーションの確認
  validation: {
    // 必須フィールドの確認
    toBeRequired: (label: string) => {
      const input = screen.getByLabelText(label)
      expect(input).toBeRequired()
    },
    // パターンの確認
    toHavePattern: (label: string, pattern: string) => {
      const input = screen.getByLabelText(label)
      expect(input).toHaveAttribute('pattern', pattern)
    },
    // 最小長の確認
    toHaveMinLength: (label: string, length: number) => {
      const input = screen.getByLabelText(label)
      expect(input).toHaveAttribute('minLength', String(length))
    },
    // 最大長の確認
    toHaveMaxLength: (label: string, length: number) => {
      const input = screen.getByLabelText(label)
      expect(input).toHaveAttribute('maxLength', String(length))
    },
  },
}

// フォームリセットのヘルパー
export const resetForm = async (formElement: HTMLFormElement) => {
  fireEvent.reset(formElement)
  await waitFor(() => {
    const inputs = formElement.querySelectorAll('input, select, textarea')
    inputs.forEach((input) => {
      expect(input).toHaveValue('')
    })
  })
} 