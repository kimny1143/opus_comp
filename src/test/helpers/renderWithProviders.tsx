import { ReactElement } from 'react'
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'

// テスト用のQueryClientを作成
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  })

// プロバイダーのラッパーコンポーネント
interface WrapperProps {
  children: ReactElement
}

export const TestWrapper = ({ children }: WrapperProps) => {
  const queryClient = createTestQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
        <Toaster position="top-right" />
      </ThemeProvider>
    </QueryClientProvider>
  )
}

// レンダリングヘルパー関数
export const renderWithProviders = (ui: ReactElement) => {
  return render(ui, {
    wrapper: TestWrapper,
  })
}

// カスタムクエリクライアントを使用するレンダリングヘルパー
export const renderWithCustomClient = (
  ui: ReactElement,
  queryClient: QueryClient
) => {
  const Wrapper = ({ children }: WrapperProps) => (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
        <Toaster position="top-right" />
      </ThemeProvider>
    </QueryClientProvider>
  )

  return render(ui, {
    wrapper: Wrapper,
  })
}

// エクスポート
export * from '@testing-library/react'
export { renderWithProviders as render } 