import { describe, it, expect } from 'vitest'
import { createDecimalMock } from '@/test/helpers/mockDecimal'
import {
  toViewUpcomingPayment,
  toViewUpcomingPayments,
  createSuccessResponse,
  createErrorResponse,
  createUnauthorizedResponse,
  createValidationErrorResponse,
  createInternalErrorResponse
} from '../typeConverters'
import { DbUpcomingPayment } from '@/types/db/payment'
import { ViewUpcomingPayment } from '@/types/view/payment'
import { ApiErrorCode } from '@/types/base/api'

describe('typeConverters', () => {
  const mockDate = new Date('2025-01-30T00:00:00.000Z')
  
  describe('toViewUpcomingPayment', () => {
    it('DBの支払い予定をView形式に変換できる', () => {
      const dbPayment: DbUpcomingPayment = {
        id: '1',
        dueDate: mockDate,
        amount: createDecimalMock(10000),
        vendorName: 'テストベンダー'
      }

      const expected: ViewUpcomingPayment = {
        id: '1',
        dueDate: mockDate.toISOString(),
        amount: 10000,
        vendorName: 'テストベンダー'
      }

      const result = toViewUpcomingPayment(dbPayment)
      expect(result).toEqual(expected)
    })
  })

  describe('toViewUpcomingPayments', () => {
    it('複数の支払い予定をまとめて変換できる', () => {
      const dbPayments: DbUpcomingPayment[] = [
        {
          id: '1',
          dueDate: mockDate,
          amount: createDecimalMock(10000),
          vendorName: 'ベンダー1'
        },
        {
          id: '2',
          dueDate: mockDate,
          amount: createDecimalMock(20000),
          vendorName: 'ベンダー2'
        }
      ]

      const expected: ViewUpcomingPayment[] = [
        {
          id: '1',
          dueDate: mockDate.toISOString(),
          amount: 10000,
          vendorName: 'ベンダー1'
        },
        {
          id: '2',
          dueDate: mockDate.toISOString(),
          amount: 20000,
          vendorName: 'ベンダー2'
        }
      ]

      const result = toViewUpcomingPayments(dbPayments)
      expect(result).toEqual(expected)
    })

    it('空配列の場合は空配列を返す', () => {
      const result = toViewUpcomingPayments([])
      expect(result).toEqual([])
    })
  })

  describe('createSuccessResponse', () => {
    it('成功レスポンスを生成できる', () => {
      const data = { id: '1', name: 'test' }
      const result = createSuccessResponse(data)
      expect(result).toEqual({
        success: true,
        data
      })
    })
  })

  describe('createErrorResponse', () => {
    it('エラーレスポンスを生成できる', () => {
      const result = createErrorResponse(ApiErrorCode.INTERNAL_ERROR, 'エラーの詳細')
      expect(result).toEqual({
        success: false,
        error: 'システムエラーが発生しました',
        code: ApiErrorCode.INTERNAL_ERROR,
        details: 'エラーの詳細'
      })
    })

    it('詳細なしのエラーレスポンスを生成できる', () => {
      const result = createErrorResponse(ApiErrorCode.INTERNAL_ERROR)
      expect(result).toEqual({
        success: false,
        error: 'システムエラーが発生しました',
        code: ApiErrorCode.INTERNAL_ERROR,
        details: undefined
      })
    })
  })

  describe('createUnauthorizedResponse', () => {
    it('認証エラーレスポンスを生成できる', () => {
      const result = createUnauthorizedResponse()
      expect(result).toEqual({
        success: false,
        error: '認証が必要です',
        code: ApiErrorCode.UNAUTHORIZED
      })
    })
  })

  describe('createValidationErrorResponse', () => {
    it('バリデーションエラーレスポンスを生成できる', () => {
      const details = '入力値が不正です'
      const result = createValidationErrorResponse(details)
      expect(result).toEqual({
        success: false,
        error: '入力内容に誤りがあります',
        code: ApiErrorCode.VALIDATION_ERROR,
        details
      })
    })
  })

  describe('createInternalErrorResponse', () => {
    it('内部エラーレスポンスを生成できる', () => {
      const details = 'データベース接続エラー'
      const result = createInternalErrorResponse(details)
      expect(result).toEqual({
        success: false,
        error: 'システムエラーが発生しました',
        code: ApiErrorCode.INTERNAL_ERROR,
        details
      })
    })

    it('詳細なしの内部エラーレスポンスを生成できる', () => {
      const result = createInternalErrorResponse()
      expect(result).toEqual({
        success: false,
        error: 'システムエラーが発生しました',
        code: ApiErrorCode.INTERNAL_ERROR
      })
    })
  })
})