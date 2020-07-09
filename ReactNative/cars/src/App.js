import 'react-native-gesture-handler'; // React Navigation Dependency (https://reactnative.dev/docs/navigation)
import React, {Component} from 'react';
import {
  StyleSheet,
} from 'react-native';

// TODO: consider adding module resolver
import CarDetails from './components/CarDetails/CarDetails';
import Home from './components/Home/Home';
import Header from './components/Header/Header'
import { SIZES, COLORS } from './constants/Constants';
import { AppContext } from './AppContext';

import { NavigationContainer} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator(); // React Navigation

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      appEvents: [{text:'Started Application', description: '', type: 'info', duration:0}],
      backend: 'client',
      appEventCollapsed: true,
    };

    // React Context function to send App wide messages displayed in header
    this.sendAppEvent = (options) => {
      let timestamp = options.timestamp || Date(Date.now);
      this.setState((prevState) => {
        let state = {
          appEvents: [...prevState.appEvents, 
            { text: options.text || '', 
              description: options.description || '', 
              type: options.type || 'info', 
              duration: options.duration || 0,
              timestamp: timestamp
            }
          ]
        };
        return state;
      })
    };

    this.toggleBackend = this.toggleBackend.bind(this);
  }

  toggleBackend() {
    this.setState((prevState) => {
      return { backend: (prevState.backend == 'client' ? 'aws' : 'client') };
    });
  }

  toggleCollapsed() {
    this.setState((prevState) => {
      return { appEventCollapsed: !prevState.appEventCollapsed};
    });
  }

  render() {
    return (
      <AppContext.Provider value={{...this.state, sendAppEvent: this.sendAppEvent}}>
        <NavigationContainer>
          <Stack.Navigator 
            initialRouteName='Home'
            headerMode='screen'
            >
            <Stack.Screen 
              name='Browse Cars'
              component={Home}
              options={{ header: props => <Header {...props}
                  backend={this.state.backend}
                  toggleBackend={this.toggleBackend}
                  collapsed={this.state.appEventCollapsed}
                  toggleCollapsed={() => this.toggleCollapsed()}
                />}}
            />
            <Stack.Screen 
              name='Car Details'
              component={CarDetails}
              options={
                ({route}) => {
                  return ({ header: props => <Header {...props}
                    backend={this.state.backend}
                    toggleBackend={this.toggleBackend}
                    route={route}
                    collapsed={this.state.appEventCollapsed}
                    toggleCollapsed={() => this.toggleCollapsed()}
                  />})
                }
              }
            />
          </Stack.Navigator>
        </NavigationContainer>
      </AppContext.Provider>
    );
  }
};

const styles = StyleSheet.create({
  alignEnd: {
    alignSelf: 'flex-end',
  },
  columnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftColumn: {
    flex: 1,
    paddingRight: 5,
  },
  rightColumn: {
    flex: 1,
    paddingLeft: 5,
  },

  formLabel: {
    fontSize: SIZES.text.s1,
    color: COLORS.secondary,
  },
  formInput: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    fontSize: SIZES.text.s1,
    color: COLORS.text.dark,
  },
  formInputWrapper: {

  },
  formRow: {
    marginTop: 20,
    marginBottom: 5,
  },
  text: {
    color: COLORS.text.dark,
    fontSize: SIZES.text.default,
  },
});


// import images
const images = {
  'BMW_5_Series': require('./assets/images/BMW_5_Series.png'),
  'BMW_X7': require('./assets/images/BMW_X7.jpg'),
  'Chrysler_Pacifica': require('./assets/images/Chrysler_Pacifica.jpg'),
  'Honda_Accord': require('./assets/images/Honda_Accord.jpg'),
  'Mazda_CX-5': require('./assets/images/Mazda_CX-5.jpg'),
  default_car: require('./assets/images/BMW_5_Series.png'),
}

// disabling React Warnings in App
console.disableYellowBox = true;

export { App as default, styles, images };
