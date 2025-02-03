import { describe, expect, it } from 'vitest';
import { InvoiceStatus, canTransitionTo } from '../status';
import { InvoiceStatusManager } from '../statusManager';
import { UserRole } from '../../auth/roles';

describe('Invoice Status Management', () => {
  describe('canTransitionTo', () => {
    it('should allow valid transitions', () => {
      expect(canTransitionTo('DRAFT', 'PENDING')).toBe(true);
      expect(canTransitionTo('PENDING', 'APPROVED')).toBe(true);
      expect(canTransitionTo('APPROVED', 'SENT')).toBe(true);
      expect(canTransitionTo('SENT', 'PAID')).toBe(true);
    });

    it('should not allow invalid transitions', () => {
      expect(canTransitionTo('DRAFT', 'PAID')).toBe(false);
      expect(canTransitionTo('PAID', 'DRAFT')).toBe(false);
      expect(canTransitionTo('REJECTED', 'APPROVED')).toBe(false);
    });

    it('should allow transition to REVIEWING from appropriate statuses', () => {
      expect(canTransitionTo('DRAFT', 'REVIEWING')).toBe(true);
      expect(canTransitionTo('PENDING', 'REVIEWING')).toBe(true);
      expect(canTransitionTo('REVIEWING', 'PENDING')).toBe(true);
    });
  });

  describe('InvoiceStatusManager', () => {
    describe('hasPermission', () => {
      it('should check permissions correctly for staff', () => {
        expect(InvoiceStatusManager.hasPermission('STAFF', 'approve')).toBe(false);
        expect(InvoiceStatusManager.hasPermission('STAFF', 'send')).toBe(false);
      });

      it('should check permissions correctly for manager', () => {
        expect(InvoiceStatusManager.hasPermission('MANAGER', 'approve')).toBe(true);
        expect(InvoiceStatusManager.hasPermission('MANAGER', 'reject')).toBe(true);
      });

      it('should check permissions correctly for accountant', () => {
        expect(InvoiceStatusManager.hasPermission('ACCOUNTANT', 'send')).toBe(true);
        expect(InvoiceStatusManager.hasPermission('ACCOUNTANT', 'pay')).toBe(true);
      });
    });

    describe('getNextPossibleStatuses', () => {
      it('should return correct statuses for staff', () => {
        const statuses = InvoiceStatusManager.getNextPossibleStatuses('DRAFT', 'STAFF');
        expect(statuses).toContain('PENDING');
        expect(statuses).not.toContain('APPROVED');
      });

      it('should return correct statuses for manager', () => {
        const statuses = InvoiceStatusManager.getNextPossibleStatuses('PENDING', 'MANAGER');
        expect(statuses).toContain('APPROVED');
        expect(statuses).toContain('REJECTED');
      });
    });

    describe('needsNotification', () => {
      it('should return true for status changes that need notification', () => {
        expect(InvoiceStatusManager.needsNotification('APPROVED')).toBe(true);
        expect(InvoiceStatusManager.needsNotification('PAID')).toBe(true);
        expect(InvoiceStatusManager.needsNotification('REJECTED')).toBe(true);
      });

      it('should return false for status changes that do not need notification', () => {
        expect(InvoiceStatusManager.needsNotification('DRAFT')).toBe(false);
        expect(InvoiceStatusManager.needsNotification('PENDING')).toBe(false);
        expect(InvoiceStatusManager.needsNotification('REVIEWING')).toBe(false);
      });
    });

    describe('isOverdue', () => {
      const pastDate = new Date('2024-01-01');
      const futureDate = new Date('2026-01-01');

      it('should return true for overdue invoices', () => {
        expect(InvoiceStatusManager.isOverdue('SENT', pastDate)).toBe(true);
      });

      it('should return false for non-overdue invoices', () => {
        expect(InvoiceStatusManager.isOverdue('SENT', futureDate)).toBe(false);
      });

      it('should return false for paid or overdue invoices', () => {
        expect(InvoiceStatusManager.isOverdue('PAID', pastDate)).toBe(false);
        expect(InvoiceStatusManager.isOverdue('OVERDUE', pastDate)).toBe(false);
      });
    });
  });
});