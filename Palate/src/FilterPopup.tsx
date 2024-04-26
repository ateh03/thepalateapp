// FilterPopup.js
import React, { useState } from 'react';
import { Modal, View, Text, Button, TextInput, StyleSheet } from 'react-native';
import ModalDropdown from 'react-native-modal-dropdown';

const FilterPopup = ({ visible, onClose, onApplyFilters }) => {
  const [searchText, setSearchText] = useState('');
  const [dropdownValue1, setDropdownValue1] = useState('');
  const [dropdownValue2, setDropdownValue2] = useState('');
  const [minValue1, setMinValue1] = useState('0');
  const [maxValue1, setMaxValue1] = useState('');
  const [minValue2, setMinValue2] = useState('0');
  const [maxValue2, setMaxValue2] = useState('');

  const applyFilters = () => {
    // Combine min and max values into strings
    const range1 = `${minValue1}-${maxValue1}`;
    const range2 = `${minValue2}-${maxValue2}`;
    // Call the onApplyFilters callback with filter values
    onApplyFilters({ searchText, dropdownValue1, dropdownValue2, range1, range2 });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.search}>
        <Text style={styles.header}>Search:</Text>
        <TextInput
          style={styles.searchInput}
          onChangeText={setSearchText}
          value={searchText}
          placeholder="Type your search here"
        />
        <Text style={styles.header}>Cuisine</Text>
        <ModalDropdown
          options={['American', 'Asian', 'British', 'Caribbean', 'Chinese','French','Indian','Italian', 'Japanese','Kosher','Mediterranean','Mexican','Nordic']}
          onSelect={(index, value) => setDropdownValue1(value)}
          defaultValue="Select"
          textStyle={{ fontSize: 16 }} // Adjust text style if needed
          dropdownTextStyle={{ fontSize: 16 }} // Adjust dropdown item text style if needed
          dropdownStyle={{ height: 200, width: 150}} // Adjust dropdown height if needed
          dropdownTextHighlightStyle={{ fontWeight: 'bold' }} // Highlight selected item
          showsVerticalScrollIndicator={true} // Show vertical scrollbar if needed
          initialScrollIndex={1} // Set initialScrollIndex to 0 to select the first item by default
        />
        <Text style={styles.header}>Meal Type</Text>
        <ModalDropdown
          options={['Breakfast','Lunch','Dinner','Teatime','Snack']}
          onSelect={(index, value) => setDropdownValue2(value)}
          defaultValue="Select"
          textStyle={{ fontSize: 16 }} // Adjust text style if needed
          dropdownTextStyle={{ fontSize: 16 }} // Adjust dropdown item text style if needed
          dropdownStyle={{ height: 200, width: 100 }} // Adjust dropdown height if needed
          dropdownTextHighlightStyle={{ fontWeight: 'bold' }} // Highlight selected item
          showsVerticalScrollIndicator={true} // Show vertical scrollbar if needed
          initialScrollIndex={0} // Set initialScrollIndex to 0 to select the first item by default
        />
        <Text style={styles.header}>Maximum Number of Ingredients:</Text>
        <View style={{ flexDirection: 'row', marginBottom: 10 }}>
          
          <TextInput
            style={styles.txt}
            placeholder="Max"
            keyboardType="numeric"
            value={maxValue1}
            onChangeText={setMaxValue1}
          />
        </View>
        <Text style={styles.header}>Maximum Cook Time (in minutes):</Text>
        <View style={{ flexDirection: 'row', marginBottom: 10 }}>
          
          <TextInput
            style={styles.txt}
            placeholder="Max"
            keyboardType="numeric"
            value={maxValue2}
            onChangeText={setMaxValue2}
          />
        </View>
        <View style={styles.btns}>
        <Button title="Apply Filters" onPress={applyFilters}/>
        <Text style={{color: 'white'}}>\n</Text>
        <Button title="Close" onPress={onClose} color={'#8a8a8a'}/>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  txt: {
  flex: 1,
  height: 40, 
  borderColor: 'gray',
  borderWidth: 1
  },
  search: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  searchInput: {
    height: 40,
    width: '100%',
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    borderRadius: 10,
  },
  header: {
    fontWeight: 'bold',
    padding: 10,
  },
  btns: {
    padding: 10,
  }
});

export default FilterPopup;
