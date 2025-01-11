'use client'

import { useState } from 'react';
import { InvoiceStatus } from '@prisma/client';
import { InvoiceStatusDisplay } from '@/types/enums';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} 
from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';

// InvoiceStatusの値を配列として取得
const InvoiceStatusValues = Object.values(InvoiceStatus).filter(
  (value): value is InvoiceStatus => typeof value === 'string'
);

interface InvoiceFiltersProps {
  onFilterChange: (filters: InvoiceFilters) => void;
}

export interface InvoiceFilters {
  search: string;
  status: InvoiceStatus | 'ALL';
  dateFrom: Date | null;
  dateTo: Date | null;
  minAmount: number | null;
  maxAmount: number | null;
}

export const InvoiceFilters: React.FC<InvoiceFiltersProps> = ({
  onFilterChange,
}) => {
  const [filters, setFilters] = useState<InvoiceFilters>({
    search: '',
    status: 'ALL',
    dateFrom: null,
    dateTo: null,
    minAmount: null,
    maxAmount: null,
  });

  const handleFilterChange = (
    key: keyof InvoiceFilters,
    value: string | InvoiceStatus | Date | null | number
  ) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <Label>検索</Label>
          <Input
            type="text"
            placeholder="請求書番号、取引先名など"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>

        <div>
          <Label>ステータス</Label>
          <Select
            value={filters.status}
            onValueChange={(value) => handleFilterChange('status', value as InvoiceStatus | 'ALL')}
          >
            <SelectTrigger>
              <SelectValue placeholder="全て" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">全て</SelectItem>
              {InvoiceStatusValues.map((status: InvoiceStatus) => (
                <SelectItem key={status} value={status}>
                  {InvoiceStatusDisplay[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>発行日（から）</Label>
          <DatePicker
            value={filters.dateFrom}
            onChange={(date: Date | null) => handleFilterChange('dateFrom', date)}
          />
        </div>

        <div>
          <Label>発行日（まで）</Label>
          <DatePicker
            value={filters.dateTo}
            onChange={(date: Date | null) => handleFilterChange('dateTo', date)}
          />
        </div>

        <div>
          <Label>金額（から）</Label>
          <Input
            type="number"
            placeholder="¥0"
            value={filters.minAmount || ''}
            onChange={(e) => handleFilterChange('minAmount', Number(e.target.value))}
          />
        </div>

        <div>
          <Label>金額（まで）</Label>
          <Input
            type="number"
            placeholder="¥999,999,999"
            value={filters.maxAmount || ''}
            onChange={(e) => handleFilterChange('maxAmount', Number(e.target.value))}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          onClick={() => {
            const defaultFilters = {
              search: '',
              status: 'ALL' as const,
              dateFrom: null,
              dateTo: null,
              minAmount: null,
              maxAmount: null,
            };
            setFilters(defaultFilters);
            onFilterChange(defaultFilters);
          }}
        >
          リセット
        </Button>
      </div>
    </div>
  );
}; 