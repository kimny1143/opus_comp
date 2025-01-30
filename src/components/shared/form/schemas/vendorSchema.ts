import { z } from 'zod'
import { VendorStatus } from '@prisma/client'
import { 
  stringValidation
} from '@/types/validation/commonValidation'
import { bankInfoSchema } from '@/types/validation/bankInfo'
import { tagSchema } from '@/types/validation/tag'

/**
 * 取引先のバリデーションスキーマ
 */
export const vendorSchema = z.object({
  name: stringValidation.name,
  email: stringValidation.email,
  phone: stringValidation.phone,
  address: stringValidation.address,
  status: z.nativeEnum(VendorStatus),
  category: stringValidation.required,
  bankInfo: bankInfoSchema,
  tags: z.array(tagSchema)
})

/**
 * 取引先フォームデータの型定義
 */
export type VendorFormData = z.infer<typeof vendorSchema>

/**
 * 取引先フォームの初期値
 */
export const defaultVendorFormData: VendorFormData = {
  name: '',
  email: '',
  phone: '',
  address: '',
  status: 'ACTIVE',
  category: '',
  bankInfo: {
    bankName: '',
    branchName: '',
    accountType: 'ORDINARY',
    accountNumber: '',
    accountHolder: ''
  },
  tags: []
} 