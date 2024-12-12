import { useSession } from 'next-auth/react';
import Layout from '@/components/Layout';

export default function Dashboard() {
  return (
    <Layout>
      <h2 className="mb-4 text-2xl font-bold">ダッシュボード</h2>
      {/* ダッシュボードの内容をここに追加 */}
    </Layout>
  )
} 