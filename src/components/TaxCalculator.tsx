import React from 'react';
import { UseFormRegister, Control, UseFormSetValue } from 'react-hook-form';
import { PurchaseOrderForm } from '@/types/purchaseOrder';
import { validateTaxRate } from '@/domains/invoice/tax';

interface Props {
  register: UseFormRegister<PurchaseOrderForm>;
  control: Control<PurchaseOrderForm>;
  amount: number;
  setValue: UseFormSetValue<PurchaseOrderForm>;
}

export const TaxCalculator: React.FC<Props> = ({ register, amount, setValue }) => {
  const taxRates = [
    { value: 0.10, label: '10%（標準税率）' },
    { value: 0.08, label: '8%（軽減税率）' },
    { value: 0, label: '非課税' }
  ];

  const handleTaxRateChange = (rate: number) => {
    if (!validateTaxRate(rate)) {
      console.warn('Invalid tax rate:', rate);
      return;
    }
    const taxAmount = Math.floor(amount * rate);
    setValue('taxRate', rate);
    setValue('taxAmount', taxAmount);
    setValue('totalAmount', amount + taxAmount);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block mb-2">税率</label>
        <select
          {...register('taxRate')}
          onChange={(e) => handleTaxRateChange(Number(e.target.value))}
          className="w-full border rounded-md p-2"
        >
          {taxRates.map((rate) => (
            <option key={rate.value} value={rate.value}>
              {rate.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-2">消費税額</label>
        <input
          type="number"
          {...register('taxAmount')}
          className="w-full border rounded-md p-2 bg-gray-100"
          readOnly
        />
      </div>

      <div>
        <label className="block mb-2">合計金額（税込）</label>
        <input
          type="number"
          {...register('totalAmount')}
          className="w-full border rounded-md p-2 bg-gray-100"
          readOnly
        />
      </div>
    </div>
  );
}; 