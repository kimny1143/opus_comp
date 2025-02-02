import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { ItemCategorySelect } from '../ItemCategorySelect';
import { ItemCategory } from '@/types/itemCategory';

// テスト用のラッパーコンポーネント
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm({
    defaultValues: {
      category: ItemCategory.OTHER
    }
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('ItemCategorySelect', () => {
  it('should render with default label', () => {
    render(
      <TestWrapper>
        <ItemCategorySelect name="category" />
      </TestWrapper>
    );

    expect(screen.getByText('品目カテゴリー')).toBeInTheDocument();
  });

  it('should render with custom label', () => {
    render(
      <TestWrapper>
        <ItemCategorySelect name="category" label="商品区分" />
      </TestWrapper>
    );

    expect(screen.getByText('商品区分')).toBeInTheDocument();
  });

  it('should show category groups and options', async () => {
    render(
      <TestWrapper>
        <ItemCategorySelect name="category" />
      </TestWrapper>
    );

    // セレクトボックスを開く
    fireEvent.click(screen.getByRole('combobox'));

    // グループヘッダーが表示されることを確認
    expect(screen.getByText('軽減税率対象')).toBeInTheDocument();
    expect(screen.getByText('標準税率対象')).toBeInTheDocument();

    // 軽減税率対象のオプションが表示されることを確認
    const reducedTaxOptions = [
      '飲食料品',
      '定期購読の新聞',
      '農産品',
      '水産品',
      '畜産品'
    ];
    reducedTaxOptions.forEach(option => {
      expect(screen.getByText(option)).toBeInTheDocument();
    });

    // 標準税率対象のオプションが表示されることを確認
    const standardTaxOptions = [
      '電化製品',
      '衣類',
      '家具',
      'サービス',
      'その他'
    ];
    standardTaxOptions.forEach(option => {
      expect(screen.getByText(option)).toBeInTheDocument();
    });
  });

  it('should be disabled when specified', () => {
    render(
      <TestWrapper>
        <ItemCategorySelect name="category" disabled />
      </TestWrapper>
    );

    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('should apply correct styling for different categories', () => {
    render(
      <TestWrapper>
        <ItemCategorySelect name="category" />
      </TestWrapper>
    );

    // セレクトボックスを開く
    fireEvent.click(screen.getByRole('combobox'));

    // 軽減税率対象の項目が青色で表示されることを確認
    const foodOption = screen.getByText('飲食料品').closest('.relative');
    expect(foodOption).toHaveClass('text-blue-600');

    // 標準税率対象の項目が通常の色で表示されることを確認
    const electronicsOption = screen.getByText('電化製品').closest('.relative');
    expect(electronicsOption).toHaveClass('text-gray-900');
  });

  it('should show descriptions for each category', () => {
    render(
      <TestWrapper>
        <ItemCategorySelect name="category" />
      </TestWrapper>
    );

    // セレクトボックスを開く
    fireEvent.click(screen.getByRole('combobox'));

    // 説明文が表示されることを確認
    expect(screen.getByText('飲食料品全般')).toBeInTheDocument();
    expect(screen.getByText('電化製品全般')).toBeInTheDocument();
  });
});