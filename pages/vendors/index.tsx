import React from 'react';
import Layout from '../../components/Layout';
import { useQuery } from 'react-query';
import axios from 'axios';

const fetchVendors = async () => {
  const response = await axios.get('/api/vendors');
  return response.data;
};

const VendorList = () => {
  const { data: vendors, status } = useQuery('vendors', fetchVendors);

  return (
    <Layout>
      <>
        <h1>取引先一覧</h1>
        {status === 'loading' && <p>読み込み中...</p>}
        {status === 'error' && <p>データの取得に失敗しました。</p>}
        {status === 'success' && (
          <table>
            {/* 取引先のリストを表示 */}
          </table>
        )}
      </>
    </Layout>
  );
};

export default VendorList; 