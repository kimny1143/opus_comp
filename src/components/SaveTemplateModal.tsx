import React, { useState } from 'react';
import { PurchaseOrderItem } from '@/types/purchaseOrder';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  items: PurchaseOrderItem[];
}

export const SaveTemplateModal: React.FC<Props> = ({ isOpen, onClose, onSave, items }) => {
  const [templateName, setTemplateName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName.trim()) return;
    onSave(templateName);
    setTemplateName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium mb-4">テンプレートを保存</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2">テンプレート名</label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="w-full border rounded-md p-2"
              placeholder="例：システム開発基本セット"
              required
            />
          </div>
          <div className="flex justify-end space-x-3">
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
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 