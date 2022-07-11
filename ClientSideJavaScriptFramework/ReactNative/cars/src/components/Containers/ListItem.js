import React from 'react';
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';

import styles from '../../App';
import { COLORS } from '../../constants/Constants';

const ListItem = (props) => {
  return (
    <View style={compStyles.listItemContainer}>
      <View style={compStyles.listItemContent}>
        {props.children}
      </View>
    </View>
  );
};

// component-specific styling
const compStyles = StyleSheet.create({
  listItemContainer: {
    backgroundColor: COLORS.background.light,
    margin: 5,

  },
  listItemContent: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },

});

export default ListItem;
