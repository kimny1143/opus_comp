import { OrderStatus, StatusTransition } from '@/types/order-status';

export class OrderStatusManager {
  private static readonly ALLOWED_TRANSITIONS: StatusTransition[] = [
    {
      from: OrderStatus.DRAFT,
      to: OrderStatus.PENDING,
      requiredRole: ['CREATOR', 'MANAGER']
    },
    {
      from: OrderStatus.PENDING,
      to: OrderStatus.IN_PROGRESS,
      requiredRole: ['MANAGER', 'ADMIN']
    },
    // その他の遷移ルール...
  ];

  static canTransition(from: OrderStatus, to: OrderStatus, userRole: string): boolean {
    const transition = this.ALLOWED_TRANSITIONS.find(
      t => t.from === from && t.to === to
    );
    
    return !!transition && transition.requiredRole.includes(userRole);
  }
} 