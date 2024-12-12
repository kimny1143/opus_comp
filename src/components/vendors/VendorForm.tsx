'use client'

import { useRouter } from 'next/navigation'
import { useState, useMemo } from 'react'
import { FieldErrors } from 'react-hook-form'
import { BaseForm } from '@/components/shared/forms/BaseForm'
import { TextField } from '@/components/shared/forms/TextField'
import { SelectField } from '@/components/shared/forms/SelectField'
import {
  vendorSchema,
  VENDOR_CATEGORY_LABELS,
  FIELD_LABELS,
  VendorFormData,
  VendorCategory,
  CorporationVendor,
  IndividualVendor,
  Tag
} from './schemas'

// タグ入力用のコンポーネントを追加予定
import { TagInput } from '@/components/shared/forms/TagInput'

const VENDOR_CATEGORIES = Object.entries(VENDOR_CATEGORY_LABELS).map(([value, label]) => ({
  value,
  label
}))

interface VendorFormProps {
  defaultValues?: Partial<VendorFormData>
}

interface FormError {
  message?: string
  type?: string
}

export function VendorForm({ defaultValues }: VendorFormProps) {
  const router = useRouter()
  const [category, setCategory] = useState<VendorCategory>(
    defaultValues?.category ?? 'CORPORATION'
  )

  const formDefaultValues = useMemo(() => {
    if (category === 'CORPORATION') {
      return {
        ...defaultValues,
        category: 'CORPORATION' as const,
        status: defaultValues?.status ?? 'ACTIVE',
        tags: defaultValues?.tags ?? [],
      } as Partial<CorporationVendor>
    } else {
      return {
        ...defaultValues,
        category: 'INDIVIDUAL' as const,
        status: defaultValues?.status ?? 'ACTIVE',
        tags: defaultValues?.tags ?? [],
      } as Partial<IndividualVendor>
    }
  }, [defaultValues, category])

  const handleSubmit = async (data: VendorFormData) => {
    try {
      console.log('Form data:', data)
      const response = await fetch('/api/vendors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('API error:', error)
        throw new Error(error.message || '登録に失敗しました')
      }

      router.push('/vendors')
      router.refresh()
    } catch (error) {
      if (error instanceof Error) {
        console.error('Submit error:', error)
        alert(error.message)
      }
      console.error('Error:', error)
    }
  }

  return (
    <BaseForm
      schema={vendorSchema}
      defaultValues={formDefaultValues}
      onSubmit={handleSubmit}
      onCancel={() => router.back()}
    >
      {({ register, watch, setValue, errors }) => {
        const currentCategory = watch('category') as VendorCategory
        const formErrors = errors as {
          [K in keyof VendorFormData]?: FormError
        }

        return (
          <>
            <SelectField
              label="区分"
              required
              options={VENDOR_CATEGORIES}
              error={formErrors.category}
              {...register('category')}
              onChange={(e) => {
                register('category').onChange(e)
                setCategory(e.target.value as VendorCategory)
              }}
            />

            <TextField
              label={FIELD_LABELS[currentCategory].name}
              required
              error={formErrors.name}
              {...register('name')}
            />

            {currentCategory === 'INDIVIDUAL' && (
              <TextField
                label={FIELD_LABELS[currentCategory].tradingName}
                error={formErrors.tradingName}
                {...register('tradingName')}
              />
            )}

            <TextField
              label={FIELD_LABELS[currentCategory].code}
              error={formErrors.code}
              {...register('code')}
            />

            <TextField
              label={FIELD_LABELS[currentCategory].registrationNumber}
              error={formErrors.registrationNumber}
              {...register('registrationNumber')}
            />

            {currentCategory === 'CORPORATION' && (
              <TextField
                label={FIELD_LABELS[currentCategory].contactPerson}
                error={formErrors.contactPerson}
                {...register('contactPerson')}
              />
            )}

            <TextField
              label={FIELD_LABELS[currentCategory].email}
              type="email"
              error={formErrors.email}
              {...register('email')}
            />

            <TextField
              label={FIELD_LABELS[currentCategory].phone}
              type="tel"
              error={formErrors.phone}
              {...register('phone')}
            />

            <TagInput
              label={FIELD_LABELS[currentCategory].tags}
              error={formErrors.tags}
              value={watch('tags')}
              onChange={(tags) => setValue('tags', tags)}
              onBlur={(e) => register('tags').onBlur(e)}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {FIELD_LABELS[currentCategory].address}
              </label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                rows={3}
                {...register('address')}
              />
              {formErrors.address && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.address.message}
                </p>
              )}
            </div>
          </>
        )
      }}
    </BaseForm>
  )
} 