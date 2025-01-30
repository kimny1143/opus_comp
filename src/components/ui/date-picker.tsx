'use client'

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { DayPicker } from 'react-day-picker';

type DatePickerProps = {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  error?: string;
  control?: Control<any>;
  name?: string;
};

export const DatePicker = React.forwardRef<HTMLDivElement, DatePickerProps>(
  function DatePicker(props, ref) {
    const { control, name, error } = props;

    if (control && name) {
      return (
        <div ref={ref}>
          <Controller
            control={control}
            name={name}
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${
                      error ? 'border-red-500' : ''
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value ? format(field.value, 'yyyy/MM/dd') : '日付を選択'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <DayPicker
                    mode="single"
                    selected={field.value || undefined}
                    onSelect={field.onChange}
                    initialFocus
                    required={false}
                  />
                </PopoverContent>
              </Popover>
            )}
          />
          {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
      );
    }

    const { value, onChange } = props;
    return (
      <div ref={ref}>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`w-full justify-start text-left font-normal ${
                error ? 'border-red-500' : ''
              }`}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value ? format(value, 'yyyy/MM/dd') : '日付を選択'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <DayPicker
              mode="single"
              selected={value || undefined}
              onSelect={(date) => onChange?.(date || null)}
              initialFocus
              required={false}
            />
          </PopoverContent>
        </Popover>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';
