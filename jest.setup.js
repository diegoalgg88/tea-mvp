
// AsyncStorage em memória para testes: o mock oficial do pacote já cobre
// getItem/setItem/removeItem com um mapa descartável por arquivo de teste.
jest.mock(
  "@react-native-async-storage/async-storage",
  () => require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

// expo-localization não está disponível no ambiente de teste: fixa o locale
// pt-BR para que os textos traduzidos sejam determinísticos.
jest.mock("expo-localization", () => ({
  getLocales: () => [
    {
      languageTag: "pt-BR",
      languageCode: "pt",
      regionCode: "BR",
      textDirection: "ltr",
    },
  ],
}));
