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
import { 
  ItemCategory,
  ITEM_CATEGORY_LABELS,
  ITEM_CATEGORY_DESCRIPTIONS,
  getGroupedItemCategoryOptions,
  getCategoryGroup
} from '@/types/itemCategory';
import { cn } from '@/lib/utils';

interface ItemCategorySelectProps {
  name: string;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const ItemCategorySelect: React.FC<ItemCategorySelectProps> = ({
  name,
  label = '品目カテゴリー',
  disabled = false,
  className
}) => {
  const form = useFormContext();
  const options = getGroupedItemCategoryOptions();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn('space-y-1', className)}>
          <Label htmlFor={name}>{label}</Label>
          <FormControl>
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={disabled}
            >
              <SelectTrigger
                id={name}
                className={cn(
                  'w-[240px]',
                  field.value && getCategoryGroup(field.value as ItemCategory) === 'REDUCED_TAX' && 'text-blue-600',
                  field.value && getCategoryGroup(field.value as ItemCategory) === 'STANDARD_TAX' && 'text-gray-900'
                )}
              >
                <SelectValue placeholder="カテゴリーを選択" />
              </SelectTrigger>
              <SelectContent>
                {options.map(group => (
                  <div key={group.label} className="px-2 py-1.5">
                    <div className="text-sm font-semibold text-muted-foreground mb-1">
                      {group.label}
                    </div>
                    {group.options.map(option => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className={cn(
                          'relative pl-8',
                          group.label.includes('軽減税率') && 'text-blue-600',
                          !group.label.includes('軽減税率') && 'text-gray-900'
                        )}
                      >
                        <div>
                          <div>{option.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {option.description}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </div>
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

export default ItemCategorySelect;