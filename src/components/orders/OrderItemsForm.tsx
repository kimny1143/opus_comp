'use client'

import { useState } from 'react'
import { Control, useFieldArray, useFormContext } from 'react-hook-form'
import type { OrderFormData } from './OrderForm'

interface OrderItemsFormProps {
  control: Control<OrderFormData>
  disabled?: boolean
}

export function OrderItemsForm({ control, disabled = false }: OrderItemsFormProps) {
  const { register } = useFormContext<OrderFormData>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  })

  const handleAddItem = () => {
    append({
      itemName: '',
      quantity: 1,
      unitPrice: 0,
      taxRate: 0.1,
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
          disabled={disabled}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
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
                  {...register(`items.${index}.itemName`)}
                  disabled={disabled}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50"
                  data-cy="item-name"
                />
              </label>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                数量
                <input
                  type="number"
                  {...register(`items.${index}.quantity`)}
                  disabled={disabled}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50"
                  data-cy="item-quantity"
                />
              </label>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                単価
                <input
                  type="number"
                  {...register(`items.${index}.unitPrice`)}
                  disabled={disabled}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50"
                  data-cy="item-unit-price"
                />
              </label>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                税率
                <select
                  {...register(`items.${index}.taxRate`)}
                  disabled={disabled}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50"
                  data-cy="item-tax-rate"
                >
                  <option value="0.1">10%</option>
                  <option value="0.08">8%</option>
                  <option value="0">0%</option>
                </select>
              </label>
            </div>

            <div className="col-span-1">
              <button
                type="button"
                onClick={() => remove(index)}
                disabled={disabled}
                className="mt-6 text-red-600 hover:text-red-800 disabled:opacity-50"
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