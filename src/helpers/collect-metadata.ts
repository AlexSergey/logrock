import type { StackMetadata } from '../types';

import { parseUserAgent } from './ua-parser';

const hasWindow = (): boolean => typeof window !== 'undefined';
const hasNavigator = (): boolean => typeof navigator !== 'undefined';

const getViewport = (): string => (hasWindow() ? `${window.innerWidth}x${window.innerHeight}` : '');

const getScreen = (): string => (hasWindow() && window.screen ? `${window.screen.width}x${window.screen.height}` : '');

const getDevicePixelRatio = (): number => (hasWindow() ? (window.devicePixelRatio ?? 1) : 1);

const getLanguage = (): string => (hasNavigator() ? navigator.language : '');

const getTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return '';
  }
};

const getMobile = (): boolean => {
  if (!hasNavigator()) return false;

  return navigator.maxTouchPoints > 1 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
};

const getUrl = (): string => (hasWindow() ? window.location.pathname : '');

const getFullUrl = (): string => (hasWindow() ? window.location.href : '');

export const collectMetadata = (): StackMetadata => ({
  ...parseUserAgent(hasNavigator() ? navigator.userAgent : ''),
  devicePixelRatio: getDevicePixelRatio(),
  fullUrl: getFullUrl(),
  language: getLanguage(),
  mobile: getMobile(),
  screen: getScreen(),
  timezone: getTimezone(),
  url: getUrl(),
  viewport: getViewport(),
});
