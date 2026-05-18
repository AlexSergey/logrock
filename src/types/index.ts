import type { LimitedArray } from '../helpers/limited-array';

export enum LoggerLevels {
  critical = 'critical',
  debug = 'debug',
  error = 'error',
  info = 'info',
  log = 'log',
  warn = 'warn',
}

export interface LogEntry {
  ctx: string;
  level: LoggerLevels;
  message: string;
  payload: Record<string, unknown>;
}

export interface LoggerInstance {
  debug: (message: Message, ctx?: string, important?: boolean) => void;
  error: (message: Message, ctx?: string, important?: boolean) => void;
  getCounter: () => number;
  getStackCollection: () => LimitedArray<LogEntry>;
  info: (message: Message, ctx?: string, important?: boolean) => void;
  log: (message: Message, ctx?: string, important?: boolean) => void;
  setUp: (props: LoggerSetupOptions) => void;
  warn: (message: Message, ctx?: string, important?: boolean) => void;
}

export interface LoggerSetupOptions {
  enabled?: boolean;
  stdout?: Stdout;
}

export type Message = Error | Record<string, string> | string;

export interface Stack {
  actions: LogEntry[];
  env: string;
  metadata: StackMetadata;
  timestamp: string;
  traceId: number | string | undefined;
}

export interface StackMetadata {
  browser: string;
  browserVersion: string;
  devicePixelRatio: number;
  fullUrl: string;
  language: string;
  mobile: boolean;
  os: string;
  screen: string;
  timezone: string;
  url: string;
  viewport: string;
}

export interface StackUtilProps {
  onPrepareStack?: (stack: Stack) => Stack;
  stdout?: Stdout;
}

export type Stdout = (level: LoggerLevels, message: string, ctx: string, important: boolean) => void;
