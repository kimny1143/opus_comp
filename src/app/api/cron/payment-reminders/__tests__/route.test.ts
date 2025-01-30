import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '../route'
import { sendPaymentDueReminders, sendOverdueReminders } from '@/lib/notification/payment-reminder'
import { createMockRequest } from '@/test/helpers/mockApi'

vi.mock('@/lib/notification/payment-reminder', () => ({
  sendPaymentDueReminders: vi.fn(),
  sendOverdueReminders: vi.fn()
}))

describe('POST /api/cron/payment-reminders', () => {
  const mockCronSecret = 'test-cron-secret'

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.CRON_SECRET = mockCronSecret
  })

  it('有効な認証トークンでリクエストが成功する', async () => {
    const request = createMockRequest({
      method: 'POST',
      headers: {
        authorization: `Bearer ${mockCronSecret}`
      }
    })

    vi.mocked(sendPaymentDueReminders).mockResolvedValue(undefined)
    vi.mocked(sendOverdueReminders).mockResolvedValue(undefined)

    const response = await POST(request)
    const data = await response.json()

    expect(data.success).toBe(true)
    expect(data.message).toBe('Payment reminders sent successfully')
    expect(sendPaymentDueReminders).toHaveBeenCalled()
    expect(sendOverdueReminders).toHaveBeenCalled()
  })

  it('認証トークンがない場合は401エラーが返される', async () => {
    const request = createMockRequest({
      method: 'POST'
    })

    const response = await POST(request)

    expect(response.status).toBe(401)
    expect(await response.text()).toBe('Unauthorized')
    expect(sendPaymentDueReminders).not.toHaveBeenCalled()
    expect(sendOverdueReminders).not.toHaveBeenCalled()
  })

  it('無効な認証トークンの場合は401エラーが返される', async () => {
    const request = createMockRequest({
      method: 'POST',
      headers: {
        authorization: 'Bearer invalid-token'
      }
    })

    const response = await POST(request)

    expect(response.status).toBe(401)
    expect(await response.text()).toBe('Unauthorized')
    expect(sendPaymentDueReminders).not.toHaveBeenCalled()
    expect(sendOverdueReminders).not.toHaveBeenCalled()
  })

  it('リマインダー送信エラー時に500エラーが返される', async () => {
    const request = createMockRequest({
      method: 'POST',
      headers: {
        authorization: `Bearer ${mockCronSecret}`
      }
    })

    const errorMessage = '支払い期限前のリマインダー送信に失敗しました'
    vi.mocked(sendPaymentDueReminders).mockRejectedValue(new Error(errorMessage))
    vi.mocked(sendOverdueReminders).mockResolvedValue(undefined)

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error).toBe(errorMessage)
  })

  it('両方のリマインダーが並行して送信される', async () => {
    const request = createMockRequest({
      method: 'POST',
      headers: {
        authorization: `Bearer ${mockCronSecret}`
      }
    })

    let dueRemindersCalled = false
    let overdueRemindersCalled = false

    vi.mocked(sendPaymentDueReminders).mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
      dueRemindersCalled = true
    })

    vi.mocked(sendOverdueReminders).mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 50))
      overdueRemindersCalled = true
    })

    const response = await POST(request)
    const data = await response.json()

    expect(data.success).toBe(true)
    expect(dueRemindersCalled).toBe(true)
    expect(overdueRemindersCalled).toBe(true)
  })
}) 