import { vi } from 'vitest'
import { QueryClient } from '@tanstack/react-query'

// テスト用のQueryClientを作成
export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
        staleTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  })

// クエリのモック
export const mockQuery = <T>(options: {
  data?: T
  error?: Error
  isLoading?: boolean
  isError?: boolean
}) => {
  const { data, error, isLoading = false, isError = false } = options
  return {
    data,
    error,
    isLoading,
    isError,
    isSuccess: !isLoading && !isError,
    refetch: vi.fn(),
    remove: vi.fn(),
    status: isLoading ? 'loading' : isError ? 'error' : 'success',
  }
}

// ミューテーションのモック
export const mockMutation = <T, V>(options: {
  onMutate?: (variables: V) => Promise<T>
  onSuccess?: (data: T, variables: V) => Promise<void>
  onError?: (error: Error, variables: V) => Promise<void>
}) => {
  const { onMutate, onSuccess, onError } = options
  return {
    mutate: vi.fn(async (variables: V) => {
      try {
        let context
        if (onMutate) {
          context = await onMutate(variables)
        }
        if (onSuccess && context) {
          await onSuccess(context, variables)
        }
      } catch (error) {
        if (onError) {
          await onError(error as Error, variables)
        }
        throw error
      }
    }),
    mutateAsync: vi.fn(async (variables: V) => {
      try {
        let context
        if (onMutate) {
          context = await onMutate(variables)
        }
        if (onSuccess && context) {
          await onSuccess(context, variables)
        }
        return context
      } catch (error) {
        if (onError) {
          await onError(error as Error, variables)
        }
        throw error
      }
    }),
    isLoading: false,
    isError: false,
    isSuccess: false,
    reset: vi.fn(),
  }
}

// 無限クエリのモック
export const mockInfiniteQuery = <T>(options: {
  pages: T[][]
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
}) => {
  const { pages, hasNextPage = false, isFetchingNextPage = false } = options
  return {
    data: {
      pages,
      pageParams: Array.from({ length: pages.length }, (_, i) => i),
    },
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage: vi.fn(),
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    remove: vi.fn(),
  }
}

// クエリのアサーション
export const expectQuery = {
  // データの存在確認
  toHaveData: <T>(result: ReturnType<typeof mockQuery<T>>, expected: T) => {
    expect(result.data).toEqual(expected)
    expect(result.isSuccess).toBe(true)
  },

  // ローディング状態の確認
  toBeLoading: (result: ReturnType<typeof mockQuery<unknown>>) => {
    expect(result.isLoading).toBe(true)
    expect(result.status).toBe('loading')
  },

  // エラー状態の確認
  toHaveError: (result: ReturnType<typeof mockQuery<unknown>>, error?: Error) => {
    expect(result.isError).toBe(true)
    expect(result.status).toBe('error')
    if (error) {
      expect(result.error).toEqual(error)
    }
  },
}

// ミューテーションのアサーション
export const expectMutation = {
  // 成功確認
  toBeSuccess: <T, V>(
    mutation: ReturnType<typeof mockMutation<T, V>>,
    variables: V,
    expected: T
  ) => {
    expect(mutation.mutate).toHaveBeenCalledWith(variables)
    expect(mutation.isSuccess).toBe(true)
    return expected
  },

  // エラー確認
  toHaveError: <T, V>(
    mutation: ReturnType<typeof mockMutation<T, V>>,
    variables: V,
    error: Error
  ) => {
    expect(mutation.mutate).toHaveBeenCalledWith(variables)
    expect(mutation.isError).toBe(true)
    return error
  },
}

// 無限クエリのアサーション
export const expectInfiniteQuery = {
  // ページデータの確認
  toHavePages: <T>(
    result: ReturnType<typeof mockInfiniteQuery<T>>,
    expectedPages: T[][]
  ) => {
    expect(result.data.pages).toEqual(expectedPages)
  },

  // 次ページの存在確認
  toHaveNextPage: (result: ReturnType<typeof mockInfiniteQuery<unknown>>) => {
    expect(result.hasNextPage).toBe(true)
  },

  // 次ページ取得中の確認
  toBeFetchingNextPage: (result: ReturnType<typeof mockInfiniteQuery<unknown>>) => {
    expect(result.isFetchingNextPage).toBe(true)
  },
} 