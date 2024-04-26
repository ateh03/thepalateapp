//export * from '@react-native-async-storage/async-storage/jest/async-storage-mock';
// __mocks__/async-storage-mock.js

const AsyncStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
  
  export default AsyncStorage;
  