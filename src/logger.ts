import LimitedArray from './helpers/limited-array';
import { LogEntry, LoggerInstance, StackData } from './types';

/**
 * Types:
 * log
 * info
 * warn
 * error
 * debug
 * */

class Logger {
  public active = true;

  public stdout?: (level: string, message: string, important: boolean) => void;

  private _count = 0;

  private ignoreLogging = false;

  private stackCollection: LimitedArray<LogEntry>;

  constructor() {
    this.stackCollection = new LimitedArray<LogEntry>();
  }

  _handler(message: string, level: string, important: boolean): void {
    if (!this.ignoreLogging && this.active) {
      if (typeof this.stdout === 'function') {
        this.stdout(level, message, important);
      }

      let stackData: StackData | undefined;

      if (typeof message === 'string') {
        const temp: Record<string, string> = {};
        temp[level] = message;
        stackData = temp as StackData;
      } else if (typeof message === 'object') {
        stackData = message;
      }

      if (stackData) {
        this.stackCollection.add({ ...stackData });
      }
      this._count += 1;
    }
  }

  debug(message: string, important?: boolean): void {
    this._handler(message, 'debug', !!important);
  }

  error(message: string, important?: boolean): void {
    this._handler(message, 'error', !!important);
  }

  getCounter = (): number => this._count;

  getStackCollection = (): LimitedArray<LogEntry> => this.stackCollection;

  info(message: string, important?: boolean): void {
    this._handler(message, 'info', !!important);
  }

  log(message: string, important?: boolean): void {
    this._handler(message, 'log', !!important);
  }

  setUp(props: { active?: boolean; stdout?: (level: string, message: string, important?: boolean) => void }): void {
    if (typeof props.active === 'boolean') {
      this.active = Boolean(props.active);
    }
    if (typeof props.stdout === 'function') {
      this.stdout = props.stdout;
    }
  }

  warn(message: string, important?: boolean): void {
    this._handler(message, 'warn', !!important);
  }
}

export const createLogger = (): LoggerInstance => new Logger();

export const logger = createLogger();
