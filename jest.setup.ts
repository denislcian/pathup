import i18n from '@/i18n';

jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock(
  'react-native-safe-area-context',
  () => jest.requireActual('react-native-safe-area-context/jest/mock').default,
);

// The expo-localization mock reports English; tests assert the Spanish copy the app ships first.
beforeAll(async () => {
  await i18n.changeLanguage('es');
});
