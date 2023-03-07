import { createLogger } from './logger';

describe('logger tests', () => {
  const logger = createLogger();

  beforeAll(() => {
    logger.setUp({
      active: true,
    });
  });

  describe('Test active logger', () => {
    ['log', 'info', 'debug', 'warn', 'error'].forEach((logMethod, index) => {
      it(`Logger test ${logMethod} method`, () => {
        logger[logMethod](`test ${logMethod} method`);
        const logItem = logger.getStackCollection().getData()[index];

        expect(Object.keys(logItem)[0]).toBe(logMethod);

        expect(logItem).toStrictEqual({ [logMethod]: `test ${logMethod} method` });
      });
    });
  });

  describe('Test no-active logger', () => {
    it('Logger test all methods', () => {
      logger.setUp({
        active: false,
      });
      const stackLengthBefore = logger.getStackCollection().getData().length;
      ['log', 'info', 'debug', 'warn', 'error'].forEach((logMethod) => {
        if (logger[logMethod] && typeof logger[logMethod] === 'function') {
          logger[logMethod](`test ${logMethod} method`);
        }
      });
      const stackLengthAfter = logger.getStackCollection().getData().length;

      expect(stackLengthBefore).toBe(stackLengthAfter);
    });
  });
});
