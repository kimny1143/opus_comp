import '@/styles/globals.css';
import { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MainLayout } from '@/components/layouts/MainLayout'

const queryClient = new QueryClient();

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <MainLayout>
          <Component {...pageProps} />
        </MainLayout>
      </QueryClientProvider>
    </SessionProvider>
  );
}

export default MyApp; 