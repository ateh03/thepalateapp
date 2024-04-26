module.exports = {
  preset: 'react-native',
  silent: true,
  moduleNameMapper: {
    '^react-native-calendars$': '<rootDir>/__mocks__/react-native-calendars-mock.tsx',
    '@react-native-async-storage/async-storage': '<rootDir>/__mocks__/@react-native-async-storage/async-storage.js', // Add this line
  },
};
