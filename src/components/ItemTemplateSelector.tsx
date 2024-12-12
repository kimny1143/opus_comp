import React, { useEffect, useState } from 'react';
import { UseFormSetValue } from 'react-hook-form';
import { PurchaseOrderForm, ItemTemplate, PurchaseOrderItem } from '@/types/purchaseOrder';
import { EditTemplateModal } from './EditTemplateModal';

interface Props {
  setValue: UseFormSetValue<PurchaseOrderForm>;
  setFields: (items: any[]) => void;
}

export const ItemTemplateSelector: React.FC<Props> = ({ setValue, setFields }) => {
  const [templates, setTemplates] = useState<ItemTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<ItemTemplate | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('/api/item-templates');
        if (!response.ok) throw new Error('テンプレートの取得に失敗しました');
        const data = await response.json();
        setTemplates(data);
      } catch (error) {
        console.error('Error:', error);
        setError('テンプレートの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    // 明細項目を設定
    setFields(template.items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      description: item.description
    })));
  };

  const handleEditTemplate = async (id: string, name: string, items: PurchaseOrderItem[]) => {
    try {
      const response = await fetch('/api/item-templates', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, name, items }),
      });

      if (!response.ok) throw new Error('テンプレートの更新に失敗しました');

      // テンプレート一覧を再取得
      const templatesResponse = await fetch('/api/item-templates');
      if (!templatesResponse.ok) throw new Error('テンプレートの取得に失敗しました');
      const data = await templatesResponse.json();
      setTemplates(data);
    } catch (error) {
      console.error('Error:', error);
      setError('テンプレートの更新に失敗しました');
    }
  };

  if (loading) return <div>テンプレートを読み込み中...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (templates.length === 0) return null;

  return (
    <div className="mb-4">
      <label className="block mb-2">テンプレート選択</label>
      <div className="flex flex-wrap gap-2">
        {templates.map(template => (
          <div key={template.id} className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => handleTemplateSelect(template.id)}
              className="px-4 py-2 border rounded-md hover:bg-gray-50 text-sm"
            >
              {template.name}を適用
            </button>
            <button
              type="button"
              onClick={() => setEditingTemplate(template)}
              className="p-2 text-gray-600 hover:text-gray-800"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <EditTemplateModal
        isOpen={editingTemplate !== null}
        onClose={() => setEditingTemplate(null)}
        onSave={handleEditTemplate}
        template={editingTemplate}
      />
    </div>
  );
}; 