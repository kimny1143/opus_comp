import { describe, expect, it, beforeEach } from 'vitest';
import { setLanguage, getMessage, SUPPORTED_LANGUAGES } from '../messages';

describe('validation messages', () => {
  describe('language switching', () => {
    beforeEach(() => {
      // テストごとにデフォルト言語(日本語)に戻す
      setLanguage('ja');
    });

    it('should return Japanese messages by default', () => {
      expect(getMessage('required')).toBe('必須項目です');
      expect(getMessage('invalidRegistrationNumber')).toBe('登録番号が無効です');
    });

    it('should switch to English messages', () => {
      setLanguage('en');
      expect(getMessage('required')).toBe('This field is required');
      expect(getMessage('invalidRegistrationNumber')).toBe('Invalid registration number');
    });

    it('should throw error for unsupported language', () => {
      expect(() => setLanguage('fr' as any)).toThrow('Unsupported language');
    });

    it('should support all defined languages', () => {
      SUPPORTED_LANGUAGES.forEach(lang => {
        expect(() => setLanguage(lang)).not.toThrow();
      });
    });
  });

  describe('registration number messages', () => {
    it('should provide detailed error messages in Japanese', () => {
      setLanguage('ja');
      expect(getMessage('invalidRegistrationNumberFormat'))
        .toBe('登録番号はTで始まる13桁の数字である必要があります');
      expect(getMessage('invalidRegistrationNumberCheckDigit'))
        .toBe('登録番号のチェックディジットが不正です');
      expect(getMessage('invalidRegistrationNumberPattern'))
        .toBe('無効な登録番号パターンです');
    });

    it('should provide detailed error messages in English', () => {
      setLanguage('en');
      expect(getMessage('invalidRegistrationNumberFormat'))
        .toBe('Registration number must start with T followed by 13 digits');
      expect(getMessage('invalidRegistrationNumberCheckDigit'))
        .toBe('Registration number has an invalid check digit');
      expect(getMessage('invalidRegistrationNumberPattern'))
        .toBe('Invalid registration number pattern');
    });
  });

  describe('message consistency', () => {
    it('should have consistent messages across languages', () => {
      const messageKeys = [
        'required',
        'invalidFormat',
        'positiveNumber',
        'nonNegativeNumber',
        'integerNumber',
        'taxRate',
        'invalidDate',
        'futureDate',
        'pastDate',
        'invalidEmail',
        'invalidPhone',
        'invalidPassword',
        'invalidRegistrationNumber',
        'invalidRegistrationNumberFormat',
        'invalidRegistrationNumberCheckDigit',
        'invalidRegistrationNumberPattern',
        'invalidAccountNumber',
        'arrayMinLength'
      ] as const;

      SUPPORTED_LANGUAGES.forEach(lang => {
        setLanguage(lang);
        messageKeys.forEach(key => {
          const message = getMessage(key);
          expect(message).toBeDefined();
          expect(typeof message).toBe('string');
          expect(message.length).toBeGreaterThan(0);
        });
      });
    });
  });
});