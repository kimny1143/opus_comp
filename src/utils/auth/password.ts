import bcrypt from 'bcryptjs'

/**
 * パスワードをハッシュ化する
 * @param password ハッシュ化する平文パスワード
 * @returns ハッシュ化されたパスワード
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

/**
 * パスワードを比較する
 * @param password 平文パスワード
 * @param hashedPassword ハッシュ化されたパスワード
 * @returns パスワードが一致するかどうか
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword)
}