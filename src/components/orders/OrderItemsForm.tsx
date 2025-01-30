'use client'

import { useState } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'

export function OrderItemsForm() {
  const { control, register, watch } = useFormContext()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  })

  const handleAddItem = () => {
    append({
      itemName: '',
      quantity: 1,
      unitPrice: 0,
      taxRate: 10,
      description: ''
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">明細行</h2>
        <button
          type="button"
          onClick={handleAddItem}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          data-cy="add-item"
        >
          明細行を追加
        </button>
      </div>

      <div className="space-y-4" data-cy="items-container">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-12 gap-4 p-4 bg-gray-50 rounded-lg"
            data-cy="item-row"
          >
            <div className="col-span-4">
              <label className="block text-sm font-medium text-gray-700">
                品目名
                <input
                  type="text"
                  {...register(`items.${index}.itemName` as const, {
                    required: '品目名を入力してください'
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  data-cy="item-name"
                />
              </label>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                数量
                <input
                  type="number"
                  {...register(`items.${index}.quantity` as const, {
                    required: '数量を入力してください',
                    min: { value: 1, message: '1以上を入力してください' }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  data-cy="item-quantity"
                />
              </label>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                単価
                <input
                  type="number"
                  {...register(`items.${index}.unitPrice` as const, {
                    required: '単価を入力してください',
                    min: { value: 0, message: '0以上を入力してください' }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  data-cy="item-unit-price"
                />
              </label>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                税率
                <select
                  {...register(`items.${index}.taxRate` as const)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  data-cy="item-tax-rate"
                >
                  <option value="10">10%</option>
                  <option value="8">8%</option>
                  <option value="0">0%</option>
                </select>
              </label>
            </div>

            <div className="col-span-1">
              <button
                type="button"
                onClick={() => remove(index)}
                className="mt-6 text-red-600 hover:text-red-800"
                data-cy="delete-item"
              >
                削除
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 