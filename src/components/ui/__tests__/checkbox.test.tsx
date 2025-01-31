import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Checkbox } from '../checkbox'

describe('Checkbox', () => {
  it('チェックボックスが正しくレンダリングされる', () => {
    render(<Checkbox />)
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('チェック状態が変更できる', () => {
    const onCheckedChange = vi.fn()
    render(<Checkbox onCheckedChange={onCheckedChange} />)
    
    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)
    
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('disabled状態が適用される', () => {
    render(<Checkbox disabled />)
    expect(screen.getByRole('checkbox')).toBeDisabled()
  })

  it('カスタムクラスが適用される', () => {
    render(<Checkbox className="custom-class" />)
    expect(screen.getByRole('checkbox')).toHaveClass('custom-class')
  })

  it('デフォルトのチェック状態が設定できる', () => {
    render(<Checkbox defaultChecked />)
    expect(screen.getByRole('checkbox')).toHaveAttribute('data-state', 'checked')
  })
})