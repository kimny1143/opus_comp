'use client';

import { Badge } from '@/components/ui/badge';
import { InvoiceStatus } from '@prisma/client';
import { InvoiceStatusDisplay } from '@/types/enums';
import { motion } from 'framer-motion';
import { useSettings } from '@/contexts/settings-context';
import { statusBadgeVariants, springTransition } from '@/lib/utils/animation';

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
}

const getStatusBadgeColor = (status: InvoiceStatus): string => {
  switch (status) {
    case InvoiceStatus.DRAFT:
      return 'bg-gray-200 text-gray-800';
    case InvoiceStatus.PENDING:
      return 'bg-yellow-200 text-yellow-800';
    case InvoiceStatus.APPROVED:
      return 'bg-green-200 text-green-800';
    case InvoiceStatus.PAID:
      return 'bg-purple-200 text-purple-800';
    case InvoiceStatus.REJECTED:
      return 'bg-red-200 text-red-800';
    case InvoiceStatus.OVERDUE:
      return 'bg-orange-200 text-orange-800';
    default:
      return 'bg-gray-200 text-gray-800';
  }
};

export function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  const { reducedMotion } = useSettings();

  if (reducedMotion) {
    return (
      <Badge 
        className={getStatusBadgeColor(status)} 
        data-testid={`status-${status}`}
      >
        {InvoiceStatusDisplay[status]}
      </Badge>
    );
  }

  return (
    <motion.div
      variants={statusBadgeVariants}
      initial="initial"
      animate="animate"
      transition={springTransition}
      whileHover="hover"
      whileTap="tap"
    >
      <Badge 
        className={getStatusBadgeColor(status)} 
        data-testid={`status-${status}`}
      >
        {InvoiceStatusDisplay[status]}
      </Badge>
    </motion.div>
  );
} 