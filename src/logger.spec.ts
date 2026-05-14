import { createLogger } from './logger';

describe('logger', () => {
  describe('negative cases', () => {
    it('does not add to the stack when inactive', () => {
      const logger = createLogger();
      logger.setUp({ active: false });
      const before = logger.getStackCollection().getData().length;
      (['log', 'info', 'debug', 'warn', 'error'] as const).forEach((method) => {
        logger[method](`test ${method}`);
      });
      expect(logger.getStackCollection().getData().length).toBe(before);
    });

    it('does not call stdout when inactive', () => {
      const logger = createLogger();
      const stdout = jest.fn();
      logger.setUp({ active: false, stdout });
      logger.log('test');
      expect(stdout).not.toHaveBeenCalled();
    });

    it('does not increment the counter when inactive', () => {
      const logger = createLogger();
      logger.setUp({ active: false });
      const before = logger.getCounter();
      logger.log('test');
      expect(logger.getCounter()).toBe(before);
    });

    it('does not change active state when setUp receives no active key', () => {
      const logger = createLogger();
      logger.setUp({ active: true });
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
      expect(loggerB.getStackCollection().getData()).not.toContainEqual({ log: 'from-a' });
      expect(loggerB.getCounter()).toBe(0);
    });
  });

  describe('positive cases', () => {
    (['log', 'info', 'debug', 'warn', 'error'] as const).forEach((method) => {
      it(`logs ${method} with the correct key and value`, () => {
        const logger = createLogger();
        logger[method](`test ${method} method`);
        const items = logger.getStackCollection().getData();
        const last = items[items.length - 1]!;
        expect(Object.keys(last)[0]).toBe(method);
        expect(last).toStrictEqual({ [method]: `test ${method} method` });
      });
    });

    it('passes important: true to stdout', () => {
      const logger = createLogger();
      const stdout = jest.fn();
      logger.setUp({ stdout });
      logger.log('msg', true);
      expect(stdout).toHaveBeenCalledWith('log', 'msg', true);
    });

    it('passes important: false to stdout by default', () => {
      const logger = createLogger();
      const stdout = jest.fn();
      logger.setUp({ stdout });
      logger.log('msg');
      expect(stdout).toHaveBeenCalledWith('log', 'msg', false);
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

    it('re-enables logging after setUp({ active: true })', () => {
      const logger = createLogger();
      logger.setUp({ active: false });
      logger.log('ignored');
      logger.setUp({ active: true });
      logger.log('logged');
      const items = logger.getStackCollection().getData();
      expect(items).toContainEqual({ log: 'logged' });
      expect(items).not.toContainEqual({ log: 'ignored' });
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
      expect(items).not.toContainEqual({ log: 'msg1' });
      expect(items).toContainEqual({ log: 'msg3' });
    });
  });
});
