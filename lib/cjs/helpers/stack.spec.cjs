"use strict";

var _limitedArray = _interopRequireDefault(require("./limited-array.cjs"));
var _stack = require("./stack.cjs");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const makeStack = (overrides = {}) => ({
  actions: [],
  env: {},
  keyboardPressed: null,
  mousePressed: null,
  session: {
    end: '',
    start: '2024-01-01'
  },
  sessionId: undefined,
  ...overrides
});
describe('getStackData', () => {
  describe('negative cases', () => {
    it('does not throw when no props are provided', () => {
      expect(() => (0, _stack.getStackData)(makeStack(), new _limitedArray.default(), {})).not.toThrow();
    });
    it('does not call onPrepareStack when it is not provided', () => {
      const spy = jest.fn();
      (0, _stack.getStackData)(makeStack(), new _limitedArray.default(), {});
      expect(spy).not.toHaveBeenCalled();
    });
    it('sets env.lang to empty string when navigator is unavailable', () => {
      const original = globalThis.navigator;
      Object.defineProperty(globalThis, 'navigator', {
        configurable: true,
        value: null
      });
      const result = (0, _stack.getStackData)(makeStack(), new _limitedArray.default(), {});
      Object.defineProperty(globalThis, 'navigator', {
        configurable: true,
        value: original
      });
      expect(result.env.lang).toBe('');
    });
  });
  describe('positive cases', () => {
    it('populates env.href from location.href', () => {
      const result = (0, _stack.getStackData)(makeStack(), new _limitedArray.default(), {});
      expect(result.env.href).toBe(globalThis.location.href);
    });
    it('sets session.end from the getCurrentDate prop', () => {
      const result = (0, _stack.getStackData)(makeStack(), new _limitedArray.default(), {
        getCurrentDate: () => '2024-12-31'
      });
      expect(result.session.end).toBe('2024-12-31');
    });
    it('falls back to built-in getCurrentDate when prop is absent', () => {
      const result = (0, _stack.getStackData)(makeStack(), new _limitedArray.default(), {});
      expect(typeof result.session.end).toBe('string');
      expect(result.session.end.length).toBeGreaterThan(0);
    });
    it('populates actions from the collection', () => {
      const collection = new _limitedArray.default();
      collection.add({
        log: 'action-a'
      });
      collection.add({
        info: 'action-b'
      });
      const result = (0, _stack.getStackData)(makeStack(), collection, {});
      expect(result.actions).toContainEqual({
        log: 'action-a'
      });
      expect(result.actions).toContainEqual({
        info: 'action-b'
      });
    });
    it('reflects the latest state of the collection on each call', () => {
      const stack = makeStack();
      const collection = new _limitedArray.default();
      collection.add({
        log: 'first'
      });
      expect((0, _stack.getStackData)(stack, collection, {}).actions.length).toBe(1);
      collection.add({
        log: 'second'
      });
      expect((0, _stack.getStackData)(stack, collection, {}).actions.length).toBe(2);
    });
    it('calls onPrepareStack with the mutated stack', () => {
      const onPrepareStack = jest.fn(s => s);
      (0, _stack.getStackData)(makeStack(), new _limitedArray.default(), {
        onPrepareStack
      });
      expect(onPrepareStack).toHaveBeenCalledTimes(1);
      expect(onPrepareStack).toHaveBeenCalledWith(expect.objectContaining({
        actions: []
      }));
    });
    it('returns a clone — different reference from the original', () => {
      const stack = makeStack();
      const result = (0, _stack.getStackData)(stack, new _limitedArray.default(), {});
      expect(result).not.toBe(stack);
      expect(result.session).not.toBe(stack.session);
    });
    it('preserves sessionId in the returned clone', () => {
      const result = (0, _stack.getStackData)(makeStack({
        sessionId: 'my-id'
      }), new _limitedArray.default(), {});
      expect(result.sessionId).toBe('my-id');
    });
  });
});
describe('onCriticalError', () => {
  describe('positive cases', () => {
    it('adds a critical entry to the collection', () => {
      const collection = new _limitedArray.default();
      (0, _stack.onCriticalError)(makeStack(), collection, {}, new Error('boom'), 42);
      expect(collection.getData().some(i => 'critical' in i)).toBe(true);
    });
    it('critical entry has the correct line number', () => {
      const collection = new _limitedArray.default();
      (0, _stack.onCriticalError)(makeStack(), collection, {}, new Error('crash'), 100);
      const item = collection.getData().find(i => 'critical' in i);
      expect(item.critical.line).toBe(100);
    });
    it('critical entry has the correct error message', () => {
      const collection = new _limitedArray.default();
      (0, _stack.onCriticalError)(makeStack(), collection, {}, new Error('specific error'), 1);
      const item = collection.getData().find(i => 'critical' in i);
      expect(item.critical.message).toBe('specific error');
    });
    it('returns an Stack that includes the critical action', () => {
      const result = (0, _stack.onCriticalError)(makeStack(), new _limitedArray.default(), {}, new Error('test crash'), 1);
      expect(result.actions.some(i => 'critical' in i)).toBe(true);
    });
    it('passes props through to getStackData — calls onPrepareStack', () => {
      const onPrepareStack = jest.fn(s => s);
      (0, _stack.onCriticalError)(makeStack(), new _limitedArray.default(), {
        onPrepareStack
      }, new Error('err'), 1);
      expect(onPrepareStack).toHaveBeenCalledTimes(1);
    });
    it('uses custom getCurrentDate for session.end in the returned stack', () => {
      const result = (0, _stack.onCriticalError)(makeStack(), new _limitedArray.default(), {
        getCurrentDate: () => 'custom-date'
      }, new Error('err'), 1);
      expect(result.session.end).toBe('custom-date');
    });
  });
});