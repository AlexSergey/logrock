import { render } from '@testing-library/react';

import { logger } from './logger';
import LoggerContainer, { useLoggerApi } from './logger-container';
import { IStack } from './types';

type LoggerApi = ReturnType<typeof useLoggerApi>;

let loggerApi: LoggerApi;
let level: string;
let message: string;
let stack: IStack;

beforeAll(() => {
  const App = (): null => {
    loggerApi = useLoggerApi();

    return null;
  };

  render(
    <LoggerContainer
      onError={(s): void => {
        stack = s;
      }}
      stdout={(l, m): void => {
        level = l;
        message = m;
      }}
    >
      <App />
    </LoggerContainer>,
  );
});

it('test useLogger hook', () => {
  expect(typeof logger.log === 'function').toBe(true);
  expect(typeof logger.info === 'function').toBe(true);
  expect(typeof logger.debug === 'function').toBe(true);
  expect(typeof logger.warn === 'function').toBe(true);
  expect(typeof logger.error === 'function').toBe(true);
});

(['log', 'info', 'debug', 'warn', 'error'] as const).forEach((logMethod) => {
  test(`test logger ${logMethod} method`, () => {
    logger[logMethod](`test ${logMethod} message`);

    expect(level).toBe(logMethod);
    expect(message).toBe(`test ${logMethod} message`);
  });
});

describe('test useLoggerApi', () => {
  test('test getStackData()', async () => {
    const { actions } = loggerApi.getStackData();

    expect(actions.length).toBe(5);
  });

  test('test onError callback', async () => {
    loggerApi.triggerError(loggerApi.getStackData());

    expect(stack.actions.length).toBe(5);
  });
});
