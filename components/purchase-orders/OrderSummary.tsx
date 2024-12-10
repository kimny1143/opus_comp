interface OrderSummaryProps {
  subtotal: number;
  taxAmount: number;
  className?: string;
  showLabel?: boolean;
}

export function OrderSummary({ 
  subtotal, 
  taxAmount, 
  className = '',
  showLabel = true
}: OrderSummaryProps) {
  const total = subtotal + taxAmount;

  return (
    <div className={`flex justify-end ${className}`}>
      <div className="w-64 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{showLabel ? '小計:' : ''}</span>
          <span>¥{subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{showLabel ? '消費税:' : ''}</span>
          <span>¥{taxAmount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between font-bold border-t pt-2">
          <span>{showLabel ? '合計:' : ''}</span>
          <span>¥{total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
} 