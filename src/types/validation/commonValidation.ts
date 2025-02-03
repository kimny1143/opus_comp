import { z } from 'zod';
import { AccountType } from '../bankAccount';
import { getMessage, createRegistrationNumberError } from './messages';
import { Prisma } from '@prisma/client';

/**
 * 数値関連の共通バリデーション
 */
const numberValidation = {
  quantity: z.number()
    .positive(getMessage('positiveNumber'))
    .int(getMessage('integerNumber')),
  
  taxRate: z.union([
    z.number(),
    z.string(),
    z.any().refine((val) => val instanceof Prisma.Decimal, {
      message: '税率は数値または文字列である必要があります'
    })
  ]).transform(val => 
    typeof val === 'string' ? parseFloat(val) : val
  ).refine(
    (value) => {
      if (value instanceof Prisma.Decimal) {
        return value.equals(new Prisma.Decimal(0.08)) || value.equals(new Prisma.Decimal(0.1));
      }
      return value === 0.08 || value === 0.1;
    },
    {
      message: '税率は8%(軽減税率)または10%である必要があります'
    }
  ).transform(value => {
    if (value instanceof Prisma.Decimal) return value;
    return new Prisma.Decimal(Number(value.toFixed(2)));
  }),
  
  price: z.number()
    .min(0, getMessage('nonNegativeNumber'))
    .transform(value => Number(value.toFixed(0))),
  
  amount: z.number()
    .min(0, getMessage('nonNegativeNumber'))
    .transform(value => Number(value.toFixed(0)))
};

/**
 * 日付関連の共通バリデーション
 */
const dateValidation = {
  required: z.date({
    required_error: getMessage('required'),
    invalid_type_error: getMessage('invalidDate')
  }),
  
  future: z.date()
    .min(new Date(), getMessage('futureDate')),
  
  past: z.date()
    .max(new Date(), getMessage('pastDate')),
  
  optional: z.date({
    invalid_type_error: getMessage('invalidDate')
  }).optional()
};

/**
 * 文字列関連の共通バリデーション
 */
const stringValidation = {
  required: z.string().min(1, getMessage('required')),
  optional: z.string().optional(),
  
  email: z.string()
    .email(getMessage('invalidEmail'))
    .optional()
    .or(z.literal('')),
  
  phone: z.string()
    .regex(/^[0-9-]*$/, getMessage('invalidPhone'))
    .optional(),
  
  description: z.string().optional(),
  
  password: z.string()
    .min(8, getMessage('invalidPassword'))
    .regex(/[A-Z]/, getMessage('invalidPassword'))
    .regex(/[a-z]/, getMessage('invalidPassword'))
    .regex(/[0-9]/, getMessage('invalidPassword')),
  
  registrationNumber: z.string()
    .regex(/^T\d{13}$/, createRegistrationNumberError('format'))
    .refine(
      (value) => {
        // すべて同じ数字でないことを確認(不正な番号の可能性が高い)
        const digits = value.slice(1);
        if (new Set(digits).size === 1) return false;
        
        // チェックディジットの検証
        const numericDigits = digits.split('').map(Number);
        const checkDigit = numericDigits.pop()!;
        
        // 1,2,1,2,1,2,1,2,1,2,1,2の重みを適用
        const weights = [1,2,1,2,1,2,1,2,1,2,1,2];
        const sum = numericDigits.reduce((acc, digit, index) => {
          const product = digit * weights[index];
          // 2桁になる場合は各桁を足す(例:7*2=14 → 1+4=5)
          return acc + (product >= 10 ? Math.floor(product/10) + (product%10) : product);
        }, 0);
        
        // 合計を9で割った余りを10から引いた値(10の場合は0)がチェックディジットと一致
        const calculatedCheck = (10 - (sum % 9)) % 10;
        return calculatedCheck === checkDigit;
      },
      createRegistrationNumberError('checkDigit')
    )
    .refine(
      (value) => {
        // 実在する可能性が低い番号パターンのチェック
        const patterns = [
          /^T0{13}$/,  // すべてゼロ
          /^T1{13}$/,  // すべて1
          /^T9{13}$/,  // すべて9
          /^T(\d)\1{12}$/  // 同じ数字の繰り返し
        ];
        return !patterns.some(pattern => pattern.test(value));
      },
      createRegistrationNumberError('pattern')
    ),
  
  accountNumber: z.string()
    .min(1, getMessage('required'))
    .regex(/^[0-9]+$/, getMessage('invalidAccountNumber'))
};

/**
 * 配列関連の共通バリデーション
 */
const arrayValidation = {
  nonEmpty: <T extends z.ZodTypeAny>(schema: T) => 
    z.array(schema).min(1, getMessage('arrayMinLength'))
};

/**
 * 共通のスキーマ定義
 */
const commonSchemas = {
  // タグのスキーマ
  tag: z.object({
    id: z.string().optional(),
    name: stringValidation.required
  }),

  // 銀行情報のスキーマ
  bankInfo: z.object({
    bankName: stringValidation.required,
    branchName: stringValidation.required,
    accountType: z.nativeEnum(AccountType),
    accountNumber: stringValidation.accountNumber,
    accountHolder: stringValidation.required
  }),

  // 明細行のスキーマ
  item: z.object({
    id: z.string().optional(),
    itemName: stringValidation.required,
    quantity: numberValidation.quantity,
    unitPrice: numberValidation.price,
    taxRate: numberValidation.taxRate,
    description: stringValidation.optional
  })
};

// メインのエクスポート
export const commonValidation = {
  number: numberValidation,
  date: dateValidation,
  string: stringValidation,
  array: arrayValidation,
  schemas: commonSchemas
};

// 型定義のエクスポート
export type Tag = z.infer<typeof commonSchemas.tag>;
export type BankInfo = z.infer<typeof commonSchemas.bankInfo>;
export type Item = z.infer<typeof commonSchemas.item>;

// 個別のエクスポートも維持(後方互換性のため)
export {
  numberValidation,
  dateValidation,
  stringValidation,
  arrayValidation,
  commonSchemas
};