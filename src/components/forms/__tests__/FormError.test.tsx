import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { FormError, FormFieldError, FormField, FormSection } from '../FormError'

describe('FormError', () => {
  it('エラーメッセージが正しく表示される', () => {
    render(<FormError message="テストエラー" />)
    expect(screen.getByText('テストエラー')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('メッセージがnullの場合は何も表示されない', () => {
    const { container } = render(<FormError message={null} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('カスタムクラスが適用される', () => {
    render(<FormError message="テストエラー" className="custom-class" />)
    expect(screen.getByRole('alert')).toHaveClass('custom-class')
  })
})

describe('FormFieldError', () => {
  const mockErrors = [
    {
      path: ['field1'],
      message: 'フィールド1のエラー'
    },
    {
      path: ['field2', 0],
      message: 'フィールド2のエラー'
    }
  ]

  it('指定されたパスのエラーメッセージが表示される', () => {
    render(
      <FormFieldError
        id="field1"
        errors={mockErrors}
        path={['field1']}
      />
    )
    expect(screen.getByText('フィールド1のエラー')).toBeInTheDocument()
  })

  it('エラーがない場合は何も表示されない', () => {
    const { container } = render(
      <FormFieldError
        id="field3"
        errors={mockErrors}
        path={['field3']}
      />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('アクセシビリティ属性が正しく設定される', () => {
    render(
      <FormFieldError
        id="field1"
        errors={mockErrors}
        path={['field1']}
      />
    )
    const alert = screen.getByRole('alert')
    expect(alert).toHaveAttribute('id', 'field1-error')
    expect(alert).toHaveAttribute('aria-live', 'polite')
  })
})

describe('FormField', () => {
  it('ラベルとフィールドが正しく表示される', () => {
    render(
      <FormField id="test" label="テストフィールド">
        <input id="test" type="text" />
      </FormField>
    )
    expect(screen.getByLabelText('テストフィールド')).toBeInTheDocument()
  })

  it('必須フィールドの場合、アスタリスクが表示される', () => {
    render(
      <FormField id="test" label="テストフィールド" required>
        <input id="test" type="text" />
      </FormField>
    )
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('エラーメッセージが表示される', () => {
    render(
      <FormField id="test" label="テストフィールド" error="テストエラー">
        <input id="test" type="text" />
      </FormField>
    )
    expect(screen.getByText('テストエラー')).toBeInTheDocument()
  })
})

describe('FormSection', () => {
  it('タイトルと説明が正しく表示される', () => {
    render(
      <FormSection
        title="セクションタイトル"
        description="セクションの説明"
      >
        <div>セクションの内容</div>
      </FormSection>
    )
    expect(screen.getByText('セクションタイトル')).toBeInTheDocument()
    expect(screen.getByText('セクションの説明')).toBeInTheDocument()
    expect(screen.getByText('セクションの内容')).toBeInTheDocument()
  })

  it('エラーメッセージが表示される', () => {
    render(
      <FormSection
        title="セクションタイトル"
        error="セクションエラー"
      >
        <div>セクションの内容</div>
      </FormSection>
    )
    expect(screen.getByText('セクションエラー')).toBeInTheDocument()
  })

  it('説明が省略可能', () => {
    render(
      <FormSection title="セクションタイトル">
        <div>セクションの内容</div>
      </FormSection>
    )
    expect(screen.queryByText('セクションの説明')).not.toBeInTheDocument()
  })
})