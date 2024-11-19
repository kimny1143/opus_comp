import React, { useState } from 'react';
import Layout from '../../components/Layout';

const CreateInvoice = () => {
  const [formData, setFormData] = useState({
    vendorId: '',
    dueDate: '',
    items: [{ description: '', quantity: 1, unitPrice: 0 }],
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    // 必要に応じてリダイレクト
  };

  return (
    <Layout>
      <h1>新規請求書の作成</h1>
      <form onSubmit={handleSubmit}>
        {/* 請求書フォームフィールド */}
      </form>
    </Layout>
  );
};

export default CreateInvoice; 