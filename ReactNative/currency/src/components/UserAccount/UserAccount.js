import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
} from 'react-native';

import { Icon } from 'react-native-material-ui';
import styles from '../../App';


const UserAccount = ({ navigation }) => {
  return (
    <View>
      <View style={[styles.currencyInfo]}>
        <Icon name={"angle-double-up"} iconSet='FontAwesome'/>
        <Text>USD</Text>
      </View>
      <View style={[styles.currencyInfo]}>
        <Icon name={"angle-double-down"} iconSet='FontAwesome'/>
        <Text>EUR</Text>
      </View>
      <View style={[styles.currencyInfo]}>
        <Icon name={"tilde"} iconSet='MaterialCommunityIcons'/>
        <Text>CNY</Text>
      </View>
    </View>
  );
};

export default UserAccount;
