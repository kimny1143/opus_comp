import React, { useCallback, useEffect, useRef, useState } from 'react'
import type { ComponentType, FC } from 'react'
import { logger } from '@/lib/logger'

/**
 * 再描画の計測結果
 */
interface RenderMetrics extends Record<string, unknown> {
  componentName: string
  renderCount: number
  renderTime: number
  lastRenderTimestamp: number
  averageRenderTime: number
}

/**
 * コンポーネントの再描画を計測するフック
 * @param componentName コンポーネント名
 */
export function useRenderMetrics(componentName: string): RenderMetrics {
  const metrics = useRef<RenderMetrics>({
    componentName,
    renderCount: 0,
    renderTime: 0,
    lastRenderTimestamp: 0,
    averageRenderTime: 0
  })

  const startTime = useRef(performance.now())

  useEffect(() => {
    const endTime = performance.now()
    const renderTime = endTime - startTime.current

    metrics.current = {
      ...metrics.current,
      renderCount: metrics.current.renderCount + 1,
      renderTime,
      lastRenderTimestamp: endTime,
      averageRenderTime:
        (metrics.current.averageRenderTime * (metrics.current.renderCount - 1) + renderTime) /
        metrics.current.renderCount
    }

    if (process.env.NODE_ENV === 'development') {
      logger.debug('Component render metrics:', metrics.current)
    }

    // 次の再描画の計測準備
    startTime.current = performance.now()
  })

  return metrics.current
}

/**
 * メモ化された値の型安全なラッパー
 */
export function useMemoizedValue<T>(value: T, deps: any[]): T {
  const ref = useRef<T>(value)
  const depsRef = useRef<any[]>(deps)

  if (!depsArrayEqual(depsRef.current, deps)) {
    ref.current = value
    depsRef.current = deps
  }

  return ref.current
}

/**
 * 依存配列の比較
 */
function depsArrayEqual(prev: any[], next: any[]): boolean {
  if (prev.length !== next.length) return false
  return prev.every((item, index) => Object.is(item, next[index]))
}

/**
 * 再描画の最適化オプション
 */
interface RenderOptimizationOptions {
  /** デバッグモードの有効化 */
  debug?: boolean
  /** パフォーマンス警告の閾値(ミリ秒) */
  renderTimeThreshold?: number
}

/**
 * 再描画の最適化を行うHOC
 * @param WrappedComponent 最適化対象のコンポーネント
 * @param options 最適化オプション
 */
export function withRenderOptimization<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: RenderOptimizationOptions = {}
): FC<P> {
  const {
    debug = process.env.NODE_ENV === 'development',
    renderTimeThreshold = 16 // 60fps ≈ 16.67ms
  } = options

  const OptimizedComponent: FC<P> = (props) => {
    const metrics = useRenderMetrics(WrappedComponent.displayName || WrappedComponent.name)

    useEffect(() => {
      if (debug && metrics.renderTime > renderTimeThreshold) {
        logger.warn('Slow render detected:', {
          component: metrics.componentName,
          renderTime: metrics.renderTime,
          threshold: renderTimeThreshold
        })
      }
    }, [metrics.renderTime])

    return React.createElement(WrappedComponent, props)
  }

  OptimizedComponent.displayName = `Optimized(${WrappedComponent.displayName || WrappedComponent.name})`
  return OptimizedComponent
}

/**
 * 非同期データの読み込み状態を管理するフック
 */
export function useAsyncData<T>(
  loader: () => Promise<T>,
  deps: any[] = []
): {
  data: T | null
  loading: boolean
  error: Error | null
  reload: () => Promise<void>
} {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await loader()
      setData(result)
    } catch (e) {
      setError(e as Error)
    } finally {
      setLoading(false)
    }
  }, deps)

  useEffect(() => {
    load()
  }, [load])

  return {
    data,
    loading,
    error,
    reload: load
  }
}

/**
 * 使用例:
 * 
 * // メモ化された値の使用
 * const memoizedValue = useMemoizedValue(expensiveValue, [dep1, dep2])
 * 
 * // 再描画の最適化
 * const OptimizedComponent = withRenderOptimization(MyComponent, {
 *   debug: true,
 *   renderTimeThreshold: 20
 * })
 * 
 * // 非同期データの読み込み
 * const { data, loading, error, reload } = useAsyncData(
 *   () => fetchData(),
 *   [someId]
 * )
 */