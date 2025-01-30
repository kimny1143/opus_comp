import { describe, it, expect } from 'vitest'
import { tagSchema, defaultTag } from '../tag'

describe('tagSchema', () => {
  describe('name', () => {
    it('タグ名が入力されている場合バリデーションが通る', () => {
      const result = tagSchema.safeParse({ name: 'テストタグ' })
      expect(result.success).toBe(true)
    })

    it('タグ名が空の場合エラーになる', () => {
      const result = tagSchema.safeParse({ name: '' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('必須項目です')
      }
    })
  })

  describe('id', () => {
    it('idが入力されている場合バリデーションが通る', () => {
      const result = tagSchema.safeParse({ id: 'tag-1', name: 'テストタグ' })
      expect(result.success).toBe(true)
    })

    it('idが未入力の場合もバリデーションが通る', () => {
      const result = tagSchema.safeParse({ name: 'テストタグ' })
      expect(result.success).toBe(true)
    })
  })

  describe('defaultTag', () => {
    it('デフォルト値のスキーマ検証が通る', () => {
      const result = tagSchema.safeParse(defaultTag)
      expect(result.success).toBe(true)
    })

    it('nameフィールドが存在する', () => {
      expect(defaultTag).toHaveProperty('name')
      expect(typeof defaultTag.name).toBe('string')
    })
  })
}) 