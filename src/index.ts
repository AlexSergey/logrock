export { type LoggerInstance, LoggerLevels, type Stack, type Stdout } from './types';

import { logger } from './logger';
import { LoggerContainer, useLoggerApi } from './logger-container';

// eslint-disable-next-line @import-lite/no-default-export
export default logger;
export { logger, LoggerContainer, useLoggerApi };
