// __mocks__/react-native-modal-dropdown.tsx

import React, { FC } from 'react';
import { View, Text } from 'react-native';

interface DropdownProps {
  options: string[];
}

const MockDropdown: FC<DropdownProps> = ({ options }) => (
  <View>
    {options.map((option: string) => (
      <Text key={option}>{option}</Text>
    ))}
  </View>
);


export default MockDropdown;
