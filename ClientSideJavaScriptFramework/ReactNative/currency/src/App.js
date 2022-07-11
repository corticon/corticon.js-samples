import 'react-native-gesture-handler'; // React Navigation Dependency (https://reactnative.dev/docs/navigation)
import React, {Component} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  
} from 'react-native';

// TODO: consider adding module resolver
import Home from './components/Home/Home';
import Exchange from './components/Exchange/Exchange';
import UserDrawerIcon from './components/UserDrawer/UserDrawerIcon';

import { SIZES, COLORS } from './constants/Constants';
import { NavigationContainer} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

import { Icon, ThemeContext, getTheme } from 'react-native-material-ui';
import { Picker } from '@react-native-community/picker';


const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
const uiTheme = {
  palette: {
    primaryColor: COLORS.primary,
    accentColor: COLORS.accent,
  },
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };

  }

  render() {
    return (
      <ThemeContext.Provider value={getTheme(uiTheme)}>
        <NavigationContainer>
          <Drawer.Navigator 
            initialRouteName='Home' 
            drawerPosition='right'
            >
            <Drawer.Screen 
              name='Home'
              component={Home}
            />
            <Drawer.Screen 
              name='Exchange'
              component={Exchange}
            />
          </Drawer.Navigator>
        </NavigationContainer>
      </ThemeContext.Provider>
    );
  }
};

const styles = StyleSheet.create({
  picker: {

  },
  pickerItem: {

  },
  scrollView: {
    backgroundColor: COLORS.background.dark,
  },
  textCenter: {
    textAlign: 'center',
  },

  orange: {
    color: COLORS.indicator.orange,
  },
  yellow: {
    color: COLORS.indicator.yellow,
  },
  green: {
    color: COLORS.indicator.green,
  },
  red: {
    color: COLORS.indicator.red,
  },
});

const images = {
  EUR: require('./assets/images/EUR.png'),
  USD: require('./assets/images/USD.png'),
  CAD: require('./assets/images/CAD.png'),
  CNY: require('./assets/images/CNY.png'),
  INR: require('./assets/images/INR.png'),
  GBP: require('./assets/images/GBP.png'),
}

export { App as default, styles, images };
