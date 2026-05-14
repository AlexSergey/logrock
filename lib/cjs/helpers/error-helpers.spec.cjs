"use strict";

var _errorHelpers = require("./error-helpers.cjs");
describe('isCritical', () => {
  describe('negative cases', () => {
    it('returns false for standard log levels', () => {
      expect((0, _errorHelpers.isCritical)('log')).toBe(false);
      expect((0, _errorHelpers.isCritical)('info')).toBe(false);
      expect((0, _errorHelpers.isCritical)('warn')).toBe(false);
      expect((0, _errorHelpers.isCritical)('error')).toBe(false);
      expect((0, _errorHelpers.isCritical)('debug')).toBe(false);
    });
    it('returns false for empty string', () => {
      expect((0, _errorHelpers.isCritical)('')).toBe(false);
    });
    it('is case-sensitive', () => {
      expect((0, _errorHelpers.isCritical)('CRITICAL')).toBe(false);
      expect((0, _errorHelpers.isCritical)('Critical')).toBe(false);
    });
    it('returns false for partial matches', () => {
      expect((0, _errorHelpers.isCritical)('crit')).toBe(false);
      expect((0, _errorHelpers.isCritical)('criticall')).toBe(false);
    });
  });
  describe('positive cases', () => {
    it('returns true for "critical"', () => {
      expect((0, _errorHelpers.isCritical)('critical')).toBe(true);
    });
    it('returns true for the value returned by getCritical()', () => {
      expect((0, _errorHelpers.isCritical)((0, _errorHelpers.getCritical)())).toBe(true);
    });
  });
});
describe('getCritical', () => {
  describe('positive cases', () => {
    it('returns the string "critical"', () => {
      expect((0, _errorHelpers.getCritical)()).toBe('critical');
    });
  });
});
describe('serializeError', () => {
  describe('negative cases', () => {
    it('returns an empty stack array when error.stack is undefined', () => {
      const error = new Error('no stack');
      error.stack = undefined;
      expect((0, _errorHelpers.serializeError)(error, 1).stack).toEqual([]);
    });
    it('returns an empty message when error.message is empty', () => {
      expect((0, _errorHelpers.serializeError)(new Error(''), 1).message).toBe('');
    });
  });
  describe('positive cases', () => {
    it('preserves the line number', () => {
      expect((0, _errorHelpers.serializeError)(new Error('test'), 42).line).toBe(42);
    });
    it('preserves the error message', () => {
      expect((0, _errorHelpers.serializeError)(new Error('something went wrong'), 1).message).toBe('something went wrong');
    });
    it('splits stack string on newlines', () => {
      const error = new Error('test');
      error.stack = 'Error: test\n  at foo (bar.js:1:1)\n  at baz (qux.js:2:2)';
      expect((0, _errorHelpers.serializeError)(error, 1).stack).toEqual(['Error: test', '  at foo (bar.js:1:1)', '  at baz (qux.js:2:2)']);
    });
    it('returns a stack array with more than one entry for a real Error', () => {
      expect((0, _errorHelpers.serializeError)(new Error('real'), 1).stack.length).toBeGreaterThan(1);
    });
  });
});
describe('mixUrl', () => {
  describe('positive cases', () => {
    it('adds url from location.href', () => {
      const input = {
        line: 1,
        message: 'msg',
        stack: []
      };
      const result = (0, _errorHelpers.mixUrl)(input);
      expect(result).toHaveProperty('url', globalThis.location.href);
    });
    it('preserves all CriticalError fields', () => {
      const input = {
        line: 5,
        message: 'err',
        stack: ['line1', 'line2']
      };
      const result = (0, _errorHelpers.mixUrl)(input);
      expect(result.line).toBe(5);
      expect(result.message).toBe('err');
      expect(result.stack).toEqual(['line1', 'line2']);
    });
  });
});
describe('createCritical', () => {
  describe('positive cases', () => {
    it('returns an object with a "critical" key', () => {
      expect((0, _errorHelpers.createCritical)(new Error('boom'), 1)).toHaveProperty('critical');
    });
    it('critical entry contains the correct line number', () => {
      expect((0, _errorHelpers.createCritical)(new Error('crash'), 99).critical.line).toBe(99);
    });
    it('critical entry contains the correct error message', () => {
      expect((0, _errorHelpers.createCritical)(new Error('something failed'), 1).critical.message).toBe('something failed');
    });
    it('critical entry contains a stack array', () => {
      expect(Array.isArray((0, _errorHelpers.createCritical)(new Error('test'), 1).critical.stack)).toBe(true);
    });
  });
});