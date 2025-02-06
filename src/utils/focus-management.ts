import { useEffect, RefObject } from 'react'

/**
 * フォーカス可能な要素のセレクタ
 */
const FOCUSABLE_ELEMENTS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/**
 * 要素内のフォーカス可能な要素を取得
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS)
  ).filter((element) => {
    return element.offsetParent !== null // 表示されている要素のみ
  })
}

/**
 * フォーカストラップを作成
 * モーダルなどで、特定の要素内でフォーカスを制限する場合に使用
 */
export function createFocusTrap(container: HTMLElement) {
  const focusableElements = getFocusableElements(container)
  const firstFocusable = focusableElements[0]
  const lastFocusable = focusableElements[focusableElements.length - 1]

  function trapFocus(e: KeyboardEvent) {
    if (e.key !== 'Tab') return

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusable) {
        e.preventDefault()
        lastFocusable.focus()
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusable) {
        e.preventDefault()
        firstFocusable.focus()
      }
    }
  }

  return {
    activate: () => {
      container.addEventListener('keydown', trapFocus)
      firstFocusable?.focus()
    },
    deactivate: () => {
      container.removeEventListener('keydown', trapFocus)
    },
  }
}

/**
 * 前のフォーカス位置を保存・復元するユーティリティ
 */
export function createFocusGuard() {
  let previousFocus: HTMLElement | null = null

  return {
    save: () => {
      previousFocus = document.activeElement as HTMLElement
    },
    restore: () => {
      if (previousFocus && previousFocus.focus) {
        previousFocus.focus()
      }
    },
  }
}

/**
 * キーボードイベントのユーティリティ
 */
export const keyboardUtils = {
  isEnterOrSpace: (e: KeyboardEvent) => {
    return e.key === 'Enter' || e.key === ' '
  },
  isEscape: (e: KeyboardEvent) => {
    return e.key === 'Escape'
  },
  isArrowKey: (e: KeyboardEvent) => {
    return ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)
  },
  isTabKey: (e: KeyboardEvent) => {
    return e.key === 'Tab'
  },
}

/**
 * フォーカス管理のカスタムフック
 */
export function useFocusManagement(containerRef: RefObject<HTMLElement>) {
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const focusTrap = createFocusTrap(container)
    const focusGuard = createFocusGuard()

    focusGuard.save()
    focusTrap.activate()

    return () => {
      focusTrap.deactivate()
      focusGuard.restore()
    }
  }, [containerRef])
}

/**
 * 使用例:
 * 
 * // モーダルでのフォーカストラップ
 * function Modal({ isOpen, onClose, children }) {
 *   const modalRef = useRef<HTMLDivElement>(null)
 *   useFocusManagement(modalRef)
 * 
 *   if (!isOpen) return null
 * 
 *   return (
 *     <div ref={modalRef} role="dialog" aria-modal="true">
 *       {children}
 *       <button onClick={onClose}>閉じる</button>
 *     </div>
 *   )
 * }
 * 
 * // キーボードナビゲーション
 * function NavigationMenu() {
 *   const handleKeyDown = (e: KeyboardEvent) => {
 *     if (keyboardUtils.isArrowKey(e)) {
 *       // 矢印キーでのナビゲーション
 *     }
 *   }
 * 
 *   return (
 *     <nav onKeyDown={handleKeyDown}>
 *       <button>メニュー1</button>
 *       <button>メニュー2</button>
 *     </nav>
 *   )
 * }
 */