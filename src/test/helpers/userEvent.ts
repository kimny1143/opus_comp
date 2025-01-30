import userEvent from '@testing-library/user-event'
import type { UserEvent } from '@testing-library/user-event'

// ユーザーイベントのセットアップ
export const setupUserEvent = (): UserEvent => {
  return userEvent.setup({
    // ポインターイベントを使用（タッチとマウスの両方をサポート）
    pointerEventsCheck: 0,
    // スクリーンリーダー用のARIAアナウンスを無効化
    skipHover: true,
    // 自動的にクリップボードをクリア
    writeToClipboard: true,
  })
}

// よく使うユーザーアクションのヘルパー
export const userActions = {
  // フォーム入力
  async typeIntoInput(user: UserEvent, element: HTMLElement, value: string) {
    await user.clear(element)
    await user.type(element, value)
  },

  // セレクトボックス選択
  async selectOption(user: UserEvent, element: HTMLElement, value: string) {
    await user.selectOptions(element, value)
  },

  // チェックボックス切り替え
  async toggleCheckbox(user: UserEvent, element: HTMLElement) {
    await user.click(element)
  },

  // ボタンクリック（loading状態のチェック付き）
  async clickButton(user: UserEvent, element: HTMLElement) {
    const isDisabled = element.hasAttribute('disabled')
    const isLoading = element.getAttribute('aria-busy') === 'true'

    if (!isDisabled && !isLoading) {
      await user.click(element)
    }
  },

  // ドロップダウンメニュー操作
  async selectDropdownItem(user: UserEvent, triggerElement: HTMLElement, itemElement: HTMLElement) {
    await user.click(triggerElement)
    await user.click(itemElement)
  },

  // ファイルアップロード
  async uploadFile(user: UserEvent, element: HTMLElement, file: File) {
    const input = element as HTMLInputElement
    await user.upload(input, file)
  },

  // フォーム送信
  async submitForm(user: UserEvent, formElement: HTMLFormElement) {
    await user.type(formElement.querySelector('input[type="submit"]') || formElement, '{enter}')
  },

  // キーボードショートカット
  async pressKey(user: UserEvent, element: HTMLElement, key: string) {
    await user.type(element, `{${key}}`)
  },

  // ドラッグ＆ドロップ
  async dragAndDrop(user: UserEvent, dragElement: HTMLElement, dropElement: HTMLElement) {
    await user.pointer([
      { target: dragElement },
      { keys: '[MouseLeft>]' },
      { target: dropElement },
      { keys: '[/MouseLeft]' },
    ])
  },
}

// エクスポート
export { userEvent }
export type { UserEvent } 