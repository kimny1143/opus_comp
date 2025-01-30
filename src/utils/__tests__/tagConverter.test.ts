import { tagToFormData, formDataToTag } from '../tagConverter'
import { Tag } from '@/types/tag'
import { expect, describe, it } from 'vitest'

describe('タグ変換ユーティリティ', () => {
  const mockTag: Tag = {
    id: '1',
    name: 'テストタグ',
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const mockFormData = {
    id: '1',
    name: 'テストタグ'
  }

  describe('tagToFormData', () => {
    it('Tagから必要なフィールドのみを持つTagFormDataに変換できる', () => {
      const result = tagToFormData(mockTag)
      expect(result).toEqual(mockFormData)
    })
  })

  describe('formDataToTag', () => {
    it('TagFormDataからTagに変換できる', () => {
      const result = formDataToTag(mockFormData)
      expect(result).toMatchObject({
        id: mockFormData.id,
        name: mockFormData.name
      })
      expect(result.createdAt).toBeInstanceOf(Date)
      expect(result.updatedAt).toBeInstanceOf(Date)
    })

    it('idが未設定の場合は空文字を設定する', () => {
      const noIdFormData = { ...mockFormData, id: undefined }
      const result = formDataToTag(noIdFormData)
      expect(result.id).toBe('')
    })
  })
}) 