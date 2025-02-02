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
        <TaxRateSelect name="taxRate" label="適用税率" />
      </TestWrapper>
    );

    expect(screen.getByText('適用税率')).toBeInTheDocument();
  });

  it('should show tax rate options', () => {
    render(
      <TestWrapper>
        <TaxRateSelect name="taxRate" />
      </TestWrapper>
    );

    // セレクトボックスを開く
    fireEvent.click(screen.getByRole('combobox'));

    // 税率オプションが表示されることを確認
    expect(screen.getByText('標準税率(10%)')).toBeInTheDocument();
    expect(screen.getByText('軽減税率(8%)')).toBeInTheDocument();
  });

  it('should be disabled when specified', () => {
    render(
      <TestWrapper>
        <TaxRateSelect name="taxRate" disabled />
      </TestWrapper>
    );

    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('should apply blue color to reduced tax rate option', () => {
    render(
      <TestWrapper>
        <TaxRateSelect name="taxRate" />
      </TestWrapper>
    );

    // セレクトボックスを開く
    fireEvent.click(screen.getByRole('combobox'));

    // 軽減税率のオプションが青色で表示されることを確認
    const reducedTaxOption = screen.getByText('軽減税率(8%)').closest('.text-blue-600');
    expect(reducedTaxOption).toBeInTheDocument();
  });

  it('should handle value change', () => {
    render(
      <TestWrapper>
        <TaxRateSelect name="taxRate" />
      </TestWrapper>
    );

    // セレクトボックスを開く
    fireEvent.click(screen.getByRole('combobox'));

    // 軽減税率を選択
    fireEvent.click(screen.getByText('軽減税率(8%)'));

    // 選択した値が反映されることを確認
    expect(screen.getByRole('combobox')).toHaveTextContent('軽減税率(8%)');
  });
});