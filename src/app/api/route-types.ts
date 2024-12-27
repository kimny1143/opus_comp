import { NextRequest, NextResponse } from 'next/server'

// 基本的なパラメータ型
export type RouteParams = {
  [key: string]: string | string[]
}

// 共通のRoute Handler型を定義
export type RouteContext<T = RouteParams> = {
  params: T
}

// よく使うパラメータパターン
export type IdParams = { id: string }
export type InvoiceIdParams = { invoiceId: string }

// Route Handler関数の型
export type RouteHandler<T = RouteParams> = (
  request: NextRequest,
  context: RouteContext<T>
) => Promise<NextResponse> | NextResponse

// 型チェック用のヘルパー
export type ParamCheck<T> = T extends RouteContext<infer P> ? P : RouteParams

// 型ガード関数
export function isIdRouteContext(context: RouteContext<any>): context is RouteContext<IdParams> {
  return typeof context.params?.id === 'string'
}

export function isInvoiceIdRouteContext(context: RouteContext<any>): context is RouteContext<InvoiceIdParams> {
  return typeof context.params?.invoiceId === 'string'
}

// ルートコンテキストの型エイリアス
export type IdRouteContext = RouteContext<IdParams>
export type InvoiceIdRouteContext = RouteContext<InvoiceIdParams> 