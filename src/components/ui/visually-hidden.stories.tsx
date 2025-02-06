import type { Meta, StoryObj } from '@storybook/react'
import { VisuallyHidden } from './visually-hidden'

const meta = {
  title: 'UI/VisuallyHidden',
  component: VisuallyHidden,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
          VisuallyHiddenコンポーネントは、視覚的には非表示ですが、
          スクリーンリーダーには読み上げられる要素を作成します。
          アクセシビリティ対応のために使用します。
        `,
      },
    },
    a11y: {
      config: {
        rules: [
          {
            id: 'aria-hidden-focus',
            enabled: true,
          },
        ],
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof VisuallyHidden>

export default meta
type Story = StoryObj<typeof VisuallyHidden>

export const Default: Story = {
  args: {
    children: 'このテキストは視覚的には非表示ですが、スクリーンリーダーには読み上げられます。',
  },
  parameters: {
    docs: {
      description: {
        story: `
          このストーリーは、スクリーンリーダーでの動作確認用です。
          VoiceOver(Mac)やNVDA(Windows)などのスクリーンリーダーを使用して、
          テキストが正しく読み上げられることを確認できます。
        `,
      },
    },
  },
}

export const WithButton: Story = {
  render: () => (
    <button>
      <VisuallyHidden>メニューを開く</VisuallyHidden>
      <span aria-hidden="true">☰</span>
    </button>
  ),
  parameters: {
    docs: {
      description: {
        story: `
          アイコンボタンなどで、視覚的なアイコンとスクリーンリーダー用のテキストを
          組み合わせて使用する例です。視覚的にはハンバーガーメニューのアイコンが
          表示されますが、スクリーンリーダーには「メニューを開く」と読み上げられます。
        `,
      },
    },
  },
}

export const WithFormLabel: Story = {
  render: () => (
    <div>
      <label>
        <VisuallyHidden>メールアドレス</VisuallyHidden>
        <input
          type="email"
          placeholder="example@example.com"
          aria-label="メールアドレス"
        />
      </label>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: `
          フォームのラベルを視覚的に非表示にする例です。
          プレースホルダーテキストで視覚的な説明を提供しつつ、
          スクリーンリーダーユーザーにも適切なラベルを提供します。
        `,
      },
    },
  },
}

export const WithAnnouncement: Story = {
  render: () => (
    <div>
      <button onClick={() => alert('保存しました')}>保存</button>
      <VisuallyHidden role="status" aria-live="polite">
        変更が保存されました
      </VisuallyHidden>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: `
          動的な通知をスクリーンリーダーに伝える例です。
          aria-liveを使用することで、コンテンツの変更を
          スクリーンリーダーユーザーに通知します。
        `,
      },
    },
  },
}