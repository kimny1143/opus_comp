import React from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import prisma from '../../lib/prisma';

interface Vendor {
  id: number;
  name: string;
  address: string;
  contactInfo: string;
  registrationNumber: string;
  tags: VendorTag[];
}

interface VendorTag {
  id: number;
  name: string;
  vendorId: number;
}

const VendorDetail = ({ vendor }: { vendor: Vendor }) => {
  return (
    <Layout>
      <h1>{vendor.name}</h1>
      <p>住所: {vendor.address}</p>
      <p>連絡先: {vendor.contactInfo}</p>
      <p>登録番号: {vendor.registrationNumber}</p>
      <p>タグ: {vendor.tags.join(', ')}</p>
    </Layout>
  );
};

export async function getServerSideProps({ params }: { params: { id: string } }) {
  const vendor = await prisma.vendor.findUnique({
    where: { id: Number(params.id) },
  });
  return { props: { vendor } };
}

export default VendorDetail; 