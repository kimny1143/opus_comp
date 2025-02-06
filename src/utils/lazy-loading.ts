import { lazy, ComponentType, LazyExoticComponent } from 'react'
import { logger } from '@/lib/logger'

interface LazyLoadOptions<T extends ComponentType<any>> {
  /** コンポーネントの読み込み失敗時のフォールバック */
  fallback?: T
  /** 読み込み失敗時のリトライ回数 */
  retries?: number
  /** リトライ間隔(ミリ秒) */
  retryDelay?: number
}

/**
 * コンポーネントを遅延読み込みするためのユーティリティ
 * @param factory コンポーネントを読み込む関数
 * @param options 遅延読み込みのオプション
 */
export function lazyLoad<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  options: LazyLoadOptions<T> = {}
): LazyExoticComponent<T> {
  const {
    fallback,
    retries = 3,
    retryDelay = 1000
  } = options

  return lazy(async () => {
    let lastError: Error | null = null
    let attempt = 0

    while (attempt < retries) {
      try {
        const component = await factory()
        return component
      } catch (error) {
        lastError = error as Error
        attempt++

        logger.warn('Component lazy loading failed:', {
          error: lastError,
          attempt,
          retries
        })

        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay))
        }
      }
    }

    logger.error('Component lazy loading failed after retries:', {
      error: lastError,
      retries
    })

    if (fallback) {
      return { default: fallback }
    }

    throw lastError
  })
}

/**
 * 遅延読み込みするコンポーネントの型を定義
 */
export type LazyComponent<T extends ComponentType<any>> = LazyExoticComponent<T>

/**
 * 遅延読み込みするコンポーネントのプロパティ型を取得
 */
export type LazyComponentProps<T extends ComponentType<any>> = T extends ComponentType<infer P> ? P : never

/**
 * コンポーネントの事前読み込みを行うユーティリティ
 * @param components 事前読み込みするコンポーネントの配列
 */
export async function preloadComponents(
  components: Array<LazyExoticComponent<ComponentType<any>>>
): Promise<void> {
  try {
    await Promise.all(
      components.map(component => {
        const loader = (component as any)._payload?._result
        return typeof loader === 'function' ? loader() : undefined
      })
    )
  } catch (error) {
    logger.error('Component preloading failed:', { error })
    throw error
  }
}

/**
 * 使用例:
 * 
 * // コンポーネントの定義
 * const LazyComponent = lazyLoad(
 *   () => import('@/components/HeavyComponent'),
 *   {
 *     fallback: LoadingFallback,
 *     retries: 3
 *   }
 * )
 * 
 * // 事前読み込み
 * useEffect(() => {
 *   preloadComponents([LazyComponent])
 * }, [])
 * 
 * // 使用
 * return (
 *   <Suspense fallback={<LoadingSpinner />}>
 *     <LazyComponent />
 *   </Suspense>
 * )
 */