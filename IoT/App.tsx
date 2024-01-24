import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image } from 'react-native';

import DevicesScreen from './Screens/DevicesScreen';
import ConnectionScreen from './Screens/ConnectionScreen';

const Tab = createBottomTabNavigator();

function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        tabBarOptions={{
          labelStyle: { fontSize: 16 },
          style: { height: 180, paddingTop: 20 },
        }}
      >
        <Tab.Screen
          name="Devices"
          component={DevicesScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Image
                source={require('./Assets/Icons/devices.png')} // Podaj ścieżkę do ikony
                style={{ tintColor: color, width: size, height: size }}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Connection"
          component={ConnectionScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Image
                source={require('./Assets/Icons/connection.png')} // Podaj ścieżkę do ikony
                style={{ tintColor: color, width: size, height: size }}
              />
            ),
          }}
        />
        
        
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default App;