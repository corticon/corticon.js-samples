import React from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
} from 'react-native';

import Card from '../Containers/Card';
import CarSummary from '../CarSummary/CarSummary';

// Demo Data
const data = require('../../../demo-data.json');
const cars = data.cars['set-0'];

const Home = (props) => {
  return (
    <ScrollView>
      {cars && cars.map(car => {
        return (
          <Card>
            <CarSummary 
              onPress={() => {
                props.navigation.navigate('Car Details', car);
              }}
              {...car}/>
          </Card>
        )
      })}
    </ScrollView>
  );
};

// component-specific styling
const compStyles = StyleSheet.create({
  
});

export default Home;
