import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableHighlight,
} from 'react-native';

import { Icon, Button } from 'react-native-material-ui';

import styles from '../../App';
import { SIZES } from '../../constants/Constants'

const UserDrawerIcon = (props) => {
  return (
		<TouchableHighlight
      activeOpacity={0.6}
      underlayColor={compStyles.drawerUnderlay}
      style={compStyles.drawer}
      onPress={() => props.navigation.openDrawer()}>
      <Icon style={compStyles.drawerIcon} name='bars' iconSet='FontAwesome'/>
    </TouchableHighlight>
  );
};

// component-specific styling
const compStyles = StyleSheet.create({
  drawerUnderlay: {
    color: '#2e0d4a',
  },
  drawerIcon: {
    fontSize: SIZES.text.s3,
    color: '#FFF',
  },
  drawer: {
    marginRight: 10,
  }
});

export default UserDrawerIcon;
