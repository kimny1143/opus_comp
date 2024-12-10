import React, { useState } from 'react';
import MainLayout from '@/components/layouts/MainLayout';

const CreateOrder = () => {
  const [formData, setFormData] = useState({
    vendorId: '',
    items: [{ description: '', quantity: 1, unitPrice: 0 }],
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await fetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
    // リダイレクトや状態更新
  };

  return (
    <MainLayout>
      <h1>新規発注書の作成</h1>
      <form onSubmit={handleSubmit}>
        {/* 発注書のフォームフィールド */}
      </form>
    </MainLayout>
  );
};

export default CreateOrder; 