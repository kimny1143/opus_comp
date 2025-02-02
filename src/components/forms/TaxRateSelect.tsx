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
import { getTaxRateOptions, TaxRate } from '@/types/tax';
import { cn } from '@/lib/utils';

interface TaxRateSelectProps {
  name: string;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const TaxRateSelect: React.FC<TaxRateSelectProps> = ({
  name,
  label = '税率',
  disabled = false,
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
              onValueChange={(value) => field.onChange(Number(value))}
              disabled={disabled}
            >
              <SelectTrigger
                id={name}
                className={cn(
                  'w-[180px]',
                  field.value === 8 && 'text-blue-600'
                )}
              >
                <SelectValue placeholder="税率を選択" />
              </SelectTrigger>
              <SelectContent>
                {options.map(option => (
                  <SelectItem
                    key={option.value}
                    value={option.value.toString()}
                    className={cn(
                      option.value === 8 && 'text-blue-600'
                    )}
                  >
                    {option.label}
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