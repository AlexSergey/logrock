import { IStack } from './types';

export const getCurrentDate = (): string => new Date().toLocaleString();

export const clone = (obj: IStack): IStack => JSON.parse(JSON.stringify(obj));
