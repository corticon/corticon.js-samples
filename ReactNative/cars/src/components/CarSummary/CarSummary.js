import React from 'react';
import {
  Image,
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableWithoutFeedback,

} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';
import {COLORS, SIZES} from '../../constants/Constants';
import {images, styles} from '../../App';

const CarSummary = (props) => {
 
  return (
    <TouchableWithoutFeedback
      onPress={props.onPress}
    >
      <View>
        <View style={compStyles.carSummaryHeader}>
          <Text style={compStyles.carName}>{props.name}</Text>
          <Text style={[compStyles.infoText]}>&euro;{props.price} / day base</Text>
        </View>
        <View style={compStyles.carSummaryBody}>
          <Image
            style={compStyles.carThumbnail}
            source={images[props.image]}
          />
          <View style={compStyles.carInfo}>
            <View style={compStyles.infoLine}>
              <Icon style={compStyles.icon} name="car" color={COLORS.secondary}/>
              <Text style={compStyles.infoText}>{props.class}</Text>
            </View>
            <View style={compStyles.infoLine}>
              <Icon style={compStyles.icon} name="gears" color={COLORS.secondary}/>
              <Text style={compStyles.infoText}>{props.transmission} Transmission</Text>
            </View>
            <View style={compStyles.infoLine}>
              <Icon style={compStyles.icon} name="snowflake-o" color={COLORS.secondary}/>
              <Text style={compStyles.infoText}>{props.hasAC ? "Yes" : "No"}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

// component-specific styling
const compStyles = StyleSheet.create({
  carSummaryBody: {
    flexDirection: 'row',
  },
  carSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginLeft: 10,
    marginRight: 10,
    paddingBottom: 10,

  },
  carName: {
    fontSize: SIZES.text.s2,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  carInfo: {
    flex: 1,
    paddingTop: 15,
    paddingBottom: 15,
    paddingLeft: 15,
  },
  carThumbnail: {
    flex: 1,
    width: null,
    height: null,
    resizeMode: 'contain',
    paddingTop: 15,
    paddingBottom: 15,
    paddingRight: 15,
  },
  infoLine: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 5,
    paddingLeft: 5,
    paddingBottom: 5,
  },
  infoText: {
    fontSize: SIZES.text.default,
  },
  icon: {
    fontSize: SIZES.text.default,
    paddingRight: 5,
  },
});

export default CarSummary;
