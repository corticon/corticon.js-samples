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
import ListItem from '../Containers/ListItem';
import CurrencyLabel from '../CurrencyLabel/CurrencyLabel';
import { styles, images } from '../../App';

const CurrencyList = (props) => {
  return (
    <View style={compStyles.currencyListContainer}>
      <View>
        {props.currencies.map(
          currency => {
            return (
              <ListItem>
                <View style={compStyles.currencyListItem}>
                  <CurrencyLabel currency={currency.name} />
                  <Icon style={styles[currency.result]} name='circle' iconSet='FontAwesome'></Icon>
                </View>
                <View style={compStyles.currencyListItemActions}>
                  <Icon name='dots-vertical' iconSet='MaterialCommunityIcons'></Icon>
                </View>
              </ListItem>
            );
          })}
      </View>


    </View>
  );
};

// component-specific styling
const compStyles = StyleSheet.create({
  currencyListContainer: {
    display: 'flex'
  },
  currencyListItem: {
    paddingRight: 15,
    flexDirection: 'row',
    flex: 9,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  currencyListItemActions: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderColor: '#000',
  },
  currencyLabel: {
     fontSize: SIZES.text.s2,
  },
  currencyLabelContainer: {
    marginTop: 4,
  },
  currencyFlag: {
    marginRight: 10,
  },
  currencyListLabel: {
    flexDirection: 'row',
  },
});

export default CurrencyList;
