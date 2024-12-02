import { getCsrfToken } from "next-auth/react";
import { GetServerSidePropsContext } from "next";

export default function Login({ csrfToken }: { csrfToken: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form method="post" action="/api/auth/callback/credentials" className="bg-white p-8 rounded shadow-md">
        <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
        <h1 className="text-2xl mb-6">ログイン</h1>
        <div className="mb-4">
          <label className="block text-gray-700">ユーザー名</label>
          <input name="username" type="text" required className="w-full px-3 py-2 border rounded" />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700">パスワード</label>
          <input name="password" type="password" required className="w-full px-3 py-2 border rounded" />
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded">ログイン</button>
      </form>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return {
    props: {
      csrfToken: await getCsrfToken(context),
    },
  };
} 