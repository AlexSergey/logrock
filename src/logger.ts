import LimitedArray from './helpers/limited-array';
import { LogEntry, LoggerInstance, LoggerLevels, Message, Stdout } from './types';

class Logger {
  public enabled = true;

  public stdout?: Stdout;

  private _count = 0;

  private stackCollection: LimitedArray<LogEntry>;

  constructor() {
    this.stackCollection = new LimitedArray<LogEntry>();
  }

  _handler(msg: Message, level: LoggerLevels, important: boolean, ctx = ''): void {
    if (!this.enabled) {
      return;
    }
    let message: string;
    let payload: Record<string, unknown> = {};
    if (typeof msg === 'object' && !(msg instanceof Error)) {
      message = msg.message || msg.msg || '';
      const rest = { ...msg };
      delete rest.message;
      delete rest.msg;
      payload = rest;
    } else if (msg instanceof Error) {
      message = msg.message;
    } else {
      message = msg;
    }
    if (typeof this.stdout === 'function') {
      this.stdout(level, message, ctx, important);
    }

    this.stackCollection.add({ ctx, level, message, payload });
    this._count += 1;
  }

  debug(message: Message, ctx?: string, important?: boolean): void {
    this._handler(message, LoggerLevels.debug, !!important, ctx);
  }

  error(message: Message, ctx?: string, important?: boolean): void {
    this._handler(message, LoggerLevels.error, !!important, ctx);
  }

  getCounter = (): number => this._count;

  getStackCollection = (): LimitedArray<LogEntry> => this.stackCollection;

  info(message: Message, ctx?: string, important?: boolean): void {
    this._handler(message, LoggerLevels.info, !!important, ctx);
  }

  log(message: Message, ctx?: string, important?: boolean): void {
    this._handler(message, LoggerLevels.log, !!important, ctx);
  }

  setUp(props: { enabled?: boolean; stdout?: Stdout }): void {
    if (typeof props.enabled === 'boolean') {
      this.enabled = Boolean(props.enabled);
    }
    if (typeof props.stdout === 'function') {
      this.stdout = props.stdout;
    }
  }

  warn(message: Message, ctx?: string, important?: boolean): void {
    this._handler(message, LoggerLevels.warn, !!important, ctx);
  }
}

export const createLogger = (): LoggerInstance => new Logger();

export const logger = createLogger();
