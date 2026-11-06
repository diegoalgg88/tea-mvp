import { useMemo } from "react";
import i18n, { SupportedLanguage } from "@/i18n";

/**
 * Locales do Intl correspondentes a cada idioma suportado.
 */
const LOCALES: Record<SupportedLanguage, string> = {
  "pt-BR": "pt-BR",
  "es-MX": "es-MX",
};

/**
 * Hook para usar traduções no app.
 * Fornece a função t() para traduzir chaves e o locale ativo.
 */
export function useTranslation() {
  const t = useMemo(() => {
    return (key: string, options?: Record<string, string | number>) => {
      return i18n.t(key, options);
    };
  }, []);

  const currentLanguage = useMemo(
    () => (i18n.language as SupportedLanguage) ?? "pt-BR",
    [i18n.language]
  );

  const locale = useMemo(
    () => LOCALES[currentLanguage] ?? "pt-BR",
    [currentLanguage]
  );

  return { t, currentLanguage, locale };
}

export default useTranslation;
