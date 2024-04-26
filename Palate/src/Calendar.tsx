import React, { useState, useEffect, } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, Modal, TextInput, View, Image, Dimensions, Linking } from 'react-native';
import { Agenda } from 'react-native-calendars';

import DatePicker from 'react-native-date-picker';

import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {getDatabase, set, ref, push, onValue, remove} from 'firebase/database';
import firebaseApp from '../firebase';

const { width, height } = Dimensions.get('window');

const Calendar = () => {
  const [currentMonthYear, setCurrentMonthYear] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventDate, setEventDate] = useState(new Date());
  const [events, setEvents] = useState({});
  const [initialized, setInitialized] = useState(false);
  const [isDateValid, setIsDateValid] = useState(true);
  const [eventDetails, setEventDetails] = useState({});
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [year, setYear] = useState("2024");
  const [opened, setOpened] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const monthNames = [ 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
  const [month, setMonth] = useState(monthNames[0]);


    // FOR STELLA - created database table 
    // Database reference
    const db = getDatabase(firebaseApp);
    const calendarRef = ref(db, `users/${userEmail}/calendar`);
    const usersRef = ref(db, 'users');

  // Initialize calendars date 10 years in advance from 2017-01-01
  //need to retouch this -ali 02.20
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

  useEffect(() => {
    const start = async() =>
      {
        await login();
      }
    start();
    if (!initialized || userEmail!="") {
      const items = {};
      for (let i = 0; i < 3650; i++) {
        const time = new Date('2017-01-01').getTime() + i * 24 * 60 * 60 * 1000;
        const strTime = timeToString(time);

        if (!items[strTime]) {
          items[strTime] = [];
        }
      }
      const fetchData = async () => {
        try {
          onValue(calendarRef, snapshot => {
            const data = snapshot.val();
            if (data) {
              Object.keys(data)?.forEach(key => {
                const newItem = { name: data[key].eventName, description: data[key].eventDescription, instructions: data[key].instructions, id: key };
                if (items[data[key].formattedDate]) {
                  // If the date already exists in items, append the new item to the existing list
                  items[data[key].formattedDate].push(newItem);
                } else {
                  // If the date doesn't exist in items, create a new array with the new item
                  items[data[key].formattedDate] = [newItem];
                }
              });
            }
          });
        } catch (error) {
          console.error('Error fetching events:', error);
        }
      };
      fetchData();

      const currentDate = new Date();
      setYear(currentDate.getFullYear());
      setMonth(monthNames[currentDate.getMonth()]);

      setEvents(items);
      setInitialized(true);
    }
  }, [initialized, userEmail]);

  const timeToString = (time) => {
    const date = new Date(time);
    return date.toISOString().split('T')[0];
  };

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
  };
  

  const handleEventNameChange = () => {

    const formattedDate = eventDate.toISOString().split('T')[0];
    
    // const selectedDateEvents = events[formattedDate] || [];
    
    const newcalRef = push(calendarRef);
    
    const calId = newcalRef?.key; // Get the generated key

    const instructions = "";
    
    // Set the data as an object00
    set(newcalRef, {eventName, eventDescription, formattedDate, id: calId, instructions});
    
        setEvents({});
        setInitialized(false);
        setEventName('');
        setEventDescription('');
        setEventDate(new Date());
        closeModal();
      };
    

  const handleDeleteEvent = async () => {
    const { name, id } = eventDetails;
    const updatedEvents = { ...events };

    Object.keys(updatedEvents).forEach((date) => {
      updatedEvents[date] = updatedEvents[date].filter((event) => event.name !== name);
    });

    setEvents(updatedEvents);
    const calRefToRemove = ref(db, `users/${userEmail}/calendar/${id}`);
    try {
      await remove(calRefToRemove);
    } catch (error) {
      console.error('Error removing ingredient:', error);
    }
    setInitialized(false);
    setEventModalVisible(false)
  };

  // Function to open modal with event details
  const openEventModal = (item) => {
    setEventDetails(item);
    setEventModalVisible(true);
  };

  const renderPalateHeader = () => {
    return (
      <View style={styles.Palateheader}>
        <Image source={require('./img/palate.png')} style={styles.logo}/>
      </View>
    );
  };

  const renderDateHeader = () => {
    //const [year, month] = currentMonthYear.split('-');
    const monthName = monthNames[parseInt(month, 10) - 1]; // Subtract 1 to adjust for zero-based index
    return (
<View style={styles.header}>
      <Text style={styles.headerText}>{!opened ? `${month} ${year}` : ''}</Text>
    </View>
    );
  };

  const handleDayPress = (day) => {
    setMonth(monthNames[day.month -1]);
    setYear(day.year); 

  };

  const calendarToggled = (calendarOpened) => {
     setOpened(calendarOpened);
  }
  

  return (
    <SafeAreaView style={styles.container}>
    <View style={styles.header}>
      </View>
      {renderPalateHeader()}
      {renderDateHeader()}
        <Agenda
        //style={{ height: height - 100 }}
          minDate='2022-01-01'
          pastScrollRange={60}
          futureScrollRange={60}
          firstDay={1}
          items={events}
          onCalendarToggled={calendarToggled}
          onDayPress = {handleDayPress}
          onDayChange={handleDayPress}
          showScrollIndicator={true}
          renderItem={(item, isFirst) => (
          <View>
          {Array.isArray(item) ? (
            item.map((event, index) => (
              <TouchableOpacity key={index} style={styles.item} onPress={() => openEventModal(event)} testID = "event">
                <Text style={styles.itemText}>{event.name}</Text>
                {event.description && <Text style={styles.itemDescription}>{event.description}</Text>}
              </TouchableOpacity>
            ))
          ) : (
            <TouchableOpacity style={styles.item} onPress={() => openEventModal(item)}>
              <Text style={styles.itemText}>{item.name}</Text>
              {item.description && <Text style={styles.itemDescription}>{item.description}</Text>}
            </TouchableOpacity>
          )}
        </View>
      )}
    />
  
      {/* Image Button for Creating Event */}
      <TouchableOpacity style={styles.imageButton} onPress={openModal}>
        <Image
          source={require('./img/plus_button.png')} 
          style={styles.image}
          testID = "add-button"
        />
      </TouchableOpacity>
  
      {/* Create Event Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Title"
              value={eventName}
              onChangeText={(text) => setEventName(text)}
            />
            <TextInput
              style={styles.descriptionInput}
              placeholder="Description"
              value={eventDescription}
              onChangeText={(text) => setEventDescription(text)}
            />

              <TouchableOpacity onPress={toggleDatePicker}>
                <Text>{eventDate.toDateString()}</Text>
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
            
            <View style={styles.buttonsContainer}>

    <TouchableOpacity disabled={!eventName} onPress={handleEventNameChange}>
      <Text style={[styles.createButton, !eventName && styles.disabledButton]}>Create</Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={closeModal}>
      <Text style={[styles.closeText]}>Close</Text>
    </TouchableOpacity>
  </View>

          </View>
        </View>
      </Modal>

      {/* Event Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={eventModalVisible}
        onRequestClose={() => setEventModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, styles.minModalSize]}>
            <Text style={styles.modalTitle}>{eventDetails.name}</Text>
            {eventDetails.description && <Text style={styles.modalDescription}>{eventDetails.description}</Text>}
            {eventDetails.instructions && <TouchableOpacity
              style={styles.btn}
              onPress={() => Linking.openURL(eventDetails.instructions)}>
              <Text> Go to Recipe</Text>
            </TouchableOpacity>}
            <TouchableOpacity onPress={handleDeleteEvent}>
              <Text style={styles.deleteButton}>Delete Event</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEventModalVisible(false)}>
              <Text>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  button: {
    backgroundColor: '#679436',
    padding: 10,
    flex: 1,
  },
  deleteButton: {
    backgroundColor: '#FE7A78',
    width: 'auto',
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    marginTop: 25,
    marginBottom: 15,
    padding: 5,
    borderRadius: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  item: {
    backgroundColor: 'white',
    flex: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginTop: 17,
  },
  itemText: {
    color: '#888',
    fontSize: 16,
  },
  buttonText: {
    color: "white",
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#679436',
    padding: 10,
    textAlign: 'center',
    color: 'white',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 16,
    marginBottom: 10,
  },
  Palateheader: {
    backgroundColor: 'black',
    width: width,
    alignItems: 'center',
    padding: 10,
  },
  header: {
    backgroundColor: 'white',
    width: width,
    alignItems: 'center',
    padding: 0,
  },
  logo: {
    height: 30,
    width: 100,
    marginTop: 5,
    marginBottom: 5,
  },
  imageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    marginRight: 10,
    marginBottom: 10,
  },
  image: {
    width: 50,
    height: 50,
  },
  datePickerContainer: {
    alignItems: 'center',
    marginTop: 10,
    width: 300,
  },
  createButton: {
    backgroundColor: '#679436',
    //width: 'auto',
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    marginTop: 25,
    marginBottom: 15,
    padding: 5,
    borderRadius: 5,
  },
  buttonsContainer: {
   // flexDirection: 'row',
  },
  btn: {
    backgroundColor: '#c8db9c',
    alignItems: 'center',
    padding: 10,
    margin: 10,
    borderRadius: 10,
  },
  closeText: {
    //textAlign: 'center',
  },
  minModalSize: {
    minWidth: 200,
    paddingVertical: 20,
  },
  input: {
    marginBottom: 10,
    padding: 5,
  },
  descriptionInput: {
    marginBottom: 10,
    textAlignVertical: 'top',
  },
});

export default Calendar;