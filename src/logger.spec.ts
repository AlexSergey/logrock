import { createLogger } from './logger';

describe('logger', () => {
  describe('negative cases', () => {
    it('does not add to the stack when disabled', () => {
      const logger = createLogger();
      logger.setUp({ enabled: false });
      const before = logger.getStackCollection().getData().length;
      (['log', 'info', 'debug', 'warn', 'error'] as const).forEach((method) => {
        logger[method](`test ${method}`);
      });
      expect(logger.getStackCollection().getData().length).toBe(before);
    });

    it('does not call stdout when disabled', () => {
      const logger = createLogger();
      const stdout = jest.fn();
      logger.setUp({ enabled: false, stdout });
      logger.log('test');
      expect(stdout).not.toHaveBeenCalled();
    });

    it('does not increment the counter when disabled', () => {
      const logger = createLogger();
      logger.setUp({ enabled: false });
      const before = logger.getCounter();
      logger.log('test');
      expect(logger.getCounter()).toBe(before);
    });

    it('does not change enabled state when setUp receives no enabled key', () => {
      const logger = createLogger();
      logger.setUp({ enabled: true });
      logger.setUp({});
      const before = logger.getCounter();
      logger.log('still active');
      expect(logger.getCounter()).toBe(before + 1);
    });

    it('does not change stdout when setUp receives no stdout key', () => {
      const logger = createLogger();
      const stdout = jest.fn();
      logger.setUp({ stdout });
      logger.setUp({});
      logger.log('msg');
      expect(stdout).toHaveBeenCalledTimes(1);
    });

    it('multiple logger instances do not share state', () => {
      const loggerA = createLogger();
      const loggerB = createLogger();
      loggerA.log('from-a');
      expect(loggerB.getStackCollection().getData()).not.toContainEqual(
        expect.objectContaining({ level: 'log', message: 'from-a' }),
      );
      expect(loggerB.getCounter()).toBe(0);
    });
  });

  describe('positive cases', () => {
    (['log', 'info', 'debug', 'warn', 'error'] as const).forEach((method) => {
      it(`logs ${method} with the correct level and message`, () => {
        const logger = createLogger();
        logger[method](`test ${method} method`);
        const items = logger.getStackCollection().getData();
        const last = items[items.length - 1]!;
        expect(last.level).toBe(method);
        expect(last).toStrictEqual({ ctx: '', level: method, message: `test ${method} method`, payload: {} });
      });
    });

    it('passes important: true to stdout', () => {
      const logger = createLogger();
      const stdout = jest.fn();
      logger.setUp({ stdout });
      logger.log('msg', undefined, true);
      expect(stdout).toHaveBeenCalledWith('log', 'msg', '', true);
    });

    it('passes important: false to stdout by default', () => {
      const logger = createLogger();
      const stdout = jest.fn();
      logger.setUp({ stdout });
      logger.log('msg');
      expect(stdout).toHaveBeenCalledWith('log', 'msg', '', false);
    });

    it('passes ctx to stdout when provided', () => {
      const logger = createLogger();
      const stdout = jest.fn();
      logger.setUp({ stdout });
      logger.log('msg', 'MyComponent');
      expect(stdout).toHaveBeenCalledWith('log', 'msg', 'MyComponent', false);
    });

    it('stores ctx in the log entry when provided', () => {
      const logger = createLogger();
      logger.log('msg', 'MyComponent');
      const items = logger.getStackCollection().getData();
      const last = items[items.length - 1]!;
      expect(last).toStrictEqual({ ctx: 'MyComponent', level: 'log', message: 'msg', payload: {} });
    });

    it('defaults ctx to empty string when not provided', () => {
      const logger = createLogger();
      logger.log('msg');
      const items = logger.getStackCollection().getData();
      const last = items[items.length - 1]!;
      expect(last).toStrictEqual({ ctx: '', level: 'log', message: 'msg', payload: {} });
    });

    it('starts counter at zero', () => {
      const logger = createLogger();
      expect(logger.getCounter()).toBe(0);
    });

    it('increments counter for every log call', () => {
      const logger = createLogger();
      logger.log('a');
      logger.info('b');
      logger.warn('c');
      expect(logger.getCounter()).toBe(3);
    });

    it('re-enables logging after setUp({ enabled: true })', () => {
      const logger = createLogger();
      logger.setUp({ enabled: false });
      logger.log('ignored');
      logger.setUp({ enabled: true });
      logger.log('logged');
      const items = logger.getStackCollection().getData();
      expect(items).toContainEqual({ ctx: '', level: 'log', message: 'logged', payload: {} });
      expect(items).not.toContainEqual({ ctx: '', level: 'log', message: 'ignored', payload: {} });
    });

    it('replaces stdout when setUp is called again with a new function', () => {
      const logger = createLogger();
      const first = jest.fn();
      const second = jest.fn();
      logger.setUp({ stdout: first });
      logger.log('first msg');
      logger.setUp({ stdout: second });
      logger.log('second msg');
      expect(first).toHaveBeenCalledTimes(1);
      expect(second).toHaveBeenCalledTimes(1);
    });

    it('evicts the oldest entry when the limit is exceeded', () => {
      const logger = createLogger();
      logger.getStackCollection().setLimit(2);
      logger.log('msg1');
      logger.log('msg2');
      logger.log('msg3');
      const items = logger.getStackCollection().getData();
      expect(items.length).toBe(2);
      expect(items).not.toContainEqual({ ctx: '', level: 'log', message: 'msg1', payload: {} });
      expect(items).toContainEqual({ ctx: '', level: 'log', message: 'msg3', payload: {} });
    });
  });
});
