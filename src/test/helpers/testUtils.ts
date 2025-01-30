import { vi } from 'vitest'
import { screen } from '@testing-library/react'

// モック関数のリセット
export const resetMocks = () => {
  vi.clearAllMocks()
  vi.resetModules()
}

// 要素の存在チェック
export const expectElementToExist = (testId: string) => {
  const element = screen.getByTestId(testId)
  expect(element).toBeInTheDocument()
  return element
}

// 要素の非存在チェック
export const expectElementNotToExist = (testId: string) => {
  expect(screen.queryByTestId(testId)).not.toBeInTheDocument()
}

// テキストの存在チェック
export const expectTextToExist = (text: string) => {
  const element = screen.getByText(text)
  expect(element).toBeInTheDocument()
  return element
}

// ボタンの存在チェック
export const expectButtonToExist = (name: string) => {
  const button = screen.getByRole('button', { name })
  expect(button).toBeInTheDocument()
  return button
}

// フォーム要素の存在チェック
export const expectFormElementToExist = (label: string) => {
  const element = screen.getByLabelText(label)
  expect(element).toBeInTheDocument()
  return element
}

// エラーメッセージの存在チェック
export const expectErrorToExist = (message: string) => {
  const error = screen.getByText(message)
  expect(error).toBeInTheDocument()
  expect(error).toHaveAttribute('role', 'alert')
  return error
}

// ローディング状態のチェック
export const expectLoadingToExist = () => {
  const loading = screen.getByRole('progressbar')
  expect(loading).toBeInTheDocument()
  return loading
}

// 非同期更新の待機
export const waitForElementUpdate = async (callback: () => Promise<void> | void) => {
  await callback()
  // DOMの更新を待機
  await screen.findByRole('generic')
}

// フォームの送信チェック
export const expectFormSubmission = async (
  formElement: HTMLFormElement,
  onSubmit: () => Promise<void>
) => {
  const submitButton = formElement.querySelector('button[type="submit"]')
  expect(submitButton).toBeInTheDocument()

  // 送信前の状態チェック
  expect(submitButton).not.toBeDisabled()
  expect(submitButton).not.toHaveAttribute('aria-busy')

  // フォーム送信
  await onSubmit()

  // 送信後の状態チェック
  expect(submitButton).toBeDisabled()
  expect(submitButton).toHaveAttribute('aria-busy', 'true')
}

// モーダルの表示チェック
export const expectModalToBeOpen = (title: string) => {
  const dialog = screen.getByRole('dialog')
  expect(dialog).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: title })).toBeInTheDocument()
  return dialog
}

// テーブルのセルチェック
export const expectTableCell = (rowName: string, columnName: string, value: string) => {
  const cell = screen.getByRole('cell', { name: value })
  expect(cell).toBeInTheDocument()
  expect(cell).toHaveAttribute('data-row', rowName)
  expect(cell).toHaveAttribute('data-column', columnName)
  return cell
}

// 画像の表示チェック
export const expectImageToLoad = async (altText: string) => {
  const image = screen.getByAltText(altText) as HTMLImageElement
  expect(image).toBeInTheDocument()
  // 画像の読み込み完了を待機
  await new Promise((resolve) => {
    if (image.complete) {
      resolve(undefined)
    } else {
      image.onload = () => resolve(undefined)
    }
  })
  return image
}

// ナビゲーションのチェック
export const expectNavigation = (path: string) => {
  expect(window.location.pathname).toBe(path)
}

// APIエラーのチェック
export const expectApiError = async (callback: () => Promise<void>, expectedError: string) => {
  try {
    await callback()
    throw new Error('Expected API call to fail')
  } catch (error) {
    expect(error).toBeInstanceOf(Error)
    expect((error as Error).message).toBe(expectedError)
  }
} 