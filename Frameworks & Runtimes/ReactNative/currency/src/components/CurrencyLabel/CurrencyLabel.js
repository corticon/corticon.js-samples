import React from 'react';
import {
  Image,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
} from 'react-native';

import { Icon } from 'react-native-material-ui';
import { SIZES } from '../../constants/Constants';
import ListItem from '../Containers/ListItem'
import { styles, images } from '../../App';

const appJson = require('../../../app.json');

const CurrencyLabel = (props) => {
  return (
    <View style={compStyles.currencyLabelContainer}>
      <View style={compStyles.currencyLabel}>
        <Image
          style={compStyles.currencyFlag}
          source={images[props.currency]}
        />
        <View style={compStyles.currencyLabelContainer}>
          <Text style={compStyles.currencyLabel}>{props.currency}</Text>
          <Text>{appJson.demo.fullName[props.currency]}</Text>
        </View>
      </View>
    </View>       
  );
};

// component-specific styling
const compStyles = StyleSheet.create({
  currencyLabelContainer: {

  },
  currencyLabel: {
    marginTop: 4,
    fontSize: SIZES.text.s2,
    flexDirection: 'row',
  },
  currencyFlag: {
    marginRight: 10,
  },
  currencyListLabel: {
    flexDirection: 'row',
  }
});

export default CurrencyLabel;
