const DEFAULT_LIMIT = 10;
export default class LimitedArray {
  data = [];
  limit = 0;
  constructor(options) {
    this.limit = options && typeof options.limit === 'number' ? Math.abs(options.limit) : DEFAULT_LIMIT;
  }
  add(item) {
    this.data.push(item);
    return this.trimToLimit();
  }
  at(index) {
    return this.data[index];
  }
  getData() {
    return this.data.map(item => item);
  }
  getLength() {
    return this.data.length;
  }
  reset() {
    this.data = [];
  }
  setLimit(limit) {
    this.limit = limit && typeof limit === 'number' ? Math.abs(limit) : this.limit;
    return this.trimToLimit();
  }
  splice(from, to) {
    this.data.splice(from, to);
  }
  trimToLimit() {
    const excess = this.data.length - this.limit;
    if (excess <= 0) return false;
    this.data.splice(0, excess);
    return true;
  }
}