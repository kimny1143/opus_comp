import React from 'react';
import { useSession } from 'next-auth/react';
import Layout from '../components/Layout';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const Dashboard = () => {
  const { data: session, status } = useSession();
  const { t } = useTranslation('common');

  if (status === 'loading') return <p>{t('loading')}</p>;
  if (!session) return <p>{t('please_login')}</p>;

  return (
    <Layout>
      <>
        <h1>{t('dashboard')}</h1>
        <p>{t('welcome', { name: session.user?.name })}</p>
        {/* 基本的な統計情報を表示 */}
      </>
    </Layout>
  );
};

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

export default Dashboard; 