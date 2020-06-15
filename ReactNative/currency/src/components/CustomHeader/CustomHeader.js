import React from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
} from 'react-native';

import { Button } from 'react-native-material-ui';

import UserDrawerIcon from '../UserDrawer/UserDrawerIcon';
import styles from '../../App';
import { COLORS, SIZES } from '../../constants/Constants';

const CustomHeader = (props) => {
  return (
    <View style={compStyles.customHeader}>
      <Text style={compStyles.headerText}>{props.title}</Text>
    	<UserDrawerIcon style={compStyles.headerIcon} navigation={props.navigation} />
    </View>
  );
};

// component-specific styling
const compStyles = StyleSheet.create({
  customHeader: {
    backgroundColor: COLORS.primary,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 5,
    color: '#FFF',
    fontSize: SIZES.text.s3,
    fontWeight: "500",
    alignSelf:'flex-start'
  },
  headerIcon: {
    alignSelf: 'flex-end',
  }
});

export default CustomHeader;
