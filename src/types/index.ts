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

export interface LogEntry {
  ctx: string;
  level: LoggerLevels;
  message: CriticalError | Message;
}

export interface LoggerInstance {
  debug(message: string, ctx?: string, important?: boolean): void;
  error(message: string, ctx?: string, important?: boolean): void;
  getCounter(): number;
  getStackCollection(): LimitedArray<LogEntry>;
  info(message: string, ctx?: string, important?: boolean): void;
  log(message: string, ctx?: string, important?: boolean): void;
  setUp(props: LoggerSetupOptions): void;
  warn(message: string, ctx?: string, important?: boolean): void;
}

export interface LoggerSetupOptions {
  active?: boolean;
  stdout?: Stdout;
}

export type Message = Record<string, string> | string;

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

export interface StackUtilProps {
  getCurrentDate?: () => string;
  onPrepareStack?: (stack: Stack) => Stack;
}

export type Stdout = (level: string, message: string, ctx: string, important: boolean) => void;
