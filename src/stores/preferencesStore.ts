import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SupportedLanguage, detectDeviceLanguage } from "@/i18n";

interface PreferencesStore {
  hapticsEnabled: boolean;
  reduceMotion: boolean;
  showNextStep: boolean;
  language: SupportedLanguage;
  setHapticsEnabled: (enabled: boolean) => void;
  setReduceMotion: (enabled: boolean) => void;
  setShowNextStep: (enabled: boolean) => void;
  setLanguage: (language: SupportedLanguage) => void;
}

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      hapticsEnabled: false,
      reduceMotion: false,
      showNextStep: false,
      // Na primeira instalação o idioma segue o aparelho; depois, a escolha do
      // usuário é preservada pela persistência.
      language: detectDeviceLanguage(),
      setHapticsEnabled: (hapticsEnabled) => set({ hapticsEnabled }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
      setShowNextStep: (showNextStep) => set({ showNextStep }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: "preferences-storage",
      storage: createJSONStorage(() => AsyncStorage),
      version: 2,
      // v1 -> v2: passa a existir o idioma. Instalações antigas mantêm o
      // idioma detectado do aparelho.
      migrate: (persisted) => {
        const state = (persisted ?? {}) as Partial<PreferencesStore>;
        return {
          hapticsEnabled: state.hapticsEnabled ?? false,
          reduceMotion: state.reduceMotion ?? false,
          showNextStep: state.showNextStep ?? false,
          language: state.language ?? detectDeviceLanguage(),
        };
      },
    }
  )
);
