import { collectMetadata } from './collect-metadata';

const ALL_KEYS = [
  'browser',
  'browserVersion',
  'devicePixelRatio',
  'fullUrl',
  'language',
  'mobile',
  'os',
  'screen',
  'timezone',
  'url',
  'viewport',
] as const;

describe('collectMetadata', () => {
  describe('negative cases', () => {
    it('returns an object containing all required keys', () => {
      const result = collectMetadata();
      for (const key of ALL_KEYS) {
        expect(result).toHaveProperty(key);
      }
    });

    it('mobile is false for a desktop user agent', () => {
      Object.defineProperty(navigator, 'maxTouchPoints', { configurable: true, value: 0 });
      const result = collectMetadata();
      expect(result.mobile).toBe(false);
    });
  });

  describe('positive cases', () => {
    it('viewport reflects window inner dimensions', () => {
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1512 });
      Object.defineProperty(window, 'innerHeight', { configurable: true, value: 982 });
      const result = collectMetadata();
      expect(result.viewport).toBe('1512x982');
    });

    it('screen reflects window.screen dimensions', () => {
      Object.defineProperty(window, 'screen', {
        configurable: true,
        value: { height: 1440, width: 2560 },
      });
      const result = collectMetadata();
      expect(result.screen).toBe('2560x1440');
    });

    it('devicePixelRatio reflects window.devicePixelRatio', () => {
      Object.defineProperty(window, 'devicePixelRatio', { configurable: true, value: 2 });
      const result = collectMetadata();
      expect(result.devicePixelRatio).toBe(2);
    });

    it('language reflects navigator.language', () => {
      Object.defineProperty(navigator, 'language', { configurable: true, value: 'en-US' });
      const result = collectMetadata();
      expect(result.language).toBe('en-US');
    });

    it('timezone is a non-empty string from Intl', () => {
      const result = collectMetadata();
      expect(typeof result.timezone).toBe('string');
      expect(result.timezone.length).toBeGreaterThan(0);
    });

    it('url reflects window.location.pathname', () => {
      const result = collectMetadata();
      expect(typeof result.url).toBe('string');
      expect(result.url).toBe(window.location.pathname);
    });

    it('fullUrl reflects window.location.href', () => {
      const result = collectMetadata();
      expect(typeof result.fullUrl).toBe('string');
      expect(result.fullUrl).toBe(window.location.href);
    });

    it('mobile is true when navigator.maxTouchPoints > 1', () => {
      Object.defineProperty(navigator, 'maxTouchPoints', { configurable: true, value: 5 });
      const result = collectMetadata();
      expect(result.mobile).toBe(true);
    });

    it('mobile is true for a mobile user agent', () => {
      Object.defineProperty(navigator, 'maxTouchPoints', { configurable: true, value: 0 });
      Object.defineProperty(navigator, 'userAgent', {
        configurable: true,
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
      });
      const result = collectMetadata();
      expect(result.mobile).toBe(true);
    });

    it('includes browser and os from the user agent', () => {
      Object.defineProperty(navigator, 'userAgent', {
        configurable: true,
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      });
      const result = collectMetadata();
      expect(result.browser).toBe('Chrome');
      expect(result.os).toBe('Windows 10.0');
    });
  });
});
