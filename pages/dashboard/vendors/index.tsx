import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Vendor } from '@prisma/client';

export default function VendorList() {
  const router = useRouter();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVendors();
  }, []);

  async function fetchVendors() {
    try {
      const res = await fetch('/api/vendors');
      if (!res.ok) throw new Error('取引先の取得に失敗しました');
      const data = await res.json();
      setVendors(data.vendors);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    }
  }

  return (
    <div>
      <h1>取引先一覧</h1>
      {error && <p>{error}</p>}
      <Link href="/dashboard/vendors/new">
        <button>新規取引先登録</button>
      </Link>
      <ul>
        {vendors.map((vendor) => (
          <li key={vendor.id}>
            <Link href={`/dashboard/vendors/${vendor.id}`}>{vendor.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
