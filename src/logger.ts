import LimitedArray from './helpers/limited-array';
import { LogEntry, LoggerInstance, LoggerLevels, Stdout } from './types';

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

  public stdout?: Stdout;

  private _count = 0;

  private ignoreLogging = false;

  private stackCollection: LimitedArray<LogEntry>;

  constructor() {
    this.stackCollection = new LimitedArray<LogEntry>();
  }

  _handler(message: string, level: LoggerLevels, important: boolean, ctx = ''): void {
    if (!this.ignoreLogging && this.active) {
      if (typeof this.stdout === 'function') {
        this.stdout(level, message, ctx, important);
      }

      this.stackCollection.add({ ctx, level, message });
      this._count += 1;
    }
  }

  debug(message: string, ctx?: string, important?: boolean): void {
    this._handler(message, LoggerLevels.debug, !!important, ctx);
  }

  error(message: string, ctx?: string, important?: boolean): void {
    this._handler(message, LoggerLevels.error, !!important, ctx);
  }

  getCounter = (): number => this._count;

  getStackCollection = (): LimitedArray<LogEntry> => this.stackCollection;

  info(message: string, ctx?: string, important?: boolean): void {
    this._handler(message, LoggerLevels.info, !!important, ctx);
  }

  log(message: string, ctx?: string, important?: boolean): void {
    this._handler(message, LoggerLevels.log, !!important, ctx);
  }

  setUp(props: { active?: boolean; stdout?: Stdout }): void {
    if (typeof props.active === 'boolean') {
      this.active = Boolean(props.active);
    }
    if (typeof props.stdout === 'function') {
      this.stdout = props.stdout;
    }
  }

  warn(message: string, ctx?: string, important?: boolean): void {
    this._handler(message, LoggerLevels.warn, !!important, ctx);
  }
}

export const createLogger = (): LoggerInstance => new Logger();

export const logger = createLogger();
