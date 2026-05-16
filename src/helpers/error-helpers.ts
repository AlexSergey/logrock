import { LogEntry, LoggerLevels } from '../types';

const CRITICAL = 'critical';

export const isCritical = (type: string): boolean => CRITICAL === type;

export const getCritical = (): string => CRITICAL;

export const createCritical = (trace: Error, lineNumber: number): LogEntry => ({
  ctx: '',
  level: LoggerLevels.critical,
  message: trace.message,
  payload: {
    line: lineNumber,
    stack: trace.stack ? trace.stack.split('\n') : [],
  },
});
