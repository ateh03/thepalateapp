import React, {Component, useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  Button,
  Image,
  TouchableOpacity,
  Modal,
  requireNativeComponent,
} from 'react-native';
import Recipe from './Recipe';
import FilterPopup from './FilterPopup';

import { getDatabase, set, ref, push, remove, onValue, child, get } from 'firebase/database';
import firebaseApp from '../firebase';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

interface RecipeData {
  recipe: {
    uri: string;
    label: string;
    totalTime: string;
    image: string;
    ingredients: string[];
    url: string;
  };
}

interface Ingredient {
  text: string;
  food: string;
  quantity: string;
  measure: string;
  weight: string;
  foodCategory: string;
  foodId: string;
  image: string;
}

const HomePage = () => {
  const arrayID = ['f765809c', 'c91b99f9', '8e4f9557'];
  const arrayKey = [
    'bdbad4ec21ee9c0861ff62308251251b',
    '89c9679db2971c3890025902ff909cfa',
    '2b4f7f6d6bddf6f6e18a7cbcf44dfb37',
  ];
  let index = 0;

  const [recipes, setRecipes] = useState<RecipeData[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [search, setSearch] = useState('');
  let fypAlgo = ['Pizza','Sushi','Taco','Pasta','Curry','Burger','Salad','Soup','Sandwich','Dumplings','Rice','Steak','Shrimp','Hummus','Quinoa','Falafel','Eggplant','Zucchini','Guacamole','Cabbage'];
  const [query, setQuery] = useState(fypAlgo[Math.floor(Math.random() * fypAlgo.length)]);
  const [showResults, setShowResults] = useState(true);
  const [numIngr, setNumIng] = useState('-'); // example: 5-6
  const [cuisine, setCuisine] = useState(''); // example: Mexican 
  const [mealType, setMealType] = useState(''); // example: Breakfast, lunch, dinner, dessert
  const [time, setTime] = useState('-'); // 30-60
  const [filterVisible, setFilterVisible] = useState(false);

  const db = getDatabase(firebaseApp);
  const usersRef = ref(db, 'users');

  //toggles favorite button add/remove
  const toggleFavorite = (recipeURI: string, addToFavorites: boolean) => {
    const db = getDatabase(firebaseApp);
    const encodedURI = encodeURIComponent(recipeURI).replace(/[.*#\[\]]/g, '_');
    const favoriteRef = ref(db, `users/${userEmail}/favorites/${encodedURI}`);
    if (addToFavorites) {
      // Find the recipe that matches the URI.
      const recipeToAdd = recipes.find(recipe => recipe.recipe.uri === recipeURI);
      if (recipeToAdd) {
        set(favoriteRef, {
          uri: recipeToAdd.recipe.uri,
          label: recipeToAdd.recipe.label,
          image: recipeToAdd.recipe.image,
          ingredients: recipeToAdd.recipe.ingredients,
          url: recipeToAdd.recipe.url
        }).then(() => console.log("Added to favorites successfully"))
          .catch(error => console.error("Error adding to favorites:", error));
      } else {
        console.log(`Recipe to add not found: ${recipeURI}`);
      }
    } else {
      remove(favoriteRef)
        .then(() => console.log("Removed from favorites successfully"))
        .catch(error => console.error("Error removing from favorites:", error));
    }
  };
  
  
  // Search recipe by key word
  const getRecipes = async () => {
    var search_param = `https://api.edamam.com/api/recipes/v2?type=public&q=${query}&app_id=${arrayID[index]}&app_key=${arrayKey[index]}`;
    /*const response = await fetch(
      `https://api.edamam.com/api/recipes/v2?type=public&q=${query}&app_id=${arrayID[index]}&app_key=${arrayKey[index]}`,
    );*/
    if(numIngr !== '-'){
      search_param +=  "&ingr=" + numIngr;
    }
    if(cuisine !== ''){
      search_param += "&cuisineType=" + cuisine;
    }
    if(mealType !== ''){
      search_param += "&mealType=" + mealType;
    }
    if(time !== '-'){
      search_param += "&time=" + time;
    }
    const response = await fetch(search_param);

    const data = await response.json();
    
    setRecipes(data.hits);
    

    setShowResults(true);

    //loop through our different IDs and KEYS
    if (index + 1 == arrayID.length) {
      index = 0;
    } else {
      index++;
    }
    return data.hits; //hits is in the Edamam API Documentation
  };

  const login = async () =>{
    let temp = "";
    try {
      const isSignedIn = await GoogleSignin.isSignedIn();
      if (isSignedIn) {
        const userInfo = await GoogleSignin.getCurrentUser();
        temp = userInfo.user.email;
      }
    } catch (error) {
      console.log('Error fetching Google user info:', error);
    }

    const pattern = /[.$#\[\]/]/g;
    temp = temp.replace(pattern, '');
    setUserEmail(temp);

    try {
      // Construct the reference to the user node based on their email
      const userRef2 = child(ref(db), `users/${userEmail}`);
      
      // Get the snapshot of the user's data
      const snapshot = await get(userRef2);
      
      // Check if the user's data exists in the snapshot
      if (!snapshot.exists()) {
        // If user does not exist, push the user to the database
        await set(userRef2, { email: userEmail, bio: "This is your default bio" });
      } 
    } catch (error) {
      console.error("Error checking if user exists and pushing to database:", error);
    }

  } 

  useEffect(() => {
    login();
    getRecipes();
  }, [query,numIngr,cuisine,mealType,time, userEmail]);

  const updateSearch = (e: React.SetStateAction<string>) => {
    setSearch(e);
  };

  const getSearch = (e: {preventDefault: () => void}) => {
    e.preventDefault();
    setQuery(search);
    setSearch('');
    setShowResults(true);
  };
  // End seach by keyword

  const handleApplyFilters = (filters) => {
    // Implement handling of applied filters here
    
    setNumIng(filters["range1"]);
    setTime(filters["range2"]);
    setCuisine(filters["dropdownValue1"]);
    setMealType(filters["dropdownValue2"]);
    setQuery(filters["searchText"]);
    setShowResults(true);
    setSearch('');
    if(filters["searchText"].trim() == ""){
      setRecipes([]);
    }
  };

  return (
    <ScrollView>
      <View>
      <View style={styles.header}>
      <Image source={require('./img/palate.png')} style={styles.logo}/>
      </View>
        <View style={styles.inputContainer}>
          <View style={styles.searchBar}>
          <TextInput
            style={styles.input}
            placeholder="&#x1F50D; Search"
            onSubmitEditing={getSearch}
            onChangeText={updateSearch}
          />
          <TouchableOpacity onPress={() => setFilterVisible(true)}  testID = "filter">
      <Image source={require('./img/filter_icon.png')} style={styles.xIcon}/> 
        </TouchableOpacity >
          </View>
          <FilterPopup visible={filterVisible} onClose={() => setFilterVisible(false)} onApplyFilters={handleApplyFilters} />
        </View>
        <View style={styles.txt}>
          {showResults ? (
            <View style={styles.container}>
              <View style={styles.result}>
                {recipes.map((recipe, index) => (
                  <View key={index}>
                    <Recipe
                      key={recipe.recipe.uri}
                      uri={recipe.recipe.uri}
                      title={recipe.recipe.label}
                      image={recipe.recipe.image}
                      ingredients={recipe.recipe.ingredients}
                      /*ingredients={
                        (recipe.recipe.ingredients as String[]).map(
                          (text, index) => ({text}),
                        ) as Ingredient[]
                      }*/
                      instructions={recipe.recipe.url}
                      toggleFavorite={toggleFavorite}
                    />
                  </View>
                ))}
              </View>
            </View>
          ) : null}
          {!showResults || recipes.length == 0 ? (
            <Text style={styles.txt}>
              {' '}
              No recipes exist, please try again!
            </Text>
          ) : null}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flex: 1,
    //backgroundColor: '#ffffff',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 15,
  },
  txt: {
    fontFamily: 'Cochin',
    alignItems: 'center',
    color: 'black',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
  alignItems: 'center',
  },
  input: {
    height: 40,
    width: 220,
    padding: 10,
    backgroundColor: '#EBF2FA',
    borderRadius: 10,
    fontFamily: 'Cochin',
    alignItems: 'center',
    color: 'black',
  },
  xIcon: {
    height: 30,
    width: 30,
    padding: 10,
    margin: 10,
  },
  filterButton: {
    padding: 10,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
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
  result: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

export default HomePage;