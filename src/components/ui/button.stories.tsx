import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'アクセシビリティに配慮した汎用的なボタンコンポーネント。',
      },
    },
    a11y: {
      config: {
        rules: [
          {
            id: 'button-name',
            enabled: true,
          },
        ],
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      description: 'ボタンのスタイルバリエーション',
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'ボタンのサイズ',
    },
    disabled: {
      control: 'boolean',
      description: '無効状態の制御',
    },
    onClick: {
      action: 'clicked',
      description: 'クリック時のコールバック',
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof Button>

export const Default: Story = {
  args: {
    children: 'ボタン',
    variant: 'default',
    size: 'default',
  },
}

export const Destructive: Story = {
  args: {
    children: '削除',
    variant: 'destructive',
    size: 'default',
  },
}

export const Outline: Story = {
  args: {
    children: '編集',
    variant: 'outline',
    size: 'default',
  },
}

export const Secondary: Story = {
  args: {
    children: 'キャンセル',
    variant: 'secondary',
    size: 'default',
  },
}

export const Ghost: Story = {
  args: {
    children: 'その他',
    variant: 'ghost',
    size: 'default',
  },
}

export const Link: Story = {
  args: {
    children: '詳細を見る',
    variant: 'link',
    size: 'default',
  },
}

export const Small: Story = {
  args: {
    children: '小',
    size: 'sm',
  },
}

export const Large: Story = {
  args: {
    children: '大',
    size: 'lg',
  },
}

export const Icon: Story = {
  args: {
    children: '+',
    size: 'icon',
  },
}

export const Disabled: Story = {
  args: {
    children: '無効',
    disabled: true,
  },
}

// インタラクションテスト用のストーリー
export const WithClick: Story = {
  args: {
    children: 'クリックテスト',
  },
  play: async ({ canvasElement, args }) => {
    const button = canvasElement.querySelector('button')
    if (button) {
      button.click()
    }
  },
}

// アクセシビリティテスト用のストーリー
export const WithAriaLabel: Story = {
  args: {
    children: '閉じる',
    'aria-label': 'ダイアログを閉じる',
  },
}

// 長いテキストの対応確認用
export const WithLongText: Story = {
  args: {
    children: 'とても長いボタンのテキストでもレイアウトが崩れないことを確認する',
    variant: 'default',
  },
}