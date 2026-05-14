import LimitedArray from "./limited-array.mjs";
describe('LimitedArray', () => {
  describe('negative cases', () => {
    it('uses default limit of 10 when constructed without options', () => {
      const arr = new LimitedArray();
      expect(arr.limit).toBe(10);
    });
    it('returns false from add when limit is not exceeded', () => {
      const arr = new LimitedArray({
        limit: 5
      });
      expect(arr.add(1)).toBe(false);
    });
    it('returns false from setLimit when length is within the new limit', () => {
      const arr = new LimitedArray({
        limit: 5
      });
      arr.add(1);
      expect(arr.setLimit(5)).toBe(false);
    });
    it('returns undefined for an out-of-bounds index', () => {
      const arr = new LimitedArray({
        limit: 5
      });
      expect(arr.at(100)).toBeUndefined();
    });
    it('ignores a falsy setLimit value and keeps the current limit', () => {
      const arr = new LimitedArray({
        limit: 5
      });
      arr.setLimit(0);
      expect(arr.limit).toBe(5);
    });
    it('getData returns an empty array when no items have been added', () => {
      const arr = new LimitedArray();
      expect(arr.getData()).toEqual([]);
    });
  });
  describe('positive cases', () => {
    it('initializes with the given limit', () => {
      const arr = new LimitedArray({
        limit: 20
      });
      expect(arr.limit).toBe(20);
    });
    it('uses the absolute value when limit is negative', () => {
      const arr = new LimitedArray({
        limit: -5
      });
      expect(arr.limit).toBe(5);
    });
    it('stores added items in insertion order', () => {
      const arr = new LimitedArray({
        limit: 5
      });
      arr.add(1);
      arr.add(2);
      expect(arr.getData()).toEqual([1, 2]);
    });
    it('returns true from add when the limit is exceeded', () => {
      const arr = new LimitedArray({
        limit: 2
      });
      arr.add(1);
      arr.add(2);
      expect(arr.add(3)).toBe(true);
    });
    it('evicts the oldest item when the limit is exceeded by one', () => {
      const arr = new LimitedArray({
        limit: 3
      });
      arr.add(1);
      arr.add(2);
      arr.add(3);
      arr.add(4);
      expect(arr.getData()).toEqual([2, 3, 4]);
    });
    it('evicts multiple oldest items when several exceed the limit', () => {
      const arr = new LimitedArray({
        limit: 3
      });
      [1, 2, 3, 4, 5].forEach(n => arr.add(n));
      expect(arr.getData()).toEqual([3, 4, 5]);
    });
    it('at returns the item at the given index', () => {
      const arr = new LimitedArray({
        limit: 5
      });
      arr.add(10);
      arr.add(20);
      expect(arr.at(0)).toBe(10);
      expect(arr.at(1)).toBe(20);
    });
    it('getLength returns the number of stored items', () => {
      const arr = new LimitedArray({
        limit: 5
      });
      arr.add(1);
      arr.add(2);
      expect(arr.getLength()).toBe(2);
    });
    it('getData returns a copy — pushing to it does not affect internal state', () => {
      const arr = new LimitedArray({
        limit: 5
      });
      arr.add(1);
      arr.getData().push(99);
      expect(arr.getLength()).toBe(1);
    });
    it('reset empties all stored items', () => {
      const arr = new LimitedArray({
        limit: 5
      });
      arr.add(1);
      arr.add(2);
      arr.reset();
      expect(arr.getLength()).toBe(0);
      expect(arr.getData()).toEqual([]);
    });
    it('setLimit evicts oldest items when the new limit is below current length', () => {
      const arr = new LimitedArray({
        limit: 5
      });
      [1, 2, 3, 4, 5].forEach(n => arr.add(n));
      arr.setLimit(3);
      expect(arr.getData()).toEqual([3, 4, 5]);
    });
    it('setLimit uses the absolute value for negative numbers', () => {
      const arr = new LimitedArray({
        limit: 10
      });
      arr.setLimit(-3);
      expect(arr.limit).toBe(3);
    });
    it('splice removes items starting at the given position', () => {
      const arr = new LimitedArray({
        limit: 5
      });
      [1, 2, 3, 4, 5].forEach(n => arr.add(n));
      arr.splice(1, 2);
      expect(arr.getData()).toEqual([1, 4, 5]);
    });
  });
});