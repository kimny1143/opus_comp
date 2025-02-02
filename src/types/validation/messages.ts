import { z } from 'zod';

/**
 * サポートする言語の定義
 */
export const SUPPORTED_LANGUAGES = ['ja', 'en'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

/**
 * バリデーションメッセージのキー定義
 */
export type ValidationMessageKey =
  | 'required'
  | 'invalidFormat'
  | 'positiveNumber'
  | 'nonNegativeNumber'
  | 'integerNumber'
  | 'taxRate'
  | 'invalidDate'
  | 'futureDate'
  | 'pastDate'
  | 'invalidEmail'
  | 'invalidPhone'
  | 'invalidPassword'
  | 'invalidRegistrationNumber'
  | 'invalidRegistrationNumberFormat'
  | 'invalidRegistrationNumberCheckDigit'
  | 'invalidRegistrationNumberPattern'
  | 'invalidAccountNumber'
  | 'arrayMinLength'
  | 'invalidItemCategory';

/**
 * 多言語メッセージの定義
 */
export const validationMessages: Record<SupportedLanguage, Record<ValidationMessageKey, string>> = {
  ja: {
    required: '必須項目です',
    invalidFormat: '無効な形式です',
    positiveNumber: '0より大きい値を入力してください',
    nonNegativeNumber: '0以上の値を入力してください',
    integerNumber: '整数を入力してください',
    taxRate: '税率は8%(軽減税率)または10%以上100%以下である必要があります',
    invalidDate: '無効な日付です',
    futureDate: '未来の日付を指定してください',
    pastDate: '過去の日付を指定してください',
    invalidEmail: '有効なメールアドレスを入力してください',
    invalidPhone: '電話番号は数字とハイフンのみ使用できます',
    invalidPassword: 'パスワードは8文字以上で、大文字・小文字・数字を含める必要があります',
    invalidRegistrationNumber: '登録番号が無効です',
    invalidRegistrationNumberFormat: '登録番号はTで始まる13桁の数字である必要があります',
    invalidRegistrationNumberCheckDigit: '登録番号のチェックディジットが不正です',
    invalidRegistrationNumberPattern: '無効な登録番号パターンです',
    invalidAccountNumber: '口座番号は数字のみ使用できます',
    arrayMinLength: '1つ以上の項目が必要です',
    invalidItemCategory: '無効な品目カテゴリーです'
  },
  en: {
    required: 'This field is required',
    invalidFormat: 'Invalid format',
    positiveNumber: 'Please enter a value greater than 0',
    nonNegativeNumber: 'Please enter a value of 0 or greater',
    integerNumber: 'Please enter an integer',
    taxRate: 'Tax rate must be 8% (reduced rate) or between 10% and 100%',
    invalidDate: 'Invalid date',
    futureDate: 'Please specify a future date',
    pastDate: 'Please specify a past date',
    invalidEmail: 'Please enter a valid email address',
    invalidPhone: 'Phone number can only contain numbers and hyphens',
    invalidPassword: 'Password must be at least 8 characters and contain uppercase, lowercase, and numbers',
    invalidRegistrationNumber: 'Invalid registration number',
    invalidRegistrationNumberFormat: 'Registration number must start with T followed by 13 digits',
    invalidRegistrationNumberCheckDigit: 'Registration number has an invalid check digit',
    invalidRegistrationNumberPattern: 'Invalid registration number pattern',
    invalidAccountNumber: 'Account number can only contain numbers',
    arrayMinLength: 'At least one item is required',
    invalidItemCategory: 'Invalid item category'
  }
};

/**
 * 現在の言語設定
 */
let currentLanguage: SupportedLanguage = 'ja';

/**
 * 言語設定を変更する
 */
export const setLanguage = (language: SupportedLanguage) => {
  if (!SUPPORTED_LANGUAGES.includes(language)) {
    throw new Error(`Unsupported language: ${language}`);
  }
  currentLanguage = language;
};

/**
 * メッセージを取得する
 */
export const getMessage = (key: ValidationMessageKey): string => {
  return validationMessages[currentLanguage][key];
};

/**
 * Zodのエラーメッセージを生成する
 */
export const createZodMessage = (key: ValidationMessageKey) => ({
  message: getMessage(key)
});

/**
 * 登録番号のバリデーションエラーメッセージを生成する
 */
export const createRegistrationNumberError = (type: 'format' | 'checkDigit' | 'pattern') => {
  const messageKey = `invalidRegistrationNumber${type.charAt(0).toUpperCase() + type.slice(1)}` as ValidationMessageKey;
  return {
    message: getMessage(messageKey),
    code: z.ZodIssueCode.custom,
    path: ['registrationNumber']
  };
};