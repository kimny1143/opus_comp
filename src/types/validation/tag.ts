import { z } from 'zod'
import { baseValidationRules } from './base'

/**
 * タグのバリデーションスキーマ
 */
export const tagSchema = z.object({
  id: z.string().optional(),
  name: baseValidationRules.requiredString.min(1, 'タグ名は必須です')
})

/**
 * タグの型定義
 */
export type Tag = z.infer<typeof tagSchema>

/**
 * タグの初期値
 */
export const defaultTag: Tag = {
  name: ''
} 