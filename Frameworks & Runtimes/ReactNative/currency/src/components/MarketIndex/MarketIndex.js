import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
} from 'react-native';

import { Icon } from 'react-native-material-ui';
import { COLORS, SIZES } from '../../constants/Constants';
import styles from '../../App';


const MarketIndex = (props) => {
  return (
    <View style={compStyles.marketIndexContainer}>
      <View style={[compStyles.currencyInfo]}>
        <View style={[compStyles.currencyChange]}>
          <Icon style={[compStyles.icon, compStyles.iconUp]} name={"angle-double-up"} iconSet='FontAwesome'/>
          <Text style={compStyles.percentLabel}>0.91%</Text>
        </View>
        <Text style={compStyles.currencyLabel}>EUR/USD</Text>
      </View>
      <View style={[compStyles.currencyInfo]}>
        <View style={[compStyles.currencyChange]}>
          <Icon style={[compStyles.icon, compStyles.iconDown]} name={"angle-double-down"} iconSet='FontAwesome'/>
          <Text style={compStyles.percentLabel}>1.21%</Text>
        </View>
        <Text style={compStyles.currencyLabel}>CAD/USD</Text>
      </View>
      <View style={[compStyles.currencyInfo]}>
        <View style={[compStyles.currencyChange]}>
          <Icon style={[compStyles.icon, compStyles.iconUp]} name={"angle-double-up"} iconSet='FontAwesome'/>
          <Text style={compStyles.percentLabel}>0.05%</Text>
        </View>
        <Text style={compStyles.currencyLabel}>CNY/USD</Text>
      </View>
    </View>
  );
};

// component-specific styling
const compStyles = StyleSheet.create({
  currencyInfo: {
    width: '30%',
    flex: 1,
    justifyContent: 'center',
  },
  currencyChange: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  marketIndexContainer: {
    display: 'flex',
    flexDirection: 'row',
    paddingTop: 10,
    paddingBottom: 10,
  },
  currencyLabel: {
     textAlign: 'center',
     fontSize: SIZES.text.s2,
  },
  percentLabel: {
    fontSize: SIZES.text.s2,
    color: COLORS.text.info,
    marginTop: 6,
  },
  icon: {
    fontSize: SIZES.text.s4,
    marginRight: 10,
  },
  iconUp: {
    color: COLORS.green,
  },
  iconDown: {
    color: COLORS.red,
  }
});

export default MarketIndex;
