import { PurchaseOrderItem } from '@prisma/client';
import { Trash2 } from 'lucide-react';

interface ItemsTableProps {
  items: PurchaseOrderItem[];
  editable?: boolean;
  onItemChange?: (index: number, field: keyof PurchaseOrderItem, value: any) => void;
  onItemRemove?: (index: number) => void;
  showActions?: boolean;
}

export function ItemsTable({
  items,
  editable = false,
  onItemChange,
  onItemRemove,
  showActions = true
}: ItemsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              品目
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              数量
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              単価
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              税率
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              金額
            </th>
            {showActions && editable && (
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                操作
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {items.map((item, index) => (
            <tr key={item.id || index}>
              <td className="px-4 py-3">
                {editable ? (
                  <input
                    type="text"
                    value={item.itemName}
                    onChange={(e) => onItemChange?.(index, 'itemName', e.target.value)}
                    className="w-full px-2 py-1 border rounded-md"
                    required
                  />
                ) : (
                  <div>
                    <div>{item.itemName}</div>
                    {item.description && (
                      <div className="text-sm text-gray-500">{item.description}</div>
                    )}
                  </div>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                {editable ? (
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => onItemChange?.(index, 'quantity', parseInt(e.target.value))}
                    className="w-24 px-2 py-1 border rounded-md text-right"
                    min="1"
                    required
                  />
                ) : (
                  item.quantity
                )}
              </td>
              <td className="px-4 py-3 text-right">
                {editable ? (
                  <input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => onItemChange?.(index, 'unitPrice', parseInt(e.target.value))}
                    className="w-32 px-2 py-1 border rounded-md text-right"
                    min="0"
                    required
                  />
                ) : (
                  `¥${item.unitPrice.toLocaleString()}`
                )}
              </td>
              <td className="px-4 py-3 text-right">
                {editable ? (
                  <select
                    value={item.taxRate}
                    onChange={(e) => onItemChange?.(index, 'taxRate', parseFloat(e.target.value))}
                    className="w-24 px-2 py-1 border rounded-md"
                  >
                    <option value={0.1}>10%</option>
                    <option value={0.08}>8%</option>
                    <option value={0}>0%</option>
                  </select>
                ) : (
                  `${(item.taxRate * 100).toFixed(0)}%`
                )}
              </td>
              <td className="px-4 py-3 text-right">
                ¥{item.amount.toLocaleString()}
              </td>
              {showActions && editable && (
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onItemRemove?.(index)}
                    className="p-1 text-gray-500 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 