import { z } from "zod";
import { VendorCategory, VendorStatus } from "@prisma/client";

// 取引先の連絡先スキーマ
export const vendorContactSchema = z.object({
  name: z.string().min(1, "担当者名は必須です"),
  email: z.string().email("有効なメールアドレスを入力してください").optional(),
  phone: z.string().optional(),
  department: z.string().optional(),
});

// タグのスキーマ
export const tagSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "タグ名は必須です"),
});

// メインの取引先スキーマ
export const vendorSchema = z.object({
  name: z.string().min(1, "取引先名は必須です"),
  code: z.string().min(1, "取引先コードは必須です"),
  category: z.nativeEnum(VendorCategory, {
    errorMap: () => ({ message: "取引先カテゴリは必須です" }),
  }),
  status: z.nativeEnum(VendorStatus).default(VendorStatus.ACTIVE),
  tradingName: z.string().optional(),
  address: z.string().optional(),
  contacts: z.array(vendorContactSchema).optional(),
  email: z.string().email("有効なメールアドレスを入力してください").optional(),
  phone: z.string().optional(),
  fax: z.string().optional(),
  website: z.string().url("有効なURLを入力してください").optional(),
  notes: z.string().optional(),
  tags: z.array(tagSchema).optional(),
  registrationNumber: z.string().regex(/^T\d{13}$/, "登録番号形式が不正です").optional(),
});

// React Hook Form 用型
export type VendorFormData = z.infer<typeof vendorSchema>;

// React Hook Form 用に最適化した型
export type VendorFormDataRHF = Omit<VendorFormData, "contacts" | "tags"> & {
  contacts: z.infer<typeof vendorContactSchema>[];
  tags: z.infer<typeof tagSchema>[];
};

// フォームの初期値
export const defaultVendorFormData: VendorFormData = {
  name: "",
  code: "",
  category: VendorCategory.CORPORATION,
  status: VendorStatus.ACTIVE,
  tradingName: "",
  address: "",
  contacts: [],
  email: "",
  phone: "",
  fax: "",
  website: "",
  notes: "",
  tags: [],
  registrationNumber: "",
}; 