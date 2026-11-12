import en from './en.json';

export type TranslationKey = string;

export function t(path: string, fallback?: string): string {
  const parts = path.split('.');
  let current: any = en;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return fallback || path;
    }
  }

  return typeof current === 'string' ? current : fallback || path;
}

