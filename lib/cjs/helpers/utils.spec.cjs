"use strict";

var _utils = require("./utils.cjs");
const makeStack = () => ({
  actions: [],
  env: {
    href: 'http://example.com',
    lang: 'en'
  },
  keyboardPressed: 'KeyA',
  mousePressed: 1,
  session: {
    end: '2024-01-02',
    start: '2024-01-01'
  },
  sessionId: 'test-session'
});
describe('getCurrentDate', () => {
  describe('positive cases', () => {
    it('returns a non-empty string', () => {
      const result = (0, _utils.getCurrentDate)();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
describe('clone', () => {
  describe('negative cases', () => {
    it('returns a different reference from the original', () => {
      const stack = makeStack();
      expect((0, _utils.clone)(stack)).not.toBe(stack);
    });
    it('nested objects are separate references', () => {
      const stack = makeStack();
      const cloned = (0, _utils.clone)(stack);
      expect(cloned.session).not.toBe(stack.session);
      expect(cloned.env).not.toBe(stack.env);
      expect(cloned.actions).not.toBe(stack.actions);
    });
    it('strips function properties via JSON serialization', () => {
      const stack = {
        ...makeStack(),
        onPrepareStack: s => s
      };
      const cloned = (0, _utils.clone)(stack);
      expect(cloned.onPrepareStack).toBeUndefined();
    });
    it('mutations to clone do not affect the original', () => {
      const stack = makeStack();
      const cloned = (0, _utils.clone)(stack);
      cloned.session.start = 'mutated';
      expect(stack.session.start).toBe('2024-01-01');
    });
  });
  describe('positive cases', () => {
    it('deep clones primitive fields', () => {
      const stack = makeStack();
      const cloned = (0, _utils.clone)(stack);
      expect(cloned.sessionId).toBe(stack.sessionId);
      expect(cloned.mousePressed).toBe(stack.mousePressed);
      expect(cloned.keyboardPressed).toBe(stack.keyboardPressed);
    });
    it('deep clones session', () => {
      const stack = makeStack();
      expect((0, _utils.clone)(stack).session).toEqual(stack.session);
    });
    it('deep clones env', () => {
      const stack = makeStack();
      expect((0, _utils.clone)(stack).env).toEqual(stack.env);
    });
    it('deep clones actions including nested objects', () => {
      const stack = {
        ...makeStack(),
        actions: [{
          log: 'test'
        }]
      };
      const cloned = (0, _utils.clone)(stack);
      expect(cloned.actions).toEqual(stack.actions);
      expect(cloned.actions[0]).not.toBe(stack.actions[0]);
    });
  });
});