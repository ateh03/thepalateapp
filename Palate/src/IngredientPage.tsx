import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Image
} from 'react-native';

import {getDatabase, set, ref, push, onValue, remove} from 'firebase/database';
import firebaseApp from '../firebase';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const IngredientPage = () => {
  const [ingredient, setIngredient] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  // intializes database reference
  const db = getDatabase(firebaseApp);
  const shoppingCartRef = ref(db, `users/${userEmail}/shoppingCart`);
  const ingredientsRef = ref(db, `users/${userEmail}/ingredients`);
  const usersRef = ref(db, 'users');

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
  } 

  const getIngredients = async () => {
    onValue(ingredientsRef, snapshot => {
      const data = snapshot.val();
      if (data) {
        const ingredientsList = Object.keys(data).map(ingredientId => ({
          id: ingredientId,
          ...data[ingredientId],
        }));
        setIngredients(ingredientsList);
      }
    }); 
  } 

  const getShoppingList = async () => {
    onValue(shoppingCartRef, snapshot => {
      const data = snapshot.val();
      if (data) {
        const ingredientsList = Object.keys(data).map(ingredientId => ({
          id: ingredientId,
          ...data[ingredientId],
        }));
        setShoppingList(ingredientsList);
      }
    }); 
  }

  useEffect(() => {
    const fetchData = async () => {
      await login();
      await getIngredients();
      await getShoppingList();
    }  
    fetchData();
  
  },[userEmail]);

  useEffect(() => {
    const unsubscribe = onValue(ingredientsRef, snapshot => {
      const data = snapshot.val();
      //Logs data to console
      console.log('Data fetched:', data);
      if (data) {
        const ingredientsList = Object.keys(data).map(key => ({
          id: key,
          ...data[key],
        }));
        setIngredients(ingredientsList);
      } else {
        setIngredients([]); 
      }
    });
  },[]);

  // Adds ingredients to the page + database
  const addIngredient = () => {
    const trim = ingredient.trim();
    const exists = ingredients.some(obj => obj.ingredient === ingredient);
    if (ingredient && trim != "" && !exists) {
      // Update the database
      const newIngredientRef = push(ingredientsRef);
      // Get the generated key
      const ingredientId = newIngredientRef?.key;

      set(newIngredientRef, {ingredient, id: ingredientId});

      setIngredients([...ingredients, {ingredient, id: ingredientId}]);
    }
    setIngredient('');
  };

  // Removes ingredients from the page + database
  const removeIngredient = async (ingredientId) => {
    const ingredientRefToRemove = ref(db, `users/${userEmail}/ingredients/${ingredientId}`);
    try {
      await remove(ingredientRefToRemove);
      setIngredients(prevIngredients => prevIngredients.filter(item => item.id !== ingredientId));
    } catch (error) {
      console.error('Error removing ingredient:', error);
    }
  };

  const shoppingIngredient = async item => {
    shopItem = item;
    if(shopItem){
      // adds ingredients to same IngredientTSX db
      const newShoppingRef = push(shoppingCartRef);
      console.log(newShoppingRef);
      if (!shoppingList.some(obj => obj.ingredient === shopItem.ingredient)) {
        set(newShoppingRef, {
            ingredient: shopItem.ingredient
        });
      }
    }
    removeIngredient(item.id);
  };
  

  const ingredientList = ({item}) => (
    <ScrollView>
    <View style={styles.ingredient}>
      <Text style={styles.itemList}>{item.ingredient}</Text>
      <View style={styles.ingredientButtons}>
      <TouchableOpacity onPress={() => shoppingIngredient(item)}>
          <Image source={require('./img/shopping_icon_2.png')} style={styles.shopIcon}
          testID = "shopping-button"/> 
        </TouchableOpacity>
        <TouchableOpacity onPress={() => removeIngredient(item.id)}
        testID = "remove-button">
        <Image source={require('./img/x-symbol-svgrepo-com.png')} style={styles.xIcon}/>
        </TouchableOpacity>
      </View>
    </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
      <Image source={require('./img/palate.png')} style={styles.logo}/>
      </View>
      <Text style={styles.heading}>My Ingredients</Text>
      <View style={styles.searchBar}>
      <TextInput
        style={styles.input}
        placeholder="Enter ingredient"
        value={ingredient}
        onChangeText={text => setIngredient(text)}
      />
      <TouchableOpacity style={styles.addButton} onPress={addIngredient}>
        <Text style={styles.addButtonText}>Add Ingredient</Text>
      </TouchableOpacity>
      </View>
      <FlatList
        data={ingredients}
        renderItem={ingredientList}
        keyExtractor={item => item.id}
        testID="ingredient-list"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //padding: 20,
    //marginTop: 20,
    alignItems: 'center',
    backgroundColor: '#F4F7F5',
  },
  searchBar: {
    flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 20,
 // marginLeft: 0,
  },
  header: {
    backgroundColor: '#000000',
    width: 400,
    alignItems: 'center',
    padding: 10,
    marginTop: 0,
  },
  heading: {
    fontSize: 25,
    color: 'black',
    marginBottom: 10,
    marginTop: 20,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  logo: {
    height: 30,
    width: 100,
    marginTop: 5,
    marginBottom: 5,
  },
  input: {
    height: 40,
    width: 220,
    marginLeft: 20,
    padding: 10,
    backgroundColor: '#EBF2FA',
    borderRadius: 10,
    fontFamily: 'Cochin',
    alignItems: 'center',
    color: 'black',
  },
  addButton: {
    backgroundColor: '#679436',
    padding: 10,
    borderRadius: 5,
    margin: 15,
  },
  addButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 15,
  },
  ingredient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    fontSize: 18,
  },
  itemList: {
    fontSize: 20,
    marginRight: 30,
  },
  ingredientButtons: {
    flexDirection: 'row',
  },
  removeButton: {
    color: 'white',
    fontSize: 12,
    padding: 8,
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: 'red',
  },
  xIcon: {
    height: 20,
    width: 20,
    padding: 0,
    margin: 5,
  },
  shopIcon: {
    height: 30,
    width: 30,
    padding: 0,
    margin: 0,
  },
});

export default IngredientPage;
