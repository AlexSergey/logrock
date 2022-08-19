import LimitedArray from 'limited-array';

export interface LoggerProps {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/ban-types
  stdout?: Function | undefined;
}

export interface LoggerInterface {
  log(message: string, important?: boolean): void;
  info(message: string, important?: boolean): void;
  debug(message: string, important?: boolean): void;
  warn(message: string, important?: boolean): void;
  error(message: string, important?: boolean): void;
  getCounter(): number;
  getStackCollection(): LimitedArray<Action>;
  setUp(props: LoggerProps): void;
}

export enum LoggerLevels {
  log = 'log',
  info = 'info',
  warn = 'warn',
  error = 'error',
  debug = 'debug',
  critical = 'critical'
}

export type CriticalError = {
  line: number;
  stack: string[];
  message: string;
  url?: string;
};

export interface Action {
  [LoggerLevels.log]: string;
  [LoggerLevels.info]: string;
  [LoggerLevels.warn]: string;
  [LoggerLevels.error]: string;
  [LoggerLevels.debug]: string;
  [LoggerLevels.critical]: CriticalError;
}

export type StackData = { [LoggerLevels.log]: string } |
{ [LoggerLevels.info]: string } |
{ [LoggerLevels.warn]: string } |
{ [LoggerLevels.error]: string } |
{ [LoggerLevels.debug]: string } |
{ [LoggerLevels.critical]: CriticalError };

export interface Stack {
  onPrepareStack?: (s: Stack) => Stack;
  session: {
    start: string;
    end: string;
  };
  env: {
    lang?: string;
    href?: string;
  };
  actions: Action[];
  mousePressed: number | null;
  keyboardPressed: number | null;
  sessionId: number | string;
}

export interface PropsUtils {
  getCurrentDate?: () => string;
  onPrepareStack?: (stack: Stack) => Stack;
}
