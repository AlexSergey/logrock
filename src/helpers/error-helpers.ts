import { CriticalError, LogEntry, LoggerLevels } from '../types';

export const mixUrl = (props: CriticalError): CriticalError => {
  const href = globalThis && globalThis.location && globalThis.location.href ? globalThis.location.href : '';

  return { ...(href !== '' ? { url: href } : {}), ...props };
};

export const serializeError = (stack: Error, lineNumber: number): CriticalError => ({
  line: lineNumber,
  message: stack.message ?? '',
  stack: stack.stack ? stack.stack.split('\n') : [],
});

const CRITICAL = 'critical';

export const isCritical = (type: string): boolean => CRITICAL === type;

export const getCritical = (): string => CRITICAL;

export const createCritical = (trace: Error, lineNumber: number): LogEntry => {
  const criticalError: CriticalError = serializeError(trace, lineNumber);

  return {
    ctx: '',
    level: LoggerLevels.critical,
    message: mixUrl(criticalError),
  };
};
