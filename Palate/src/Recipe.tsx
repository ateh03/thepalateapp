import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Linking,
  TextInput
} from 'react-native';

import { getDatabase, set, ref, push, onValue, remove } from 'firebase/database';
import firebaseApp from '../firebase';
import IngredientPage from './IngredientPage';
import DatePicker from 'react-native-date-picker';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

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

interface RecipeProps {
  uri: string;
  title: string;
  image: string;
  ingredients: Ingredient[];
  instructions: string;
  toggleFavorite: (uri: string, title: string, isFavorite: boolean) => void;
}

const Recipe: React.FC<RecipeProps> = ({
  uri,
  title,
  image,
  ingredients,
  instructions,
  toggleFavorite,
}) => {
  const [pressed, setPressed] = useState(false);
  const [addToFav, setAddToFav] = useState(false);
  const [numOfIngredients, setNumOfIngredients] = useState(0);
  const [eventName, setEventName] = useState(title);
  const [eventDescription, setEventDescription] = useState('');
  const [eventDate, setEventDate] = useState(new Date());
  const [isDateValid, setIsDateValid] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const [isFavorite, setIsFavorite] = useState(false);

  const db = getDatabase(firebaseApp);
  const calendarRef = ref(db, `users/${userEmail}/calendar`);
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


    // Fetchs "favorites" status from DB
    useEffect(() => {
      const fetchData = async () =>{
        await login();
      }
      fetchData();
      const db = getDatabase(firebaseApp);
      const encodedURI = encodeURIComponent(uri).replace(/[.*#\[\]]/g, '_');
      const favoriteRef = ref(db, `users/${userEmail}/favorites/${encodedURI}`);
  
      const unsubscribe = onValue(favoriteRef, (snapshot) => {
        const isFav = snapshot.exists();
        // Update local state based on DB
        setIsFavorite(isFav); 
      });
  
      return () => unsubscribe();
      // Re-run IF uri subject to change
    }, [uri, userEmail]); 

  const handleFavoriteToggle = () => {
    const newFavoriteStatus = !isFavorite;
    if(isFavorite){
      setPressed(false);
    }
    toggleFavorite(uri, newFavoriteStatus); 
    setIsFavorite(newFavoriteStatus); // Updates local state
  };

  var touchProps = {
    style: pressed ? styles.clickedContainer : styles.container,
    onPress: () => setPressed(!pressed),
  };

  var favButton = {
    style: addToFav ? styles.fav : styles.notFav,
  };

  const addingToFav = () => {
    setAddToFav(!addToFav);
    // TODO database interaction, use the uri variable
    // add the uri to the user's favorites table
  };

  const removingFromFav = () => {
    setAddToFav(!addToFav);
    // TODO database interaction, use the uri variable
    // take the uri out of the user's favorites table
  };

  const getNumOfIngredients = () => {
    //TODO database interaction
    //use the ingredients array, attribute food (ingredients.food is just the title of the food, not measurement), use it to loop through
    setNumOfIngredients(0); // use this to set the num of ingredients the user has in their pantry
  };

  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
  };

  const addToCalendar = () => {
	
    // split the date return
    const formattedDate = eventDate.toISOString().split('T')[0];

    const newcalRef = push(calendarRef);
    const calId = newcalRef?.key; // Get the generated key

    // Set the data as an object
    set(newcalRef, {eventName, eventDescription, formattedDate, id: calId, instructions});
    setPressed(false);
    setEventDate(new Date());
    setEventDescription("");
    setEventName("");
  }

  return (
    <TouchableOpacity {...touchProps}>
      {!pressed && <Text style={styles.title}> {title}</Text>}
      <Image style={styles.coverImage} source={{uri: image}} />
      {!pressed && <View style={styles.gradientOverlay} />}
      <View style={styles.text}>
        {pressed ? (
          <View>
            <Text style={styles.expandedTitle}>
              {title}
              </Text>
            <Text style={styles.ingredientsText}>
              Ingredients: 
              </Text>
              <Text style={styles.ingredientsList}>
              {ingredients.map((ingredient: Ingredient, index: number) => (
                <Text key={index}>
                  {ingredient.text}
                  {'\n \n'}
                </Text>
                
              ))}
            </Text>
          <TouchableOpacity onPress={handleFavoriteToggle} style={isFavorite ? styles.fav : styles.notFav}>
            <Text>{isFavorite ? 'Remove from Favorites' : 'Add to Favorites ♥'}</Text>
          </TouchableOpacity>

          {/* Create Event */}
          {isFavorite && 
          <View style = {styles.create}>
            <TextInput
            style={styles.input}
            placeholder= {eventName}
            onChangeText={text => setEventName(text)}/>
          <TextInput
            style={styles.input}
            placeholder="Description (optional)"
            onChangeText={text => setEventDescription(text)}/>

            <TouchableOpacity onPress={toggleDatePicker}>
             <Text>{"   " + eventDate.toDateString()}</Text>
            </TouchableOpacity>

	          <View style={styles.datePickerContainer}>
              {showDatePicker && (
              <DatePicker
                date={eventDate}
                mode="date"
                locale="en"
                minimumDate={new Date()}
                onDateChange={date => setEventDate(date)} // Update selected date
              />
              )}
            </View>

            <TouchableOpacity
            style={styles.btn}
            onPress={(addToCalendar)}>
            <Text> Add to Calendar </Text>
          </TouchableOpacity>
          </View>}
          

            <TouchableOpacity
              style={styles.btn}
              onPress={() => Linking.openURL(instructions)}>
              <Text> Click here for instructions!</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const RecipePage = () => {
  return <View> </View>;
};
const styles = StyleSheet.create({
  container: {
    width: 175,
    padding: 2.5,
    margin: 10,
    borderRadius: 10,
    alignItems: 'center',
    
  },
  clickedContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    alignSelf: 'flex-start',
    padding: 10,
    margin: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  coverImage: { 
    width: 170,
    height: 170,
    borderRadius: 20,
    position: 'relative', 
  },
  gradientOverlay: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 20,
    zIndex: 1, 
    marginTop: 2.5,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  title: {
    position: 'absolute',
    zIndex: 2, 
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold', 
    textAlign: 'center', 
    width: '100%', 
    marginTop: 25, 
  },
  text: {
    alignItems: 'center',
  },
  expandedTitle: {
    fontWeight: 'bold',
    color: '#000000',
    fontSize: 24,
    padding: 5,
    paddingTop: 15,
  },
  ingredientsText: {
    fontWeight: 'bold',
    fontSize: 18,
    padding: 5,
  },
  ingredientsList: {
    margin: 5,
    fontSize: 16,
  },
  btn: {
    backgroundColor: '#c8db9c',
    alignItems: 'center',
    padding: 10,
    margin: 10,
    borderRadius: 10,
  },
  fav: {
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    alignItems: 'center',
    padding: 10,
    margin: 10,
    borderRadius: 10,
  },
  notFav: {
    backgroundColor: '#edb7ba',
    alignItems: 'center',
    padding: 10,
    margin: 10,
    borderRadius: 10,
  },
  input: {
    height: 40,
    width: 200,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    fontFamily: 'Cochin',
    alignItems: 'center',
    color: 'black',
  },
  create: {
    backgroundColor: 'white',
    borderRadius: 5,
  }, 
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#679436',
    padding: 5,
    borderRadius: 5,
    width: 30,
    height: 30,
  },
  addButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
  },
  datePickerContainer: {
    alignItems: 'center',
    marginTop: 10,
    width: 300,
  },
});

export default Recipe;

/*<Text onTextLayout={getNumOfIngredients}>
              TODO: You have {numOfIngredients}/{ingredients.length} ingredients
              in your pantry!
            </Text>*/