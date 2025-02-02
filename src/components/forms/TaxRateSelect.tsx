import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useFormContext } from 'react-hook-form';
import { getTaxRateOptions, TAX_RATES, type TaxRate } from '@/types/tax';
import { cn } from '@/lib/utils';

interface TaxRateSelectProps {
  name: string;
  label?: string;
  disabled?: boolean;
  category?: string;
  className?: string;
}

export const TaxRateSelect: React.FC<TaxRateSelectProps> = ({
  name,
  label = '税率',
  disabled = false,
  category,
  className
}) => {
  const form = useFormContext();
  const options = getTaxRateOptions();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn('space-y-1', className)}>
          <Label htmlFor={name}>{label}</Label>
          <FormControl>
            <Select
              value={field.value?.toString()}
              onValueChange={(value) => field.onChange(parseFloat(value))}
              disabled={disabled}
            >
              <SelectTrigger
                id={name}
                className={cn(
                  'w-[180px]',
                  field.value === TAX_RATES.REDUCED && 'text-blue-600',
                  field.value === TAX_RATES.STANDARD && 'text-gray-900'
                )}
              >
                <SelectValue placeholder="税率を選択" />
              </SelectTrigger>
              <SelectContent>
                {options.map(({ value, label }) => (
                  <SelectItem
                    key={value}
                    value={value.toString()}
                    className={cn(
                      value === TAX_RATES.REDUCED && 'text-blue-600',
                      value === TAX_RATES.STANDARD && 'text-gray-900',
                      category && value === TAX_RATES.REDUCED && 'font-semibold'
                    )}
                  >
                    {label}
                    {category && value === TAX_RATES.REDUCED && ' (適用対象)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default TaxRateSelect;