export type { LoggerInstance, Stack } from './types';

import { logger } from './logger';
import { LoggerContainer, useLoggerApi } from './logger-container';

// eslint-disable-next-line @import-lite/no-default-export
export default logger;
export { LoggerContainer, useLoggerApi };
