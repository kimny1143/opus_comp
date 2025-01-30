import { z } from "zod";
import { PurchaseOrderStatus } from "@prisma/client";

// 発注品目のスキーマ
export const purchaseOrderItemSchema = z.object({
  name: z.string().min(1, "品目名は必須です"),
  quantity: z.number().min(0, "数量は0以上である必要があります"),
  unitPrice: z.number().min(0, "単価は0以上である必要があります"),
  taxRate: z.number().min(0, "税率は0以上である必要があります"),
  description: z.string().optional(),
  amount: z.number().min(0, "金額は0以上である必要があります"),
});

// タグのスキーマ
export const tagSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "タグ名は必須です"),
});

// メインの発注書スキーマ
export const purchaseOrderSchema = z.object({
  status: z.nativeEnum(PurchaseOrderStatus),
  orderDate: z.date(),
  deliveryDate: z.date().optional(),
  items: z.array(purchaseOrderItemSchema).min(1, "品目は1つ以上必要です"),
  notes: z.string().optional(),
  vendorId: z.string().min(1, "取引先の選択は必須です"),
  tags: z.array(tagSchema).optional(),
  deliveryAddress: z.string().optional(),
  orderNumber: z.string().optional(),
  totalAmount: z.number().min(0, "合計金額は0以上である必要があります"),
  taxAmount: z.number().min(0, "税額は0以上である必要があります"),
  projectId: z.string().optional(),
  terms: z.string().optional(),
  description: z.string().optional(),
}).refine(
  (data) => {
    // 合計金額の検証
    const calculatedTotal = data.items.reduce((sum, item) => sum + item.amount, 0);
    return Math.abs(calculatedTotal - data.totalAmount) < 0.01; // 小数点の誤差を考慮
  },
  {
    message: "合計金額が品目の合計と一致しません",
    path: ["totalAmount"],
  }
);

// React Hook Form 用型
export type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>;

// React Hook Form 用に最適化した型
export type PurchaseOrderFormDataRHF = Omit<PurchaseOrderFormData, "items" | "tags"> & {
  items: z.infer<typeof purchaseOrderItemSchema>[];
  tags: z.infer<typeof tagSchema>[];
};

// フォームの初期値
export const defaultPurchaseOrderFormData: PurchaseOrderFormData = {
  orderDate: new Date(),
  deliveryDate: undefined,
  items: [],
  notes: "",
  vendorId: "",
  tags: [],
  deliveryAddress: "",
  orderNumber: "",
  status: PurchaseOrderStatus.DRAFT,
  totalAmount: 0,
  taxAmount: 0,
  projectId: undefined,
  terms: "",
  description: "",
}; 