import { describe, expect, it } from 'vitest';
import { InvoiceStatus } from '@prisma/client';
import { InvoiceStatusManager, UserRole } from '../status';

describe('InvoiceStatusManager', () => {
  describe('validateTransition', () => {
    it('should allow valid transitions', () => {
      const validTransitions = [
        {
          from: InvoiceStatus.DRAFT,
          to: InvoiceStatus.PENDING
        },
        {
          from: InvoiceStatus.PENDING,
          to: InvoiceStatus.REVIEWING
        },
        {
          from: InvoiceStatus.REVIEWING,
          to: InvoiceStatus.APPROVED
        },
        {
          from: InvoiceStatus.APPROVED,
          to: InvoiceStatus.PAID
        }
      ];

      validTransitions.forEach(({ from, to }) => {
        expect(InvoiceStatusManager.validateTransition(from, to)).toBe(true);
      });
    });

    it('should reject invalid transitions', () => {
      const invalidTransitions = [
        {
          from: InvoiceStatus.DRAFT,
          to: InvoiceStatus.PAID
        },
        {
          from: InvoiceStatus.PAID,
          to: InvoiceStatus.DRAFT
        },
        {
          from: InvoiceStatus.APPROVED,
          to: InvoiceStatus.REVIEWING
        }
      ];

      invalidTransitions.forEach(({ from, to }) => {
        expect(InvoiceStatusManager.validateTransition(from, to)).toBe(false);
      });
    });
  });

  describe('hasPermission', () => {
    it('should allow users with correct permissions', () => {
      const cases = [
        {
          status: InvoiceStatus.DRAFT,
          roles: ['user' as UserRole],
          expected: true
        },
        {
          status: InvoiceStatus.REVIEWING,
          roles: ['admin' as UserRole],
          expected: true
        },
        {
          status: InvoiceStatus.OVERDUE,
          roles: ['system' as UserRole, 'admin' as UserRole],
          expected: true
        }
      ];

      cases.forEach(({ status, roles, expected }) => {
        expect(InvoiceStatusManager.hasPermission(status, roles)).toBe(expected);
      });
    });

    it('should reject users without correct permissions', () => {
      const cases = [
        {
          status: InvoiceStatus.REVIEWING,
          roles: ['user' as UserRole],
          expected: false
        },
        {
          status: InvoiceStatus.APPROVED,
          roles: ['user' as UserRole],
          expected: false
        },
        {
          status: InvoiceStatus.OVERDUE,
          roles: ['user' as UserRole],
          expected: false
        }
      ];

      cases.forEach(({ status, roles, expected }) => {
        expect(InvoiceStatusManager.hasPermission(status, roles)).toBe(expected);
      });
    });
  });

  describe('getNextPossibleStatuses', () => {
    it('should return correct next statuses for user role', () => {
      const userRoles: UserRole[] = ['user'];
      const nextStatuses = InvoiceStatusManager.getNextPossibleStatuses(
        InvoiceStatus.DRAFT,
        userRoles
      );

      expect(nextStatuses).toContain(InvoiceStatus.PENDING);
      expect(nextStatuses).not.toContain(InvoiceStatus.REVIEWING);
    });

    it('should return correct next statuses for admin role', () => {
      const adminRoles: UserRole[] = ['admin'];
      const nextStatuses = InvoiceStatusManager.getNextPossibleStatuses(
        InvoiceStatus.REVIEWING,
        adminRoles
      );

      expect(nextStatuses).toContain(InvoiceStatus.APPROVED);
      expect(nextStatuses).toContain(InvoiceStatus.REJECTED);
    });
  });

  describe('needsNotification', () => {
    it('should return true for statuses requiring notification', () => {
      const notificationStatuses = [
        InvoiceStatus.APPROVED,
        InvoiceStatus.REJECTED,
        InvoiceStatus.OVERDUE,
        InvoiceStatus.PAID
      ];

      notificationStatuses.forEach(status => {
        expect(InvoiceStatusManager.needsNotification(status)).toBe(true);
      });
    });

    it('should return false for statuses not requiring notification', () => {
      const nonNotificationStatuses = [
        InvoiceStatus.DRAFT,
        InvoiceStatus.PENDING,
        InvoiceStatus.REVIEWING
      ];

      nonNotificationStatuses.forEach(status => {
        expect(InvoiceStatusManager.needsNotification(status)).toBe(false);
      });
    });
  });

  describe('isOverdue', () => {
    it('should return true for past due dates', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      expect(InvoiceStatusManager.isOverdue(pastDate)).toBe(true);
    });

    it('should return false for future due dates', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      expect(InvoiceStatusManager.isOverdue(futureDate)).toBe(false);
    });
  });
});