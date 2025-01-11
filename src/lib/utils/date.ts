export function formatDate(date: Date | string | null): string {
  if (!date) return '-';
  
  try {
    let d: Date;
    if (typeof date === 'string') {
      d = new Date(date);
    } else if (date instanceof Date) {
      d = date;
    } else {
      return '-';
    }
    
    if (!isValidDate(d)) return '-';
    
    return d.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return '-';
  }
}

export function formatDateTime(date: Date | string | null): string {
  if (!date) return '-';
  
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '-';
    
    return d.toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('DateTime formatting error:', error);
    return '-';
  }
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime())
}

export function parseDate(dateString: string): Date | null {
  const date = new Date(dateString)
  return isValidDate(date) ? date : null
}

export function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function getFirstDayOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function getLastDayOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

export function getDaysDifference(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000 // ミリ秒単位での1日
  return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay))
}

export function isOverdue(dueDate: Date): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return dueDate < today
}

export function getRelativeDateString(date: Date): string {
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return '今日'
  if (diffDays === 1) return date > now ? '明日' : '昨日'
  if (diffDays <= 7) return `${diffDays}日${date > now ? '後' : '前'}`
  
  return formatDate(date)
} 