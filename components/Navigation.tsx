import Link from 'next/link';

export default function Navigation() {
  return (
    <nav>
      <ul>
        <li><Link href="/dashboard">ダッシュボード</Link></li>
        <li><Link href="/dashboard/vendors">取引先一覧</Link></li>
        {/* 他のナビゲーションリンク */}
      </ul>
    </nav>
  );
}
