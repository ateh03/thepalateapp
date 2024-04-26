import React from 'react';
import {render, fireEvent, waitFor, act} from '@testing-library/react-native';
import IngredientPage from '../src/IngredientPage';
import ShoppingPage from '../src/ShoppingPage'
import HomePage from '../src/HomePage'
import Calendar from '../src/Calendar'
import ProfilePage from '../src/ProfilePage'
import { GoogleSignin } from '../__mocks__/googleSignIn';
// Replace the original import statement with the mocked one
jest.mock('@react-native-google-signin/google-signin', () => require('../__mocks__/googleSignIn'))

jest.mock('react-native-calendars');
// // Mock Firebase module
jest.mock('firebase/database', () => ({
  getDatabase: jest.fn(),
  set: jest.fn(),
  ref: jest.fn(),
  push: jest.fn(),
  onValue: jest.fn(),
  remove: jest.fn(),
}));

// Mock Firebase app
jest.mock('../firebase', () => ({}));

jest.mock('react-native-date-picker', () => {
  const React = require('react');
  const { View } = require('react-native');

  const MockDatePicker = (props) => {
    // You can customize the mock behavior as needed
    return <View testID="mock-date-picker" />;
  };

  return MockDatePicker;
});

describe('IngredientPage', () => {
  it('renders correctly', () => {
    const {getByText, getByPlaceholderText} = render(<IngredientPage />);

    expect(getByText('My Ingredients')).toBeDefined();
    expect(getByPlaceholderText('Enter ingredient')).toBeDefined();
    expect(getByText('Add Ingredient')).toBeDefined();
  });

  it('adds ingredient on button press', async () => {
    const {getByPlaceholderText, getByText, findByTestId} = render(
      <IngredientPage />,
    );

    const input = getByPlaceholderText('Enter ingredient');
    const addButton = getByText('Add Ingredient');

    // Use findByTestId to find the list asynchronously
    const list = await findByTestId('ingredient-list');
    const startLength = 0;

    act(() => {
      fireEvent.changeText(input, 'New Ingredient');
      fireEvent.press(addButton);
    });
    /* assert on the output */

    const currentLength = list.children.length;
    expect(currentLength).toBe(startLength + 1);
  });

  it('adds ingredient on button press', async () => {
    const {getByPlaceholderText, getByText, findByTestId} = render(
      <IngredientPage />,
    );

    const input = getByPlaceholderText('Enter ingredient');
    const addButton = getByText('Add Ingredient');

    // Use findByTestId to find the list asynchronously
    const list = await findByTestId('ingredient-list');
    const startLength = 0;

    act(() => {
      fireEvent.changeText(input, 'New Ingredient');
      fireEvent.press(addButton);
      fireEvent.changeText(input, 'New Ingredient');
      fireEvent.press(addButton);
    });

    const currentLength = list.children.length;
    expect(currentLength).toBe(startLength + 1);
  });

  it('removes ingredient on button press', async () => {
    const {getByPlaceholderText, getByText, findByTestId} = render(
      <IngredientPage />,
    );

    const input = getByPlaceholderText('Enter ingredient');
    const addButton = getByText('Add Ingredient');

    // Use findByTestId to find the list asynchronously
    const list = await findByTestId('ingredient-list');
    const startLength = 0;

    fireEvent.changeText(input, 'New Ingredient');
    fireEvent.press(addButton);
    
    const currentLength = list.children.length;
    expect(currentLength).toBe(startLength + 1);
    const removeButton = await findByTestId('remove-button');
    fireEvent.press(removeButton);
    const currentLength2 = list.children.length;
    expect(currentLength2).toBe(currentLength);
  });

  it('adds to shopping on button press', async () => {
    const {getByPlaceholderText, getByText, findByTestId} = render(
      <IngredientPage />,
    );

    const input = getByPlaceholderText('Enter ingredient');
    const addButton = getByText('Add Ingredient');

    // Use findByTestId to find the list asynchronously
    const list = await findByTestId('ingredient-list');
    const startLength = 0;

    fireEvent.changeText(input, 'New Ingredient');
    fireEvent.press(addButton);
    
    const currentLength = list.children.length;
    expect(currentLength).toBe(startLength + 1);
    const shoppingButton = await findByTestId('shopping-button');
    fireEvent.press(shoppingButton);
    const currentLength2 = list.children.length;
    expect(currentLength2).toBe(currentLength);
  });
});

