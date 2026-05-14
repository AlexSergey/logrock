interface LimitedArrayOptions {
  limit: number;
}

const DEFAULT_LIMIT = 10;

export default class LimitedArray<T> {
  public data: T[] = [];
  public limit = 0;

  constructor(options?: LimitedArrayOptions) {
    this.limit = options && typeof options.limit === 'number' ? Math.abs(options.limit) : DEFAULT_LIMIT;
  }

  add(item: T): boolean {
    this.data.push(item);

    return this.trimToLimit();
  }

  at(index: number): T | undefined {
    return this.data[index];
  }

  getData(): T[] {
    return this.data.map((item) => item);
  }

  getLength(): number {
    return this.data.length;
  }

  reset(): void {
    this.data = [];
  }

  setLimit(limit: number): boolean {
    this.limit = limit && typeof limit === 'number' ? Math.abs(limit) : this.limit;

    return this.trimToLimit();
  }

  splice(from: number, to: number): void {
    this.data.splice(from, to);
  }

  private trimToLimit(): boolean {
    const excess = this.data.length - this.limit;
    if (excess <= 0) return false;
    this.data.splice(0, excess);

    return true;
  }
}
