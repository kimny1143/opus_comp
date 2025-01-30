import { PurchaseOrderStatus } from '@prisma/client';
import { StatusTransition } from '@/types/order-status';

export class OrderStatusManager {
  private static readonly ALLOWED_TRANSITIONS: StatusTransition[] = [
    {
      from: 'DRAFT',
      to: 'PENDING',
      requiredRole: ['CREATOR', 'MANAGER']
    },
    {
      from: 'PENDING',
      to: 'SENT',
      requiredRole: ['MANAGER', 'ADMIN']
    },
    {
      from: 'SENT',
      to: 'COMPLETED',
      requiredRole: ['MANAGER', 'ADMIN']
    },
    {
      from: 'PENDING',
      to: 'REJECTED',
      requiredRole: ['MANAGER', 'ADMIN']
    },
    {
      from: 'REJECTED',
      to: 'DRAFT',
      requiredRole: ['CREATOR', 'MANAGER']
    }
  ];

  static canTransition(from: PurchaseOrderStatus, to: PurchaseOrderStatus, userRole: string): boolean {
    const transition = this.ALLOWED_TRANSITIONS.find(
      t => t.from === from && t.to === to
    );
    
    return !!transition && transition.requiredRole.includes(userRole);
  }
} 