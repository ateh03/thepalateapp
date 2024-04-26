import React from 'react';
import {Button, Image, StyleSheet, Pressable, Text, View} from 'react-native';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ButtonProps = {
  login(): void;
};

export const LogInWithGoogle: React.FunctionComponent<ButtonProps> = ({
  login,
}) => {
  return (
    <View style={styles.container}>
      
      <View style={styles.LogoBackground}></View>

      <Image
        source={require('./img/palate.png')}
        style={styles.logo}
      />
      <View>
          <Text style={styles.heading}>Welcome to Palate!</Text>
          <Text style={styles.subheading}>the ultimate culinary companion</Text>
          </View>
      <Pressable
        id="loginbuttonid"
        style={styles.btn}
        onPress={() => {
          GoogleSignin.configure({scopes: ["profile", "email"]});
          GoogleSignin.hasPlayServices()
            .then(hasPlayService => {
              if (hasPlayService) {
                GoogleSignin.signIn()
                  .then(userInfo => {
                    login();
                    console.log(JSON.stringify(userInfo));
                    AsyncStorage.setItem('authToken', userInfo.user.id)
                      .then(() => {
                        console.log('Authentication token stored successfully.');
                      })
                      .catch(error => {
                        console.error('Error storing authentication token:', error);
                      });
                  })
                  .catch(e => {
                    console.log('ERROR IS: ' + JSON.stringify(e));
                  });
              }
            })
            .catch(e => {
              console.log('ERROR IS: ' + JSON.stringify(e));
            });
        }}>
        <View style={styles.buttonContent}>
          <Image
            source={require('./img/Google_Icon.png')}
            style={styles.image}
          />
          <Text style={styles.text}> Sign in with Google </Text>
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  btn: {
    padding: 8,
    margin: 20,
    color: 'black',
    backgroundColor: '#d3d3d3',
    alignItems: 'center',
    borderRadius: 5,
  },
  text: {
    color: 'black',
  },
  heading: {
    fontSize: 25,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 5,
  },
  subheading: {
    fontSize: 18,
    marginBottom: 20,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  logo: {
    height: 30,
    width: 100,
    position: 'absolute',
    top: 10,
    marginTop: 5,
    marginBottom: 5,
  },
  LogoBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'black',
  },
});
