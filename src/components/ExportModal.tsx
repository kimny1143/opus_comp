    // Start of Selection
    import { useState } from 'react';
    
    const EXPORTABLE_FIELDS = {
      name: '会社名',
      email: 'メールアドレス',
      address: '住所',
      phone: '電話番号',
      registrationNumber: '登録番号',
      contactPerson: '担当者',
      status: 'ステータス',
      tags: 'タグ',
      createdAt: '登録日',
      updatedAt: '更新日',
    } as const;
    
    type ExportModalProps = {
      isOpen: boolean;
      onClose: () => void;
      currentFilters: {
        search?: string;
        status?: string;
        tags?: string[];
      };
    };
    
    export default function ExportModal({ isOpen, onClose, currentFilters }: ExportModalProps) {
      const [selectedFields, setSelectedFields] = useState<string[]>(['name', 'email', 'status']);
      const [error, setError] = useState('');
      const [isExporting, setIsExporting] = useState(false);
    
      if (!isOpen) return null;
    
      async function handleExport() {
        if (selectedFields.length === 0) {
          setError('エクスポートするフィールドを選択してください');
          return;
        }
    
        try {
          setIsExporting(true);
          setError('');
    
          const response = await fetch('/api/vendors/export', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fields: selectedFields,
              filters: currentFilters,
            }),
          });
    
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'エクスポートに失敗しました');
          }
    
          // CSVファイルのダウンロード
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `vendors_${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
    
          onClose();
        } catch (err) {
          setError(err instanceof Error ? err.message : 'エクスポート中にエラーが発生しました');
        } finally {
          setIsExporting(false);
        }
      }
    
      function handleSelectAll() {
        if (selectedFields.length === Object.keys(EXPORTABLE_FIELDS).length) {
          setSelectedFields([]);
        } else {
          setSelectedFields(Object.keys(EXPORTABLE_FIELDS));
        }
      }
    
      function handleToggleField(field: string) {
        if (selectedFields.includes(field)) {
          setSelectedFields(selectedFields.filter(f => f !== field));
        } else {
          setSelectedFields([...selectedFields, field]);
        }
      }
    
      return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">データのエクスポート</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
                aria-label="閉じる"
              >
                ×
              </button>
            </div>
    
            {error && (
              <div className="mb-4 p-2 bg-red-50 border-l-4 border-red-400 text-red-700">
                {error}
              </div>
            )}
    
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">エクスポートするフィールド</h4>
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                  type="button"
                >
                  {selectedFields.length === Object.keys(EXPORTABLE_FIELDS).length
                    ? 'すべて解除'
                    : 'すべて選択'}
                </button>
              </div>
    
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                {Object.entries(EXPORTABLE_FIELDS).map(([field, label]) => (
                  <label key={field} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                    <input
                      type="checkbox"
                      checked={selectedFields.includes(field)}
                      onChange={() => handleToggleField(field)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>
    
            {(currentFilters.search || currentFilters.status || (currentFilters.tags && currentFilters.tags.length > 0)) && (
              <div className="mb-4 p-2 bg-gray-50 rounded text-sm">
                <h4 className="font-medium mb-1">現在の絞り込み条件:</h4>
                <ul className="space-y-1 text-gray-600">
                  {currentFilters.search && (
                    <li>検索: {currentFilters.search}</li>
                  )}
                  {currentFilters.status && (
                    <li>ステータス: {currentFilters.status === 'active' ? '有効' : '無効'}</li>
                  )}
                  {currentFilters.tags && currentFilters.tags.length > 0 && (
                    <li>タグ: {currentFilters.tags.join(', ')}</li>
                  )}
                </ul>
              </div>
            )}
    
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                type="button"
              >
                キャンセル
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting || selectedFields.length === 0}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                type="button"
              >
                {isExporting ? 'エクスポート中...' : 'エクスポート'}
              </button>
            </div>
          </div>
        </div>
      );
    } 