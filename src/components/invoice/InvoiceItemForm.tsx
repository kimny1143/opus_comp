'use client'

import { InvoiceItem } from '@/types/invoice';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Prisma } from '@prisma/client';

interface InvoiceItemFormProps {
  items: InvoiceItem[];
  onChange: (items: InvoiceItem[]) => void;
}

export const InvoiceItemForm: React.FC<InvoiceItemFormProps> = ({
  items,
  onChange
}) => {
  const addItem = () => {
    const newItem: InvoiceItem = {
      id: crypto.randomUUID(),
      itemName: '',
      description: '',
      quantity: 1,
      unitPrice: new Prisma.Decimal(0),
      taxRate: new Prisma.Decimal(0.1), // デフォルト税率10%
      amount: new Prisma.Decimal(0)
    };
    onChange([...items, newItem]);
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...items];
    const item = { ...updatedItems[index] };
    
    // 型安全な値の設定
    switch (field) {
      case 'description':
      case 'itemName':
        item[field] = value as string;
        break;
      case 'quantity':
        item.quantity = Number(value);
        break;
      case 'unitPrice':
      case 'taxRate':
        item[field] = new Prisma.Decimal(value);
        break;
      default:
        item[field] = value;
    }

    // 金額の自動計算
    if (field === 'quantity' || field === 'unitPrice') {
      const subtotal = new Prisma.Decimal(item.quantity).mul(item.unitPrice);
      item.amount = subtotal.add(subtotal.mul(item.taxRate));
    }

    updatedItems[index] = item;
    onChange(updatedItems);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={item.id} className="grid grid-cols-12 gap-4 p-4 border rounded-lg">
          <div className="col-span-4">
            <Label htmlFor={`item-${index}-description`}>内容</Label>
            <Input
              id={`item-${index}-description`}
              value={item.description || ''}
              onChange={(e) => updateItem(index, 'description', e.target.value)}
              required
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor={`item-${index}-quantity`}>数量</Label>
            <Input
              id={`item-${index}-quantity`}
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
              required
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor={`item-${index}-unitPrice`}>単価</Label>
            <Input
              id={`item-${index}-unitPrice`}
              type="number"
              min="0"
              value={item.unitPrice.toString()}
              onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
              required
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor={`item-${index}-taxRate`}>税率(%)</Label>
            <select
              id={`item-${index}-taxRate`}
              value={item.taxRate.mul(100).toString()}
              onChange={(e) => updateItem(index, 'taxRate', Number(e.target.value) / 100)}
              className="w-full border rounded-md p-2"
            >
              <option value="10">10%</option>
              <option value="8">8%</option>
              <option value="0">0%</option>
            </select>
          </div>
          <div className="col-span-1">
            <Label>金額</Label>
            <div className="p-2">{item.amount?.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</div>
          </div>
          <div className="col-span-1 flex items-end">
            <Button
              type="button"
              variant="destructive"
              onClick={() => removeItem(index)}
            >
              削除
            </Button>
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={addItem}
      >
        項目を追加
      </Button>
    </div>
  );
}; 