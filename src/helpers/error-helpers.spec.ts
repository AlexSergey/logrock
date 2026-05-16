import { LoggerLevels } from '../types';
import { createCritical, getCritical, isCritical } from './error-helpers';

describe('isCritical', () => {
  describe('negative cases', () => {
    it('returns false for standard log levels', () => {
      expect(isCritical('log')).toBe(false);
      expect(isCritical('info')).toBe(false);
      expect(isCritical('warn')).toBe(false);
      expect(isCritical('error')).toBe(false);
      expect(isCritical('debug')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(isCritical('')).toBe(false);
    });

    it('is case-sensitive', () => {
      expect(isCritical('CRITICAL')).toBe(false);
      expect(isCritical('Critical')).toBe(false);
    });

    it('returns false for partial matches', () => {
      expect(isCritical('crit')).toBe(false);
      expect(isCritical('criticall')).toBe(false);
    });
  });

  describe('positive cases', () => {
    it('returns true for "critical"', () => {
      expect(isCritical('critical')).toBe(true);
    });

    it('returns true for the value returned by getCritical()', () => {
      expect(isCritical(getCritical())).toBe(true);
    });
  });
});

describe('getCritical', () => {
  describe('positive cases', () => {
    it('returns the string "critical"', () => {
      expect(getCritical()).toBe('critical');
    });
  });
});

describe('createCritical', () => {
  describe('positive cases', () => {
    it('returns an entry with level "critical"', () => {
      expect(createCritical(new Error('boom'), 1).level).toBe(LoggerLevels.critical);
    });

    it('returns an entry with empty ctx', () => {
      expect(createCritical(new Error('crash'), 99).ctx).toBe('');
    });

    it('message is the error string', () => {
      expect(createCritical(new Error('something failed'), 1).message).toBe('something failed');
    });

    it('payload contains the correct line number', () => {
      const entry = createCritical(new Error('crash'), 99);
      expect((entry.payload as { line: number }).line).toBe(99);
    });

    it('payload contains a stack array', () => {
      const entry = createCritical(new Error('test'), 1);
      expect(Array.isArray((entry.payload as { stack: unknown[] }).stack)).toBe(true);
    });
  });
});
