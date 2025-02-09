'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { InvoiceWithVendor } from '@/types/invoice'

export default function InvoicePreviewPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      loadPdfPreview()
    }
  }, [status, router])

  const loadPdfPreview = async () => {
    try {
      const response = await fetch(`/api/invoices/${params.id}/pdf`, {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('PDFの生成に失敗しました')
      }

      // PDFデータをBlobとして取得
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setPdfUrl(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PDFの生成に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a')
      link.href = pdfUrl
      link.download = `invoice-${params.id}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  if (status === 'loading' || isLoading) {
    return <div className="container mx-auto px-4 py-8">読み込み中...</div>
  }

  if (status === 'unauthenticated') {
    return null
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <Button onClick={() => router.back()}>戻る</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">請求書プレビュー</h1>
        <div className="space-x-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            戻る
          </Button>
          <Button
            onClick={handleDownload}
            data-cy="download-pdf-button"
          >
            ダウンロード
          </Button>
        </div>
      </div>

      {pdfUrl && (
        <div className="w-full h-[800px] border border-gray-200 rounded-lg overflow-hidden">
          <iframe
            src={pdfUrl}
            className="w-full h-full"
            title="PDF Preview"
          />
        </div>
      )}
    </div>
  )
}