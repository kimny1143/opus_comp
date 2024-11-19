import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import prisma from '../../../lib/prisma';

interface Vendor {
  id: number;
  name: string;
  address: string;
  contactInfo: string;
  registrationNumber: string;
  // その他のフィールド
}

const EditVendor = ({ vendor }: { vendor: Vendor }) => {
  const [formData, setFormData] = useState(vendor);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await fetch(`/api/vendors/${vendor.id}`, {
      method: 'PUT',
      body: JSON.stringify(formData),
    });
    router.push(`/vendors/${vendor.id}`);
  };

  return (
    <Layout>
      <h1>{vendor.name}の情報を編集</h1>
      <form onSubmit={handleSubmit}>
        {/* フォームフィールド */}
      </form>
    </Layout>
  );
};

export async function getServerSideProps({ params }: { params: { id: string } }) {
  const vendor = await prisma.vendor.findUnique({
    where: { id: Number(params.id) },
  });
  return { props: { vendor } };
}

export default EditVendor; 