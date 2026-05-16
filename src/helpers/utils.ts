import type { Stack } from '../types';

export const clone = (obj: Stack): Stack => JSON.parse(JSON.stringify(obj)) as Stack;
