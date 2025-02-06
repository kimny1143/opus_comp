/**
 * APIエラーコードの列挙型
 */
export enum ApiErrorCode {
  INVALID_INPUT = "INVALID_INPUT",
  DATABASE_ERROR = "DATABASE_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
  UNAUTHORIZED = "UNAUTHORIZED"
}

/**
 * エラーコードとメッセージのマッピング
 */
export const ApiErrorMessage: Record<ApiErrorCode, string> = {
  [ApiErrorCode.INVALID_INPUT]: "入力データが不正です",
  [ApiErrorCode.DATABASE_ERROR]: "データベースエラーが発生しました",
  [ApiErrorCode.VALIDATION_ERROR]: "データの検証エラーが発生しました",
  [ApiErrorCode.INTERNAL_ERROR]: "Internal server error",
  [ApiErrorCode.UNKNOWN_ERROR]: "不明なエラーが発生しました",
  [ApiErrorCode.UNAUTHORIZED]: "認証が必要です"
};

/**
 * 基本APIレスポンス型
 */
export interface BaseApiResponse {
  success: boolean;
}

/**
 * 基本API成功レスポンス型
 */
export interface BaseApiSuccessResponse<T> extends BaseApiResponse {
  success: true;
  data: T;
}

/**
 * 基本APIエラーレスポンス型
 */
export interface BaseApiErrorResponse extends BaseApiResponse {
  success: false;
  error: string;
  details?: string;
  code: ApiErrorCode;
}

/**
 * APIエラーレスポンスを作成
 * @param code エラーコード
 * @param details エラーの詳細(オプション)
 */
export const createApiError = (
  code: ApiErrorCode,
  details?: string
): BaseApiErrorResponse => ({
  success: false,
  error: ApiErrorMessage[code],
  details,
  code
});