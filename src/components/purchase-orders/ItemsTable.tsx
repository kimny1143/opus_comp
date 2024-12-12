import { PlusIcon, TrashIcon } from 'lucide-react'

interface Item {
  id: string
  itemName: string
  description: string | null
  quantity: number
  unitPrice: number
  taxRate: number
}

interface Props {
  items: Item[]
  editable: boolean
  onItemChange?: (index: number, field: string, value: any) => void
  onItemRemove?: (index: number) => void
}

export function ItemsTable({ items, editable, onItemChange, onItemRemove }: Props) {
  const calculateAmount = (item: Item) => {
    return item.quantity * item.unitPrice
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              品目名
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              数量
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              単価
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              税率
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              金額
            </th>
            {editable && (
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item, index) => (
            <tr key={item.id || index}>
              <td className="px-6 py-4 whitespace-nowrap">
                {editable ? (
                  <input
                    type="text"
                    value={item.itemName}
                    onChange={(e) => onItemChange?.(index, 'itemName', e.target.value)}
                    className="w-full px-2 py-1 border rounded"
                  />
                ) : (
                  item.itemName
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                {editable ? (
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => onItemChange?.(index, 'quantity', parseInt(e.target.value))}
                    className="w-24 px-2 py-1 border rounded text-right"
                    min="1"
                  />
                ) : (
                  item.quantity.toLocaleString()
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                {editable ? (
                  <input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => onItemChange?.(index, 'unitPrice', parseInt(e.target.value))}
                    className="w-32 px-2 py-1 border rounded text-right"
                    min="0"
                    step="1"
                  />
                ) : (
                  `¥${item.unitPrice.toLocaleString()}`
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                {editable ? (
                  <select
                    value={item.taxRate}
                    onChange={(e) => onItemChange?.(index, 'taxRate', Number(e.target.value))}
                    className="w-24 px-2 py-1 border rounded"
                  >
                    <option value={0.1}>10%</option>
                    <option value={0.08}>8%</option>
                    <option value={0}>0%</option>
                  </select>
                ) : (
                  `${(item.taxRate * 100)}%`
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                ¥{calculateAmount(item).toLocaleString()}
              </td>
              {editable && (
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button
                    type="button"
                    onClick={() => onItemRemove?.(index)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
} 