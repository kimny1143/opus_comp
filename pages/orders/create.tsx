import React, { useState } from 'react';
import Layout from '../../components/Layout';

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
    <Layout>
      <h1>新規発注書の作成</h1>
      <form onSubmit={handleSubmit}>
        {/* 発注書のフォームフィールド */}
      </form>
    </Layout>
  );
};

export default CreateOrder; 