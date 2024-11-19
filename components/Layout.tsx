import React, { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const router = useRouter();
  const { locale } = router;

  const changeLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const locale = e.target.value;
    router.push(router.pathname, router.asPath, { locale });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-500 text-white p-4 flex justify-between">
        {/* ヘッダーコンテンツ */}
        <div>
          {/* ロゴやナビゲーション */}
        </div>
        <div>
          <select onChange={changeLanguage} defaultValue={locale}>
            <option value="ja">日本語</option>
            <option value="en">English</option>
          </select>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="w-64 bg-gray-100">
          {/* サイドバーコンテンツ */}
        </aside>
        <main className="flex-1 p-4">
          {children}
        </main>
      </div>
      <footer className="bg-gray-800 text-white p-4">
        {/* フッターコンテンツ */}
      </footer>
    </div>
  );
};

export default Layout; 