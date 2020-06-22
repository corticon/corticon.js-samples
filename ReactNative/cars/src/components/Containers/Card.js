import React from 'react';
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';

import styles from '../../App';
import { COLORS } from '../../constants/Constants';

const Card = (props) => {
  return (
    <View style={compStyles.cardContainer}>
      <View style={compStyles.cardContent}>
        {props.children}
      </View>
    </View>
  );
};

// component-specific styling
const compStyles = StyleSheet.create({
  cardContainer: {
    backgroundColor: COLORS.background.light,
    padding: 10,
    margin: 5,
    borderRadius: 2,
  },
  cardContent: {
    paddingLeft: 10,
    paddingTop: 20,
    paddingRight: 10,
    paddingBottom: 10,
  },

});

export default Card;