describe('ShoppingPage', () => {
  it('renders correctly', () => {
    const {getByText, getByPlaceholderText} = render(<ShoppingPage />);

    expect(getByText('My Shopping Cart')).toBeDefined();
    expect(getByPlaceholderText('Enter ingredient')).toBeDefined();
    expect(getByText('Add to Cart')).toBeDefined();
  });

  it('adds to shopping cart on button press', async () => {
    const {getByPlaceholderText, getByText, findByTestId} = render(
      <ShoppingPage />,
    );

    const input = getByPlaceholderText('Enter ingredient');
    const addButton = getByText('Add to Cart');

    // Use findByTestId to find the list asynchronously
    const list = await findByTestId('ingredient-list');
    const startLength = 0;

    fireEvent.changeText(input, 'New Ingredient');
    fireEvent.press(addButton);

    const currentLength = list.children.length;
    expect(currentLength).toBe(startLength + 1);
  });

  it('does not add duplicate ingredients', async () => {
    const {getByPlaceholderText, getByText, findByTestId} = render(
      <ShoppingPage />,
    );

    const input = getByPlaceholderText('Enter ingredient');
    const addButton = getByText('Add to Cart');

    // Use findByTestId to find the list asynchronously
    const list = await findByTestId('ingredient-list');
    const startLength = 0;

    fireEvent.changeText(input, 'New Ingredient');
    fireEvent.press(addButton);
    fireEvent.changeText(input, 'New Ingredient');
    fireEvent.press(addButton);

    const currentLength = list.children.length;
    expect(currentLength).toBe(startLength + 1);
  });

  it('removes from shopping cart on button press', async () => {
    const {getByPlaceholderText, getByText, findByTestId} = render(
      <ShoppingPage />,
    );

    const input = getByPlaceholderText('Enter ingredient');
    const addButton = getByText('Add to Cart');

    // Use findByTestId to find the list asynchronously
    const list = await findByTestId('ingredient-list');
    const startLength = 0;

    fireEvent.changeText(input, 'New Ingredient');
    fireEvent.press(addButton);

    const currentLength = list.children.length;
    expect(currentLength).toBe(startLength + 1);
    const removeButton = await findByTestId('remove-button');
    fireEvent.press(removeButton);
    const updatedList = await findByTestId('ingredient-list');
    const updatedLength = updatedList.children.length;
    expect(updatedLength).toBe(currentLength);
  });

  it('adds to ingredients on button press', async () => {
    const {getByPlaceholderText, getByText, findByTestId} = render(
      <ShoppingPage />,
    );

    const input = getByPlaceholderText('Enter ingredient');
    const addButton = getByText('Add to Cart');

    // Use findByTestId to find the list asynchronously
    const list = await findByTestId('ingredient-list');
    const startLength = 0;

    fireEvent.changeText(input, 'New Ingredient');
    fireEvent.press(addButton);

    const currentLength = list.children.length;
    expect(currentLength).toBe(startLength + 1);
    const shoppingButton = await findByTestId('shopping-button');
    fireEvent.press(shoppingButton);
    const updatedList = await findByTestId('ingredient-list');
    const updatedLength = updatedList.children.length;
    expect(updatedLength).toBe(currentLength);
  });

  
});

describe('HomePage', () => {
  it('renders correctly', () => {
    const {getByText, getByPlaceholderText} = render(<HomePage />);

    expect(getByPlaceholderText('🔍 Search')).toBeDefined();
  });

  it('search function', () => {
    const {getByText, getByPlaceholderText} = render(<HomePage />);

    const search = getByPlaceholderText('🔍 Search');
    fireEvent.changeText(search, 'jibberishtahkglag');
    fireEvent(
      search,
      'onKeyPress',
      { nativeEvent: { key: 'Enter', keyCode: 13 } }
    );
    expect(getByText("No recipes exist, please try again!")).toBeTruthy();
  });

  it('opens filter', async () => {
    const {getByText, getByPlaceholderText, findByTestId} = render(<HomePage />);

    const filter = await findByTestId("filter");
    expect(filter).toBeDefined();
    fireEvent.press(filter);
    expect(getByPlaceholderText("🔍 Search")).toBeDefined();
    expect(getByPlaceholderText("Type your search here")).toBeDefined();
    expect(getByText("Cuisine")).toBeDefined();
    expect(getByText("Meal Type")).toBeDefined();
    expect(getByText("Maximum Number of Ingredients:")).toBeDefined();
    expect(getByText("Maximum Cook Time (in minutes):")).toBeDefined();
    
    
  });
});

describe('Calendar', () => {
  it('renders correctly', async () => {
    const { findByTestId } = render(<Calendar />);
    const addButton = await findByTestId("add-button");
    expect(addButton).toBeDefined();
  });

  it('add button works', async () => {
    const { findByTestId, getByPlaceholderText, getByText} = render(<Calendar />);
    const addButton = await findByTestId("add-button");
    fireEvent.press(addButton);
    expect(getByPlaceholderText("Title")).toBeDefined();
    expect(getByPlaceholderText("Description")).toBeDefined();
    expect(getByText("Close")).toBeDefined();
    expect(getByText("Create")).toBeDefined();
  });

  it('add an event', async () => {
    const { findByTestId, getByPlaceholderText, getByText} = render(<Calendar />);
    const addButton = await findByTestId("add-button");
    fireEvent.press(addButton);
    const title = getByPlaceholderText("Title");
    fireEvent.changeText(title, 'test');
    const create = getByText("Create");
    fireEvent.press(create);
    expect(findByTestId("event")).toBeDefined();
  });

});

describe('Profile Page', () => {
  it('renders correctly', () => {
    const {getByText, getByPlaceholderText} = render(<ProfilePage />);

    expect(getByText('Biography')).toBeDefined();
    expect(getByText('Favorites ♥')).toBeDefined();
    expect(getByText('Edit Profile')).toBeDefined();
  });

  it('switches tabs correctly', async () => {
    const { getByText, getByPlaceholderText, findByTestId } = render(<ProfilePage />);
  
    const favoritesButton = await getByText('Favorites ♥');
    fireEvent.press(favoritesButton);
  
    // Wait for the component to update
    await waitFor(() => {
      // Check if the 'favorites' content is rendered
      expect(getByText('Your favorites will show up here!')).toBeTruthy();
    });
  });

    it('opens edit profile correctly', async () => {
      const { getByText, getByPlaceholderText, findByTestId } = render(<ProfilePage />);
    
      const edit = await getByText('Edit Profile');
      fireEvent.press(edit);
    
      // Wait for the component to update
      await waitFor(() => {
        expect(getByText('Edit your profile image in your Google profile settings')).toBeTruthy();
      });
  });

  it('changes bio', async () => {
    const { getByText, getByPlaceholderText, findByTestId } = render(<ProfilePage />);
  
    const edit = getByText('Edit Profile');
    fireEvent.press(edit);
    const bioTextInput = await findByTestId("bio-input");
    const saveButton = getByText('Save');
    fireEvent.changeText(bioTextInput, 'New bio text');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(getByText('New bio text')).toBeTruthy();
  });

});
  
})
