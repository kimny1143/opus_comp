import * as React from 'react'

interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * スクリーンリーダーに読み上げさせるテキスト
   */
  children: React.ReactNode
}

/**
 * 視覚的には非表示だが、スクリーンリーダーには読み上げられる要素を作成するコンポーネント
 * アクセシビリティ対応のために使用します
 */
const VisuallyHidden = React.forwardRef<HTMLSpanElement, VisuallyHiddenProps>(
  ({ children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: '0',
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: '0',
        }}
        {...props}
      >
        {children}
      </span>
    )
  }
)

VisuallyHidden.displayName = 'VisuallyHidden'

export { VisuallyHidden }