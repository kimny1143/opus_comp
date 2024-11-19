import { render } from '@testing-library/react';
import Layout from '../../components/Layout';

test('Layout コンポーネントがレンダリングされる', () => {
  const { getByText } = render(<Layout>テストコンテンツ</Layout>);
  expect(getByText('テストコンテンツ')).toBeInTheDocument();
}); 