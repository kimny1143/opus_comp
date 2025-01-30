import bcrypt from 'bcryptjs'
import { vi } from 'vitest'

/**
 * パスワードをハッシュ化する
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

/**
 * パスワードを検証する
 */
export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// テスト用のモック関数
export const mockCrypto = {
  hashPassword: vi.fn(),
  comparePassword: vi.fn()
} 
