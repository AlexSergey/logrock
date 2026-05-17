type Pattern = [RegExp, string];

interface UaData {
  browser: string;
  browserVersion: string;
  os: string;
}

const BROWSERS: Pattern[] = [
  [/Edg\/(\d[\d.]*)/i, 'Edge'],
  [/OPR\/(\d[\d.]*)/i, 'Opera'],
  [/SamsungBrowser\/(\d[\d.]*)/i, 'Samsung Internet'],
  [/Firefox\/(\d[\d.]*)/i, 'Firefox'],
  [/Chrome\/(\d[\d.]*)/i, 'Chrome'],
  // eslint-disable-next-line regexp/no-super-linear-backtracking,regexp/optimal-quantifier-concatenation
  [/Version\/(\d[\d.]*).*Safari/i, 'Safari'],
  [/MSIE (\d[\d.]*)/i, 'IE'],
  [/Trident\/.*rv:(\d[\d.]*)/i, 'IE'],
];

// iOS must come before macOS — iOS UA contains "Mac OS X" as well
const OS_PATTERNS: Pattern[] = [
  [/Android (\d[\d.]*)/i, 'Android'],
  [/iPhone OS ([\d_]+)/i, 'iOS'],
  [/iPad.*CPU OS ([\d_]+)/i, 'iPadOS'],
  [/Windows NT ([\d.]+)/i, 'Windows'],
  [/Mac OS X ([\d_.]+)/i, 'macOS'],
  [/Linux/i, 'Linux'],
];

export const parseUserAgent = (ua: string): UaData => {
  let browser = 'Unknown';
  let browserVersion = '';

  for (const [pattern, name] of BROWSERS) {
    const match = pattern.exec(ua);
    if (match) {
      browser = name;
      browserVersion = match[1] ?? '';
      break;
    }
  }

  let os = 'Unknown';

  for (const [pattern, name] of OS_PATTERNS) {
    const match = pattern.exec(ua);
    if (match) {
      const version = match[1] ? match[1].replace(/_/g, '.') : '';
      os = version ? `${name} ${version}` : name;
      break;
    }
  }

  return { browser, browserVersion, os };
};
