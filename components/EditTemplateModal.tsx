import React, { useState, useEffect } from 'react';
import { PurchaseOrderItem, ItemTemplate } from '@/types/purchaseOrder';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, name: string, items: PurchaseOrderItem[]) => void;
  template: ItemTemplate | null;
}

export const EditTemplateModal: React.FC<Props> = ({ isOpen, onClose, onSave, template }) => {
  const [templateName, setTemplateName] = useState('');
  const [items, setItems] = useState<PurchaseOrderItem[]>([]);

  useEffect(() => {
    if (template) {
      setTemplateName(template.name);
      setItems(template.items);
    }
  }, [template]);

  if (!isOpen || !template) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName.trim()) return;
    onSave(template.id, templateName, items);
    onClose();
  };

  const handleAddItem = () => {
    setItems([...items, { name: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof PurchaseOrderItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-medium mb-4">テンプレートを編集</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2">テンプレート名</label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="w-full border rounded-md p-2"
              required
            />
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="font-medium">明細項目</label>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
              >
                項目を追加
              </button>
            </div>

            {items.map((item, index) => (
              <div key={index} className="border rounded-md p-4 mb-2">
                <div className="flex justify-between mb-2">
                  <span>項目 #{index + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    削除
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1">品名</label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                      className="w-full border rounded-md p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1">数量</label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                      className="w-full border rounded-md p-2"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1">単価</label>
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', parseInt(e.target.value))}
                      className="w-full border rounded-md p-2"
                      min="0"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
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