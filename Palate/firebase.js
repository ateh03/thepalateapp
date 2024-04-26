// firebase.js
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
    apiKey: "AIzaSyDNl2FisTi138AK9ISpvICjEcD2OUMIwkk",
    authDomain: "palate-31cf7.firebaseapp.com",
    databaseURL: "https://palate-31cf7-default-rtdb.firebaseio.com",
    projectId: "palate-31cf7",
    storageBucket: "palate-31cf7.appspot.com",
    messagingSenderId: "511465302174",
    appId: "1:511465302174:web:26d8004197f6c43385b38f",
    measurementId: "G-DEB6LFKE8K"
  
  };
  

const app = initializeApp(firebaseConfig);

export default app;
