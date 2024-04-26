import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, ScrollView, TextInput, Button, Modal } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {getDatabase, set, ref, push, onValue, remove} from 'firebase/database';
import firebaseApp from '../firebase';
import Recipe from './Recipe';
import { googleLogout } from '@react-oauth/google';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ButtonProps = {
  exit(): void;
};

const ProfilePage = ({exit}) => {
  
  const [userInfo, setUserInfo] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [activeContent, setActiveContent] = useState('recipes'); // Default active content
  const [favs, setFavs] = useState([]);
  const [recipes, setRecipes] = useState<RecipeData[]>([]);
  const [removed, setRemoved] = useState(false);
  const arrayID = ['f765809c', 'c91b99f9', '8e4f9557'];
  const arrayKey = [
    'bdbad4ec21ee9c0861ff62308251251b',
    '89c9679db2971c3890025902ff909cfa',
    '2b4f7f6d6bddf6f6e18a7cbcf44dfb37',
  ];
  const [someFavs, setSomeFavs] = useState(false);
  const [bioText, setBioText] = useState(""); // Initial bio text
  let index = 0;

  const [isModalVisible, setIsModalVisible] = useState(false);
  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

   // Database reference
   const db = getDatabase(firebaseApp);
   const favoritesRef = ref(db, `users/${userEmail}/favorites`);
   const bioRef = ref(db, `users/${userEmail}/bio`);

  const updateSearch = (e: React.SetStateAction<string>) => {
    setBioText(e);
  };

  const fetchGoogleUserInfo = async () => {
    try {
      const isSignedIn = await GoogleSignin.isSignedIn();
      if (isSignedIn) {
        const userInfo = await GoogleSignin.getCurrentUser();
        setUserInfo(userInfo.user);
        temp = userInfo.user.email;
        const pattern = /[.$#\[\]/]/g;
        temp = temp.replace(pattern, '');
        setUserEmail(temp);
      }
    } catch (error) {
      console.log('Error fetching Google user info:', error);
    }
  };
  const toggleFavorite = (recipeURI: string, addToFavorites: boolean) => {
    // Fetches database from DB
    const db = getDatabase(firebaseApp);
    const encodedURI = encodeURIComponent(recipeURI).replace(/[.*#\[\]]/g, '_');
    const favoriteRef = ref(db, `users/${userEmail}/favorites/${encodedURI}`);
  
    // Error testing-- Logs to output if recipeURI was successfully added/removed
    if (addToFavorites) {
      const recipeToAdd = recipes.find(recipe => recipe.recipe.uri === recipeURI);
      if (recipeToAdd) {
        set(favoriteRef, {
          uri: recipeToAdd.recipe.uri,
          label: recipeToAdd.recipe.label,
          image: recipeToAdd.recipe.image,
          ingredients: recipeToAdd.recipe.ingredients,
          url: recipeToAdd.recipe.url
        });
      }
    } else {
      remove(favoriteRef); 
      const encodedURL = encodeURIComponent(recipeURI);
      setFavs(favs.filter(recipe => recipe !== encodedURL));
      setRemoved(!removed);
      if(favs.length == 1){
        setSomeFavs(false);
      }
    }
  };
  
  const updateBio = async () => {
    try {
      await set(bioRef, bioText); 
    } catch (error) {
      console.error('Error updating bio:', error);
    }
    setIsModalVisible(false);
  };

  // Fetch Google user info when the component mounts
  useEffect(() => {
    fetchGoogleUserInfo();
    const fetchData = async () => {
      try {
        onValue(favoritesRef, snapshot => {
          const favoritesData = snapshot.val();
          if (favoritesData) {
            // Extracting the 'uri' property from each object
            const uris = Object.values(favoritesData)?.map(favorite => {
              const encodedUri = encodeURIComponent(favorite.uri).replace(/:/g, "%3A").replace(/\//g, "%2F").replace(/#/g, "%23");
              return encodedUri;  

          });
          if (uris) {
              setFavs(uris);
              setSomeFavs(true);
          }

          }
        });
      } catch (error) {
        console.error('Error fetching favorites:', error);
      }

      try {
        onValue(bioRef, snapshot => {
          const bioData = snapshot.val();
          if(bioData){
            setBioText(bioData);
          }
        });
      } catch (error) {
        console.error('Error fetching bio', error);
      }
    };
    fetchData();
    
    const getRecipes = async () => {
      setRecipes([]);
      for(let i = 0; i < favs.length; ++i){
      const response = await fetch(
        `https://api.edamam.com/api/recipes/v2/by-uri?type=public&uri=${favs[i]}&app_id=${arrayID[index]}&app_key=${arrayKey[index]}`,
      );
      const data = await response.json();
      setRecipes(prevRecipes => [...prevRecipes, ...data.hits]);
      
      
      //loop through our different IDs and KEYS
      if (index + 1 == arrayID.length) {
        index = 0;
      } else {
        index++;
      }
    }
    };

    getRecipes();
  }, [activeContent, removed, userEmail]);

  const renderContent = () => {
    switch (activeContent) {
      case 'recipes':
        return (
          /*<View style = {styles.box}>
            
            <TextInput style = {styles.input}
            multiline={true}
            onChangeText={(text) => setBioText(text)}>
              {bioText}
              </TextInput>
            <Button title="Save" onPress={updateBio} />
          </View>*/
          <View>
            <Text style ={styles.bioText}>{bioText}</Text>
            </View>
        );
      case 'favorites':
        return ( 
          <View>
            {!someFavs && <Text style={styles.errorText}>Your favorites will show up here!</Text>}
            <View style={styles.result}>
                {recipes && recipes.map((recipe, index) => (
                  <View key={index}>
                    <Recipe
                      key={recipe.recipe.uri}
                      uri={recipe.recipe.uri}
                      title={recipe.recipe.label}
                      image={recipe.recipe.image}
                      ingredients={recipe.recipe.ingredients}
                      instructions={recipe.recipe.url}
                      toggleFavorite={toggleFavorite}
                    />
                  </View>
                ))}
              </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    
<View style={styles.container} testID = "profile-page">
  <View style={styles.header}>
    <Image source={require('./img/palate.png')} style={styles.logo}/>
  </View>
  <View style={styles.profileContainer}>
  <Image
  style={styles.profileImage}
  source={userInfo?.photo ? { uri: userInfo.photo } : require('./img/profile-pic.png')}
/>

    <View style={styles.profileDetails}>
      <Text style={styles.nameText}>
        {userInfo?.givenName} {userInfo?.familyName}
      </Text>
      <Text style={styles.emailText}>{userInfo?.email}</Text>
      <TouchableOpacity
      style={styles.editButton}
      onPress={() => setIsModalVisible(true)}
    >
      <Text style={styles.editButtonText}>Edit Profile</Text>
    </TouchableOpacity>
    </View>
  </View>
  <View style={styles.profileButtons}>
    <TouchableOpacity
      style={styles.recipeButton}
      onPress={() => setActiveContent('recipes')}
    >
      <Text style={styles.addButtonText}>Biography</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.addButton}
      onPress={() => setActiveContent('favorites')}
    >
      <Text style={styles.addButtonText}>Favorites ♥</Text>
    </TouchableOpacity>
  </View>
  <ScrollView>
  <View style={styles.recipe}>
    {renderContent()}
  </View>
  </ScrollView>
    <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => {
          toggleModal();
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
          <TouchableOpacity onPress={() => setIsModalVisible(false)}>
      <Image source={require('./img/x-symbol-svgrepo-com.png')} style={styles.xIcon}/> 
        </TouchableOpacity>
        <Image
  style={styles.profileImage}
  source={userInfo?.photo ? { uri: userInfo.photo } : require('./img/profile-pic.png')}
/>
<Text style={styles.descText}>Edit your profile image in your Google profile settings</Text>
<Text style={styles.editText}>Edit biography</Text>
            <TextInput
              style={styles.input}
              multiline={true}
              onChangeText={(text) => setBioText(text)}
              testID = "bio-input"
            >
              {bioText}
            </TextInput>
            <Button title="Save" onPress={() => {updateBio(); setIsModalVisible(false);}}
            />
            <TouchableOpacity
              style={styles.logButton}
              onPress={() => {
                toggleModal();
                logout(exit);
              }}
            >
              <Text style={styles.logButtonText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
//</View>




  );
};

async function logout(callback) {
  GoogleSignin.configure({scopes: ["profile", "email"]}); // necessary for sign-out to work
  await GoogleSignin.revokeAccess();
  await GoogleSignin.signOut();
  try {
    // Remove the item with the specified key from AsyncStorage
    await AsyncStorage.removeItem("authToken");
    console.log(`authToken removed successfully.`);
  } catch (error) {
    console.error(`Error removing item with authToken:`, error);
  }
  callback();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 20,
  },
  profileDetails: {
    flex: 1,
  },
  nameText: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 5,
    color: 'black',
  },
  emailText: {
    fontSize: 16,
    marginBottom: 10,
  },
  bioText: {
    fontSize: 16,
    marginTop: 0,
  },
  recipeButton: {
    backgroundColor: '#679436',
    padding: 10,
    borderRadius: 5,
    margin: 5,
  },
  recipeButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 15,
  },
  addButton: {
    backgroundColor: '#679436',
    padding: 10,
    borderRadius: 5,
    margin: 5,
  },
  addButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 15,
  },
  logButton: {
    backgroundColor: '#CC4035',
    padding: 12,
    borderRadius: 5,
    margin: 5,
    marginTop: 30,
  },
  logButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
    borderRadius: 5,
    margin: 5,
  },
  editButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
  },
  xIcon: {
    height: 20,
    width: 20,
    padding: 10,
    margin: 10,
    marginLeft: 300,
  },
  profileButtons: {
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  recipe: {
    alignItems: 'center',
    flex: 1,   
  }, 
  result: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  header: {
    backgroundColor: '#000000',
    width: 400,
    alignItems: 'center',
    padding: 10,
    marginTop: 0,
  },
  logo: {
    height: 30,
    width: 100,
    marginTop: 5,
    marginBottom: 5,
  },
  box: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    width: 225,
    height: 150,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderColor: 'rgba(0,0,0,0.6)',
    borderWidth: 1.2,
    borderRadius: 10,
    textAlign: 'center',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  editText: {
    fontWeight: 'bold',
    fontSize: 16,
    paddingBottom: 10,
  },
  descText: {
    fontSize: 14,
    paddingBottom: 10,
    paddingTop: 5,
  }
});

export default ProfilePage;
