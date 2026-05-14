import type { LoggerInstance, Stack } from "./types";

import { logger } from "./logger";
import LoggerContainer, { useLoggerApi } from "./logger-container";

export default logger;
export { LoggerContainer, LoggerInstance, Stack, useLoggerApi };
