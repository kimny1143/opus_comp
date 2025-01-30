import { z } from 'zod'

export const signupSchema = z.object({
  email: z
    .string()
    .min(1, 'メールアドレスは必須です')
    .email('有効なメールアドレスを入力してください'),
  password: z
    .string()
    .min(8, 'パスワードは8文字以上で入力してください')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
      'パスワードは大文字、小文字、数字を含める必要があります'
    ),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'パスワードが一致しません',
  path: ['confirmPassword']
})

export type SignUpFormData = z.infer<typeof signupSchema> 