import { parseUserAgent } from './ua-parser';

describe('parseUserAgent', () => {
  describe('negative cases', () => {
    it('returns Unknown browser and os for an empty string', () => {
      const result = parseUserAgent('');
      expect(result.browser).toBe('Unknown');
      expect(result.browserVersion).toBe('');
      expect(result.os).toBe('Unknown');
    });

    it('returns Unknown browser and os for an unrecognised UA', () => {
      const result = parseUserAgent('SomeBot/2.0 (+http://example.com/bot)');
      expect(result.browser).toBe('Unknown');
      expect(result.os).toBe('Unknown');
    });
  });

  describe('positive cases', () => {
    it('detects Chrome on Windows', () => {
      const ua =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.71 Safari/537.36';
      const result = parseUserAgent(ua);
      expect(result.browser).toBe('Chrome');
      expect(result.browserVersion).toBe('120.0.6099.71');
      expect(result.os).toBe('Windows 10.0');
    });

    it('detects Firefox on macOS', () => {
      const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) Gecko/20100101 Firefox/117.0';
      const result = parseUserAgent(ua);
      expect(result.browser).toBe('Firefox');
      expect(result.browserVersion).toBe('117.0');
      expect(result.os).toBe('macOS 14.0');
    });

    it('detects Safari on macOS', () => {
      const ua =
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';
      const result = parseUserAgent(ua);
      expect(result.browser).toBe('Safari');
      expect(result.browserVersion).toBe('17.0');
      expect(result.os).toBe('macOS 10.15.7');
    });

    it('detects Edge on Windows', () => {
      const ua =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.2210.91';
      const result = parseUserAgent(ua);
      expect(result.browser).toBe('Edge');
      expect(result.browserVersion).toBe('120.0.2210.91');
      expect(result.os).toBe('Windows 10.0');
    });

    it('detects Opera on Windows', () => {
      const ua =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0';
      const result = parseUserAgent(ua);
      expect(result.browser).toBe('Opera');
      expect(result.browserVersion).toBe('106.0.0.0');
      expect(result.os).toBe('Windows 10.0');
    });

    it('detects Safari on iOS — prefers iOS over macOS in the UA', () => {
      const ua =
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
      const result = parseUserAgent(ua);
      expect(result.browser).toBe('Safari');
      expect(result.browserVersion).toBe('17.0');
      expect(result.os).toBe('iOS 17.0');
    });

    it('detects Chrome on Android', () => {
      const ua =
        'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
      const result = parseUserAgent(ua);
      expect(result.browser).toBe('Chrome');
      expect(result.browserVersion).toBe('120.0.0.0');
      expect(result.os).toBe('Android 13');
    });

    it('detects Linux OS without a version', () => {
      const ua =
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
      const result = parseUserAgent(ua);
      expect(result.os).toBe('Linux');
    });
  });
});
