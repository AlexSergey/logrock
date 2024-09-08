import { logger } from './logger';
import LoggerContainer, { useLoggerApi } from './logger-container';
import type { ILogger, IStack } from './types';

// eslint-disable-next-line import/no-default-export
export default logger;
export { LoggerContainer, useLoggerApi, ILogger, IStack };
