import React from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
} from 'react-native';

import { Button } from 'react-native-material-ui';
import CurrencyList from '../CurrencyList/CurrencyList';
import MarketIndex from  '../MarketIndex/MarketIndex';
import CustomHeader from '../CustomHeader/CustomHeader';
import Card from '../Containers/Card';
import App from '../../App';
import styles from '../../App';

import * as Corticon from '../../../corticon/decisionServiceHandler';

const appJson = require('../../../app.json');
const template = require('../../../corticon/currencyExchangeTemplate.json');
const payload = require('../../../corticon/currencyExchangeTemplate.json');
const entities = appJson.demo.currencyList.map(currency => {
  return {
    Currency: {
      'rate': appJson.demo.value.curr[currency],
      'previousRate': appJson.demo.value.one_week[currency],
      'name': currency,
    }
  };
});
const Home = (props) => {
  const currencyExchange = Corticon.runDecisionService(Corticon.payload(entities));
  return (
    <View>
      <CustomHeader navigation={props.navigation} title='Home'/>
      <ScrollView>
        <Card>
          <MarketIndex>
          </MarketIndex>
        </Card>
        <Card>
          <CurrencyList currencies={currencyExchange.Objects} />
        </Card>
        <View>
          <Button
            raised
            text="Go to Currency Exchange"
            onPress={() => 
              props.navigation.navigate('Exchange')
            }
          />
        </View>
      </ScrollView>
    </View>
  );
};

// component-specific styling
const compStyles = StyleSheet.create({
  
});

export default Home;
