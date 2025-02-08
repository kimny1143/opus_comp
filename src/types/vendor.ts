/**
 * 取引先の基本情報を定義するインターフェース
 * MVPの要件に合わせて最小限の項目のみを含む
 */
export interface Vendor {
  id: string
  name: string
  email: string
  phone?: string | null
  address?: string | null
  firstTag?: string | null
  secondTag?: string | null
  createdAt: Date
  updatedAt: Date
}

/**
 * 取引先作成時のデータ型
 * 必須項目のみを含む
 */
export type CreateVendorInput = {
  name: string
  email: string
  phone?: string
  address?: string
  tags?: string[] // APIレベルでは配列として受け取り、内部で分割して保存
}

/**
 * 取引先更新時のデータ型
 * すべてのフィールドをオプショナルに
 */
export type UpdateVendorInput = Partial<CreateVendorInput>

/**
 * 取引先の検索パラメータ
 * MVPではシンプルな検索のみをサポート
 */
export interface VendorSearchParams {
  query?: string // 名前による検索
  tag?: string  // 単一のタグによる検索
}

/**
 * APIレスポンスの型
 */
export interface VendorResponse {
  vendor: Vendor
}

export interface VendorListResponse {
  vendors: Vendor[]
  total: number
}