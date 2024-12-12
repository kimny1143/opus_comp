import React, { useState } from 'react';
import { format } from 'date-fns';
import { PaymentMethod } from '@prisma/client';

export interface PaymentData {
  paymentDate: string;
  paymentMethod: PaymentMethod;
  amount: number;
  notes?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PaymentData) => Promise<void>;
  invoiceId?: string;
  totalAmount: number;
  isBulkPayment?: boolean;
  selectedCount?: number;
}

export const RegisterPaymentModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  totalAmount,
  isBulkPayment = false,
  selectedCount = 0,
}) => {
  const [paymentData, setPaymentData] = useState<PaymentData>({
    paymentDate: format(new Date(), 'yyyy-MM-dd'),
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    amount: totalAmount,
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(paymentData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium mb-4">支払録の登録</h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block mb-1">支払日</label>
              <input
                type="date"
                value={paymentData.paymentDate}
                onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
                className="w-full border rounded-md p-2"
                required
              />
            </div>

            <div>
              <label className="block mb-1">支払方法</label>
              <select
                value={paymentData.paymentMethod}
                onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value as PaymentMethod })}
                className="w-full border rounded-md p-2"
                required
              >
                <option value={PaymentMethod.BANK_TRANSFER}>銀行振込</option>
                <option value={PaymentMethod.CREDIT_CARD}>クレジットカード</option>
                <option value={PaymentMethod.DIRECT_DEBIT}>口座引き落とし</option>
                <option value={PaymentMethod.CASH}>現金</option>
                <option value={PaymentMethod.OTHER}>その他</option>
              </select>
            </div>

            <div>
              <label className="block mb-1">支払金額</label>
              <input
                type="number"
                value={paymentData.amount}
                onChange={(e) => setPaymentData({ ...paymentData, amount: Number(e.target.value) })}
                className="w-full border rounded-md p-2"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block mb-1">備考</label>
              <textarea
                value={paymentData.notes}
                onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                className="w-full border rounded-md p-2"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              登録
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 