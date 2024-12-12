import React, { useEffect, useState } from 'react';
import { VendorSelectProps } from '@/types/purchaseOrder';

interface Vendor {
  id: number;
  name: string;
}

export const VendorSelect: React.FC<VendorSelectProps> = ({ onSelect }) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await fetch('/api/vendors');
        if (!response.ok) throw new Error('取引先の取得に失敗しました');
        const data = await response.json();
        setVendors(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  if (loading) return <div>読み込み中...</div>;

  return (
    <select
      onChange={(e) => onSelect(Number(e.target.value))}
      className="w-full border rounded-md p-2"
    >
      <option value="">取引先を選択してください</option>
      {vendors.map((vendor) => (
        <option key={vendor.id} value={vendor.id}>
          {vendor.name}
        </option>
      ))}
    </select>
  );
}; 