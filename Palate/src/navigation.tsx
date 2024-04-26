import React, {useState} from 'react';
import {StyleSheet, Text, View, TouchableOpacity, ButtonProps, Image} from 'react-native';
import HomePage from './HomePage';
import IngredientPage from './IngredientPage';
import ShoppingPage from './ShoppingPage';
import Calendar from './Calendar';
import ProfilePage from './ProfilePage';

enum Page {
  Home,
  Calendar,
  Ingredients,
  Shopping,
  Profile,
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    height: 50,
    width: 50,
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    //marginBottom: 20,
  },
  button: {
    backgroundColor: '#363636',
    padding: 20,
    //borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
  },
  buttonSelected: {
    backgroundColor: '#1f1f1f', // Darkened color
    width: 90,
   // padding: 20,
    //width: '25%',
  },
});

type ButtonProps = {
  logout(): void;
}

export const NavigationController = ({logout}) => {
  const [page, setPage] = useState(Page.Home);

  let content;

  switch (page) {
    case Page.Calendar:
      content = <Calendar />;
      break;
    case Page.Ingredients:
      content = <IngredientPage />;
      break;
    case Page.Profile:
      content = <ProfilePage exit={() => {logout()}} />;
      break;
    case Page.Shopping:
      content = <ShoppingPage />;
      break;
    case Page.Home:
    default:
      content = <HomePage />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>{content}</View>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.button, page === Page.Shopping && styles.buttonSelected]}>
          <Text
            
            onPress={() => setPage(Page.Shopping)}>
            <View style={styles.header}>
            <Image source={require('./img/shopping_icon.png')} style={styles.logo}/>
          </View>
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, page === Page.Ingredients && styles.buttonSelected]}>
          <Text
            
            onPress={() => setPage(Page.Ingredients)}>
            <View style={styles.header}>
            <Image source={require('./img/ingredients_icon.png')} style={styles.logo}/>
          </View>
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, page === Page.Home && styles.buttonSelected]}>
          <Text onPress={() => setPage(Page.Home)}>
          <View style={styles.header}>
            <Image source={require('./img/search_icon.png')} style={styles.logo}/>
          </View>
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, page === Page.Calendar && styles.buttonSelected]}>
          <Text
            
            onPress={() => setPage(Page.Calendar)}>
            <View style={styles.header}>
            <Image source={require('./img/calendar_icon.png')} style={styles.logo}/>
          </View>
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, page === Page.Profile && styles.buttonSelected]}>
          <Text  onPress={() => setPage(Page.Profile)}>
          <View style={styles.header}>
            <Image source={require('./img/profile_icon.png')} style={styles.logo}/>
          </View>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
