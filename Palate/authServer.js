// authService.js
import { getAuth, signInAnonymously } from 'firebase/auth';
import firebaseApp from './firebase';

const auth = getAuth(firebaseApp);

const signInAnonymousUser = () => {
  return signInAnonymously(auth);
};

export { signInAnonymousUser };