globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
  },
  useLocalSearchParams: jest.fn(() => ({})),
}));

jest.mock('expo-file-system/legacy', () => ({
  copyAsync: jest.fn(),
  documentDirectory: 'file:///test-documents/',
  makeDirectoryAsync: jest.fn(),
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
}));

jest.mock('expo-location', () => ({
  Accuracy: {
    Balanced: 3,
  },
  PermissionStatus: {
    DENIED: 'denied',
    GRANTED: 'granted',
    UNDETERMINED: 'undetermined',
  },
  getCurrentPositionAsync: jest.fn(),
  hasServicesEnabledAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
}));

jest.mock('react-native-webview', () => {
  const reactNative = jest.requireActual('react-native');

  return {
    WebView: reactNative.View,
  };
});
