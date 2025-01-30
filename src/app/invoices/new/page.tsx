'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { InvoiceForm } from '@/components/invoice/InvoiceForm';
import { InvoiceCreateInput } from '@/types/invoice';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { SerializedPurchaseOrder } from '@/types/purchase-order';
import { Prisma } from '@prisma/client';
import type { Item } from '@/types/validation/item';

export default function NewInvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [purchaseOrder, setPurchaseOrder] = useState<SerializedPurchaseOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchPurchaseOrder = async () => {
      const purchaseOrderId = searchParams.get('purchaseOrderId');
      if (!purchaseOrderId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/purchase-orders/${purchaseOrderId}`);
        if (!response.ok) throw new Error('発注書の取得に失敗しました');
        const data = await response.json();
        setPurchaseOrder(data);
      } catch (error) {
        toast({
          title: 'エラー',
          description: error instanceof Error ? error.message : '発注書の取得に失敗しました',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPurchaseOrder();
  }, [searchParams, toast]);

  const handleSubmit = async (data: InvoiceCreateInput) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '処理に失敗しました');
      }

      const result = await response.json();
      router.push(`/invoices/${result.id}`);
      toast({
        title: '請求書を作成しました',
        description: '正常に処理が完了しました。',
      });
    } catch (error) {
      toast({
        title: 'エラー',
        description: error instanceof Error ? error.message : '処理に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">読み込み中...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            className="mr-4"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            戻る
          </Button>
          <h1 className="text-2xl font-bold">
            新規請求書の作成
          </h1>
        </div>

        <InvoiceForm
          initialData={purchaseOrder ? {
            vendorId: purchaseOrder.vendorId,
            purchaseOrderId: purchaseOrder.id,
            items: purchaseOrder.items.map(item => ({
              itemName: item.itemName,
              quantity: item.quantity,
              unitPrice: new Prisma.Decimal(item.unitPrice),
              taxRate: new Prisma.Decimal(item.taxRate),
              description: item.description || undefined
            } as Item))
          } : undefined}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
} 