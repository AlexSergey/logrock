import { createCritical, getCritical, isCritical, mixUrl, serializeError } from './error-helpers';
import { CriticalError } from './types';

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

describe('serializeError', () => {
  describe('negative cases', () => {
    it('returns an empty stack array when error.stack is undefined', () => {
      const error = new Error('no stack');
      error.stack = undefined as unknown as string;
      expect(serializeError(error, 1).stack).toEqual([]);
    });

    it('returns an empty message when error.message is empty', () => {
      expect(serializeError(new Error(''), 1).message).toBe('');
    });
  });

  describe('positive cases', () => {
    it('preserves the line number', () => {
      expect(serializeError(new Error('test'), 42).line).toBe(42);
    });

    it('preserves the error message', () => {
      expect(serializeError(new Error('something went wrong'), 1).message).toBe('something went wrong');
    });

    it('splits stack string on newlines', () => {
      const error = new Error('test');
      error.stack = 'Error: test\n  at foo (bar.js:1:1)\n  at baz (qux.js:2:2)';
      expect(serializeError(error, 1).stack).toEqual([
        'Error: test',
        '  at foo (bar.js:1:1)',
        '  at baz (qux.js:2:2)',
      ]);
    });

    it('returns a stack array with more than one entry for a real Error', () => {
      expect(serializeError(new Error('real'), 1).stack.length).toBeGreaterThan(1);
    });
  });
});

describe('mixUrl', () => {
  describe('positive cases', () => {
    it('adds url from location.href', () => {
      const input: CriticalError = { line: 1, message: 'msg', stack: [] };
      const result = mixUrl(input);
      expect(result).toHaveProperty('url', globalThis.location.href);
    });

    it('preserves all CriticalError fields', () => {
      const input: CriticalError = { line: 5, message: 'err', stack: ['line1', 'line2'] };
      const result = mixUrl(input);
      expect(result.line).toBe(5);
      expect(result.message).toBe('err');
      expect(result.stack).toEqual(['line1', 'line2']);
    });
  });
});

describe('createCritical', () => {
  describe('positive cases', () => {
    it('returns an object with a "critical" key', () => {
      expect(createCritical(new Error('boom'), 1)).toHaveProperty('critical');
    });

    it('critical entry contains the correct line number', () => {
      expect(createCritical(new Error('crash'), 99).critical.line).toBe(99);
    });

    it('critical entry contains the correct error message', () => {
      expect(createCritical(new Error('something failed'), 1).critical.message).toBe('something failed');
    });

    it('critical entry contains a stack array', () => {
      expect(Array.isArray(createCritical(new Error('test'), 1).critical.stack)).toBe(true);
    });
  });
});
