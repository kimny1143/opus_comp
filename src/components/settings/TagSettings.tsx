'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'

interface TagFormData {
  name: string
  color?: string
}

export function TagSettings() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<TagFormData>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tags, setTags] = useState<Array<{ id: string; name: string; color?: string }>>([])

  const onSubmit = async (data: TagFormData) => {
    try {
      setIsSubmitting(true)
      // TODO: タグの保存処理を実装
      console.log('送信データ:', data)
      reset()
    } catch (error) {
      console.error('エラー:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (tagId: string) => {
    try {
      // TODO: タグの削除処理を実装
      console.log('削除するタグID:', tagId)
      setTags(tags.filter(tag => tag.id !== tagId))
    } catch (error) {
      console.error('エラー:', error)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            タグ名
            <input
              type="text"
              {...register('name', { required: 'タグ名を入力してください' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              data-cy="tag-name-input"
            />
          </label>
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            色
            <input
              type="color"
              {...register('color')}
              className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              data-cy="tag-color-input"
            />
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            data-cy="submit-tag"
          >
            {isSubmitting ? '保存中...' : 'タグを追加'}
          </button>
        </div>
      </form>

      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">タグ一覧</h2>
        <div className="space-y-2" data-cy="tag-list">
          {tags.map(tag => (
            <div
              key={tag.id}
              className="flex items-center justify-between p-3 bg-white rounded-md shadow-sm border border-gray-200"
            >
              <div className="flex items-center space-x-2">
                {tag.color && (
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                )}
                <span>{tag.name}</span>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(tag.id)}
                className="text-red-600 hover:text-red-800"
                data-cy="delete-tag"
              >
                削除
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 