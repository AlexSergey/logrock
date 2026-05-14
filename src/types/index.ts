import LimitedArray from '../helpers/limited-array';

export enum LoggerLevels {
  critical = 'critical',
  debug = 'debug',
  error = 'error',
  info = 'info',
  log = 'log',
  warn = 'warn',
}

export interface CriticalError {
  line: number;
  message: string;
  stack: string[];
  url?: string;
}

export type LogEntry =
  | { [LoggerLevels.critical]: CriticalError }
  | { [LoggerLevels.debug]: string }
  | { [LoggerLevels.error]: string }
  | { [LoggerLevels.info]: string }
  | { [LoggerLevels.log]: string }
  | { [LoggerLevels.warn]: string };

export interface LoggerInstance {
  debug(message: string, important?: boolean): void;
  error(message: string, important?: boolean): void;
  getCounter(): number;
  getStackCollection(): LimitedArray<LogEntry>;
  info(message: string, important?: boolean): void;
  log(message: string, important?: boolean): void;
  setUp(props: LoggerSetupOptions): void;
  warn(message: string, important?: boolean): void;
}

export interface LoggerSetupOptions {
  active?: boolean;
  stdout?: (level: string, message: string, important?: boolean) => void;
}

export interface Stack {
  actions: LogEntry[];
  env: {
    href?: string;
    lang?: string;
  };
  keyboardPressed: null | string;
  mousePressed: null | number;
  onPrepareStack?: (s: Stack) => Stack;
  session: {
    end: string;
    start: string;
  };
  sessionId: number | string | undefined;
}

export type StackData =
  | { [LoggerLevels.critical]: CriticalError }
  | { [LoggerLevels.debug]: string }
  | { [LoggerLevels.error]: string }
  | { [LoggerLevels.info]: string }
  | { [LoggerLevels.log]: string }
  | { [LoggerLevels.warn]: string };

export interface StackUtilProps {
  getCurrentDate?: () => string;
  onPrepareStack?: (stack: Stack) => Stack;
}
