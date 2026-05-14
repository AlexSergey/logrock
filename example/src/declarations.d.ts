declare module '*.png' {
  const src: string;
  export default src;
}

declare module 'platform' {
  interface PlatformOs {
    architecture: number | null;
    family: string | null;
    version: string | null;
  }

  interface Platform {
    description: string | null;
    layout: string | null;
    manufacturer: string | null;
    name: string | null;
    os: PlatformOs | null;
    prerelease: string | null;
    product: string | null;
    ua: string | null;
    version: string | null;
  }

  const platform: Platform;
  export default platform;
}

declare module 'prismjs/components/prism-core' {
  export function highlight(text: string, grammar: Record<string, unknown>, language?: string): string;
  export const languages: Record<string, Record<string, unknown>>;
}

declare module 'prismjs/components/prism-clike' {}
declare module 'prismjs/components/prism-javascript' {}
declare module 'prismjs/themes/prism.css' {}
