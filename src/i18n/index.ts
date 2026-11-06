import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

// Recursos de tradução
import ptBR from "./pt-BR.json";
import esMX from "./es-MX.json";

export const resources = {
  "pt-BR": { translation: ptBR },
  "es-MX": { translation: esMX },
} as const;

export type SupportedLanguage = keyof typeof resources;

const DEFAULT_LANGUAGE: SupportedLanguage = "pt-BR";

export const SUPPORTED_LANGUAGES: {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
}[] = [
  {
    code: "pt-BR",
    name: "Português (Brasil)",
    nativeName: "Português (Brasil)",
  },
  {
    code: "es-MX",
    name: "Español (México)",
    nativeName: "Español (México)",
  },
];

/**
 * Detecta o idioma do dispositivo e tenta correspondê-lo com um suportado.
 * Retorna o código do idioma suportado mais próximo.
 */
export function detectDeviceLanguage(): SupportedLanguage {
  try {
    const locales = Localization.getLocales();
    if (!locales || locales.length === 0) return DEFAULT_LANGUAGE;

    const deviceLocale = locales[0].languageTag;

    // Correspondência exata
    if (deviceLocale in resources) {
      return deviceLocale as SupportedLanguage;
    }

    // Correspondência por código de idioma (ex.: es-419, es-ES -> es-MX)
    const languageCode = deviceLocale.split("-")[0];
    const matched = SUPPORTED_LANGUAGES.find((lang) =>
      lang.code.startsWith(languageCode)
    );
    if (matched) return matched.code;

    return DEFAULT_LANGUAGE;
  } catch {
    // Se a detecção falhar, mantém o idioma padrão.
    return DEFAULT_LANGUAGE;
  }
}

/**
 * Verifica se um idioma é suportado.
 */
export function isLanguageSupported(code: string): code is SupportedLanguage {
  return code in resources;
}

/**
 * Idioma ativo.
 */
export function getCurrentLanguage(): SupportedLanguage {
  const language = i18n.language;
  if (isLanguageSupported(language)) return language;
  const languageCode = language?.split("-")[0];
  const matched = SUPPORTED_LANGUAGES.find((lang) =>
    lang.code.startsWith(languageCode ?? "")
  );
  return matched?.code ?? DEFAULT_LANGUAGE;
}

/**
 * Troca o idioma ativo (usado quando o usuário muda a preferência ou quando
 * a preferência persistida é reidratada).
 */
export async function changeLanguage(language: SupportedLanguage): Promise<void> {
  if (!isLanguageSupported(language)) return;
  if (i18n.language === language) return;
  await i18n.changeLanguage(language);
}

/**
 * Aplica um idioma específico. Sem argumento, apenas garante que o i18n
 * esteja pronto.
 */
export async function initI18n(language?: SupportedLanguage): Promise<void> {
  if (language) {
    await changeLanguage(language);
  }
}

// Inicialização síncrona: os recursos ficam disponíveis assim que o módulo é
// importado, evitando telas em branco antes da hidratação do armazenamento.
if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: detectDeviceLanguage(),
    fallbackLng: DEFAULT_LANGUAGE,
    compatibilityJSON: "v4",
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });
}

export { i18n };
export default i18n;
