import { Tag, TagFormData } from '@/types/tag'

// TagManagerが使うTag → フォームで使うTagFormDataの変換
export function tagToFormData(tag: Partial<Tag> | { id?: string; name?: string }): TagFormData {
  if (!tag.name || !tag.name.trim()) {
    throw new Error('タグ名は必須です')
  }

  return {
    id: tag.id ?? '',
    name: tag.name.trim()
  }
}

// フォーム上のTagFormData → TagManagerが受け付けるTagへの変換
export function formDataToTag(tagFormData: TagFormData): Tag {
  return {
    id: tagFormData.id || '',
    name: tagFormData.name.trim(),
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

// タグデータの配列を変換する関数
export function convertTagsToFormData(tags: Array<Partial<Tag> | { id?: string; name?: string }> | undefined | string[]): TagFormData[] {
  if (!tags) return []
  
  return tags.map(tag => {
    if (typeof tag === 'string') {
      return {
        id: '',
        name: tag
      }
    }
    return tagToFormData(tag)
  })
} 