import LimitedArray from 'limited-array';

export interface ILoggerProps {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/ban-types
  stdout?: Function | undefined;
}

export interface ILogger {
  log(message: string, important?: boolean): void;
  info(message: string, important?: boolean): void;
  debug(message: string, important?: boolean): void;
  warn(message: string, important?: boolean): void;
  error(message: string, important?: boolean): void;
  getCounter(): number;
  getStackCollection(): LimitedArray<IAction>;
  setUp(props: ILoggerProps): void;
}

export enum LoggerLevels {
  log = 'log',
  info = 'info',
  warn = 'warn',
  error = 'error',
  debug = 'debug',
  critical = 'critical',
}

export type CriticalError = {
  line: number;
  stack: string[];
  message: string;
  url?: string;
};

export interface IAction {
  [LoggerLevels.log]: string;
  [LoggerLevels.info]: string;
  [LoggerLevels.warn]: string;
  [LoggerLevels.error]: string;
  [LoggerLevels.debug]: string;
  [LoggerLevels.critical]: CriticalError;
}

export type StackData =
  | { [LoggerLevels.log]: string }
  | { [LoggerLevels.info]: string }
  | { [LoggerLevels.warn]: string }
  | { [LoggerLevels.error]: string }
  | { [LoggerLevels.debug]: string }
  | { [LoggerLevels.critical]: CriticalError };

export interface IStack {
  onPrepareStack?: (s: IStack) => IStack;
  session: {
    start: string;
    end: string;
  };
  env: {
    lang?: string;
    href?: string;
  };
  actions: IAction[];
  mousePressed: number | null;
  keyboardPressed: number | null;
  sessionId: number | string;
}

export interface IPropsUtils {
  getCurrentDate?: () => string;
  onPrepareStack?: (stack: IStack) => IStack;
}
