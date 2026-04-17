import { useMemo } from 'react';
import baseConfig from '@config';
import { configAr } from './translations';
import { useLang } from './LanguageContext';

/** Deep merge: b overrides a, but only for keys that exist in b */
function deepMerge(a, b) {
  if (!b) return a;
  if (typeof b !== 'object' || Array.isArray(b)) return b;
  const result = { ...a };
  for (const key of Object.keys(b)) {
    if (key in result && typeof result[key] === 'object' && !Array.isArray(result[key])) {
      result[key] = deepMerge(result[key], b[key]);
    } else {
      result[key] = b[key];
    }
  }
  return result;
}

/**
 * Returns the config object, merged with Arabic overrides when lang === 'ar'.
 * For English, returns the original config unchanged.
 */
export function useConfig() {
  const { lang } = useLang();
  return useMemo(() => {
    if (lang === 'ar') return deepMerge(baseConfig, configAr);
    return baseConfig;
  }, [lang]);
}
