import React, { useState } from 'react';
import {
  Button,
  StyleSheet,
  ScrollView,
  Switch,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';

import AppEvent from '../AppEvent/AppEvent';
import { COLORS, SIZES } from '../../constants/Constants';
import Icon from 'react-native-vector-icons/Ionicons';

const Header = (props) => {
  const route = props.scene.route;

  return (
    <View style={[compStyles.header, props.backend == 'client' ? compStyles.headerOffline : compStyles.headerOnline]}>
      <View style={compStyles.headerLeft}>
        {props.previous &&
          <TouchableOpacity
            onPress={() => props.navigation.goBack()}>
            <View style={compStyles.backButton}>
              <Icon style={compStyles.backIcon} name="md-arrow-back" color={COLORS.secondary}/>
            </View>
          </TouchableOpacity>
        }
      </View>
      <TouchableWithoutFeedback
        onPress={() => props.toggleCollapsed()}
      >
        <Text style={compStyles.headerTitle}>
          {(route.params && route.params.name) || route.name}
        </Text>
      </TouchableWithoutFeedback>
      <View style={compStyles.headerRight}>
        {(props.backend == 'client') && (<Text>Offline</Text>)}
        {(props.backend == 'aws') && (<Text>AWS</Text>)}
        <Switch
          trackColor={{ false: COLORS.background.light, true: COLORS.secondary_accent }}
          thumbColor={props.backend == 'aws' ? "#f5dd4b" : "#f4f3f4"}
          onValueChange={()=>{props.toggleBackend()}}
          value={props.backend == 'aws'}
        />
      </View>
      <View style={compStyles.headerEventsList}>
        <AppEvent collapsed={props.collapsed} color={props.backend == 'client' ? COLORS.accent : COLORS.secondary_accent}/>
      </View>
    </View>
  );
};

// component-specific styling
const compStyles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.primary,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  headerOffline: {
    backgroundColor: COLORS.primary,
  },
  headerOnline: {
    backgroundColor: COLORS.secondary,
  },
  headerLeft: {
    minWidth: 50,
  },
  headerRight: {
    alignItems: 'center',
  },
  headerTitle: {
    color: COLORS.text.dark,
    fontSize: SIZES.text.s2,
  },
  backIcon: {
    color: COLORS.text.light,
    fontSize: SIZES.text.s2,
  },
  backButton: {
    paddingLeft: 15,
    paddingRight: 15,
  },
  headerEventsList: {
    width: '100%',
  },
});

export default Header;
