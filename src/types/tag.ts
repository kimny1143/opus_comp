import { z } from 'zod'

// タグの基本的な型定義
export interface Tag {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
}

// フォーム入力用の型定義
export interface TagFormData {
  id?: string
  name: string
}

// 作成用の型定義
export interface TagCreateInput {
  name: string
}

// APIレスポンス用の型定義
export interface TagResponse {
  success: boolean
  tag?: Tag
  tags?: Tag[]
  error?: string
}

// zodスキーマ用の型定義
export type TagSchema = {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
}

// タグ入力用のバリデーションスキーマ
export const tagSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'タグ名は必須です').max(50, 'タグ名は50文字以内で入力してください')
})

export type TagSchemaType = z.infer<typeof tagSchema> 