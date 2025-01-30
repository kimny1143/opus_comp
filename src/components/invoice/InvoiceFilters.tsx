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
  filters: InvoiceFilters;
  onFiltersChange: (filters: InvoiceFilters) => void;
}

export interface InvoiceFilters {
  search: string;
  status: InvoiceStatus | 'ALL';
  dateFrom: Date | null;
  dateTo: Date | null;
  minAmount?: number | null;
  maxAmount?: number | null;
}

export const InvoiceFilters: React.FC<InvoiceFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  const handleFilterChange = (
    key: keyof InvoiceFilters,
    value: string | InvoiceStatus | Date | null | number
  ) => {
    const newFilters = {
      ...filters,
      [key]: value,
    };
    onFiltersChange(newFilters);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <Label>検索</Label>
          <Input
            placeholder="取引先名で検索..."
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
              <SelectValue placeholder="ステータスを選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">すべて</SelectItem>
              {InvoiceStatusValues.map((status) => (
                <SelectItem key={status} value={status}>
                  {InvoiceStatusDisplay[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>開始日</Label>
          <DatePicker
            value={filters.dateFrom}
            onChange={(date) => handleFilterChange('dateFrom', date)}
          />
        </div>

        <div>
          <Label>終了日</Label>
          <DatePicker
            value={filters.dateTo}
            onChange={(date) => handleFilterChange('dateTo', date)}
          />
        </div>
      </div>
    </div>
  );
}; 