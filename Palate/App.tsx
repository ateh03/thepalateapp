/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState} from 'react';
import {NavigationController} from './src/navigation';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  useColorScheme,
  View,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import {LogInWithGoogle} from './src/Google';

// Import the Firebase configuration
import firebaseApp from './firebase';

// // Import necessary Firebase modules
// import { initializeApp } from 'firebase/app';

// // import firebaseConfig from './firebase';
//  const app = initializeApp(firebaseApp);

const GetPage = () => {
  const [logged_in, setState] = useState(false);
  // Check if authentication token exists in AsyncStorage
 AsyncStorage.getItem('authToken')
 .then(authToken => {
   // Check if authToken is not null or undefined
   if (authToken) {
     // Authentication token exists
     setState(true);
     console.log('User is authenticated.');
   } else {
     // Authentication token does not exist
     console.log('User is not authenticated.');
   }
 })
 .catch(error => {
   console.error('Error retrieving authentication token:', error);
 });

  if (logged_in == true) {
    return <NavigationController logout={() => {setState(false);}}/>;
  } else {
    return (
      <LogInWithGoogle
        login={() => {
          setState(true);
        }}
      />
    );
  }
};

function App(): JSX.Element {
  /* const isDarkMode = useColorScheme() === 'light';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.lighter : Colors.lighter,
  };*/

  return <GetPage />;
}

export default App;
