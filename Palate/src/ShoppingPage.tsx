import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Image,
} from 'react-native';

import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {getDatabase, ref, push, set, onValue, remove} from 'firebase/database';
import firebaseApp from '../firebase';

const ShoppingPage = () => {
  const [ingredient, setIngredient] = useState('');
  const [ingredients, setIngredients] = useState([]); 
  const [myIngredients, setMyIngredients] = useState([]); 
  const [userEmail, setUserEmail] = useState("");

  // initialize database interaction
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
    onValue(shoppingCartRef, snapshot => {
      const data = snapshot.val();
      if (data) {
        const loadedIngredients = Object.keys(data).map(key => ({
          id: key,
          ...data[key],
        }));
        setIngredients(loadedIngredients);
      }
    });
  }

  const getMyIngredients = async () => {
    onValue(ingredientsRef, snapshot => {
      const data = snapshot.val();
      if (data) {
        const loadedIngredients = Object.keys(data).map(key => ({
          id: key,
          ...data[key],
        }));
        setMyIngredients(loadedIngredients);
      }
    });
  }

  useEffect(() => {
    const fetchData = async () => {
      await login();
      await getIngredients();
      await getMyIngredients();
    }  
    fetchData();
  }, [userEmail]);

  const addIngredient = async () => {
    const trim = ingredient.trim();
    const exists = ingredients.some(obj => obj.ingredient === ingredient);
    if (ingredient && trim != "" && !exists) {
      const newIngredientRef = push(shoppingCartRef);
      const ingredientId = newIngredientRef?.key;
      console.log(newIngredientRef);
      console.log(ingredientId);
      try {
        await set(newIngredientRef, {ingredient, id: ingredientId});
      } catch (error){
        console.log(error);
      }
      setIngredients([...ingredients, {ingredient, id: ingredientId}]);
    }
    setIngredient('');
  };

  const removeIngredient = async id => {
    const ingredientRefToRemove = ref(db, `users/${userEmail}/shoppingCart/${id}`);
    try {
      await set(ingredientRefToRemove, null);
      setIngredients(ingredients.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error removing from database:', error);
    }
  };

  const purchaseIngredient = async item => {
    const purchasedIng = item;
    
    const exists = myIngredients.some(obj => obj.ingredient === purchasedIng.ingredient);
  
    if (purchasedIng && !exists) {
      const newIngredientRef = push(ingredientsRef);
      setMyIngredients([...myIngredients, purchasedIng.ingredient]);
  
      try {
        await set(newIngredientRef, {
          ingredient: purchasedIng.ingredient
        });
  
        const ingredientRefToRemove = ref(db, `users/${userEmail}/shoppingCart/${purchasedIng.id}`);
        await remove(ingredientRefToRemove);
        
        setIngredients(currentIngredients => 
          currentIngredients.filter(ingredient => ingredient.id !== purchasedIng.id)
        );
      } catch (error) {
        console.error('Error handling:', error);
      }
    } else {
      const ingredientRefToRemove = ref(db, `users/${userEmail}/shoppingCart/${purchasedIng.id}`);
      try {
        await remove(ingredientRefToRemove);
        setIngredients(currentIngredients => 
          currentIngredients.filter(ingredient => ingredient.id !== purchasedIng.id)
        );
      } catch (error) {
        console.error('Error handling:', error);
      }
    }
  };
  


  const ingredientList = ({item}) => (
    <View style={styles.ingredient}>
      <Text style={styles.itemList}>{item.ingredient}</Text>
      <View style={styles.ingredientButtons}>
      <TouchableOpacity onPress={() => purchaseIngredient(item)}>
      <Image source={require('./img/purchased-icon.png')} style={styles.xIcon}
      testID = "shopping-button"/> 
        </TouchableOpacity>
        <TouchableOpacity onPress={() => removeIngredient(item.id)}>
          <Image source={require('./img/x-symbol-svgrepo-com.png')} 
          style={styles.xIcon}
          testID = "remove-button"/> 
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
      <Image source={require('./img/palate.png')} style={styles.logo}/>
      </View>
      <Text style={styles.heading}>My Shopping Cart</Text>
      <View style={styles.inputContainer}>
      <View style={styles.searchBar}>
      <TextInput
        style={styles.input}
        placeholder="Enter ingredient"
        value={ingredient}
        onChangeText={text => setIngredient(text)}
      />
      <TouchableOpacity style={styles.addButton} onPress={addIngredient}>
        <Text style={styles.addButtonText}>Add to Cart</Text>
      </TouchableOpacity>
      </View>
      <FlatList
        data={ingredients}
        renderItem={ingredientList}
        keyExtractor={(item, index) => index}
        testID = "ingredient-list"
      />
    </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
   // padding: 20,
   // marginTop: 20,
    alignItems: 'center',
    backgroundColor: '#F4F7F5',
  },
  inputContainer: {
    display: 'flex', // Make the container a flexbox 
    justifyContent: 'space-between', // Align items horizontally with space between 
    alignItems: 'center', //Align items vertically in the center 
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
    width: 300,
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
    margin: 5,
  },
  xIcon: {
    height: 20,
    width: 20,
    padding: 10,
    margin: 10,
  },
  searchBar: {
    flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 20,
  },
  purchaseButton: {
    color: 'white',
    fontSize: 12,
    padding: 8,
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: 'blue',
    margin: 5,
  },
});

export default ShoppingPage;
