import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { TaxRateSelect } from '../TaxRateSelect';
import { TAX_RATES } from '@/types/tax';

// テスト用のラッパーコンポーネント
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm({
    defaultValues: {
      taxRate: TAX_RATES.STANDARD
    }
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('TaxRateSelect', () => {
  it('should render with default label', () => {
    render(
      <TestWrapper>
        <TaxRateSelect name="taxRate" />
      </TestWrapper>
    );

    expect(screen.getByText('税率')).toBeInTheDocument();
  });

  it('should render with custom label', () => {
    render(
      <TestWrapper>
        <TaxRateSelect name="taxRate" label="消費税率" />
      </TestWrapper>
    );

    expect(screen.getByText('消費税率')).toBeInTheDocument();
  });

  it('should show tax rate options', async () => {
    render(
      <TestWrapper>
        <TaxRateSelect name="taxRate" />
      </TestWrapper>
    );

    // セレクトボックスを開く
    fireEvent.click(screen.getByRole('combobox'));

    // オプションが表示されることを確認
    const options = screen.getAllByRole('option', { hidden: true });
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveTextContent('軽減税率(8%)');
    expect(options[1]).toHaveTextContent('標準税率(10%)');
  });

  it('should mark reduced tax rate as applicable for eligible categories', () => {
    render(
      <TestWrapper>
        <TaxRateSelect name="taxRate" category="FOOD" />
      </TestWrapper>
    );

    // セレクトボックスを開く
    fireEvent.click(screen.getByRole('combobox'));

    // 軽減税率が適用対象として表示されることを確認
    expect(screen.getByText('軽減税率(8%) (適用対象)')).toBeInTheDocument();
  });

  it('should be disabled when specified', () => {
    render(
      <TestWrapper>
        <TaxRateSelect name="taxRate" disabled />
      </TestWrapper>
    );

    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('should apply correct styling for different tax rates', () => {
    render(
      <TestWrapper>
        <TaxRateSelect name="taxRate" />
      </TestWrapper>
    );

    // セレクトボックスを開く
    fireEvent.click(screen.getByRole('combobox'));

    // 軽減税率の項目が青色で表示されることを確認
    const reducedRateOption = screen.getAllByRole('option', { hidden: true })[0];
    expect(reducedRateOption.closest('[data-radix-collection-item]')).toHaveClass('text-blue-600');

    // 標準税率の項目が通常の色で表示されることを確認
    const standardRateOption = screen.getAllByRole('option', { hidden: true })[1];
    expect(standardRateOption.closest('[data-radix-collection-item]')).toHaveClass('text-gray-900');
  });
});