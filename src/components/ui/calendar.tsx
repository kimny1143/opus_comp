'use client'

import * as React from 'react';
import { DayPicker } from 'react-day-picker';
import { ja } from 'date-fns/locale';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={`p-3 ${className}`}
      locale={ja}
      {...props}
    />
  );
} 