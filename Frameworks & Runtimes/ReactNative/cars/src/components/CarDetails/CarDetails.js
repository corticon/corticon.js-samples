import React, { Component } from 'react';
import {
  Image,
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';

import Card from '../Containers/Card';
import CarInsurance from '../CarInsurance/CarInsurance';
import Icon from 'react-native-vector-icons/FontAwesome';

import { COLORS, SIZES } from '../../constants/Constants';
import { images, styles } from '../../App';

class CarDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      insurancePremium: 0,
      detailCollapsed: true,
    };
  }

  totalPrice() {
    return (this.props.route.params ? this.props.route.params.price : 0) + this.state.insurancePremium; 
  }

  // handle expand details show/hide
  onExpandDetailsPress() {
    this.setState((prevState) => {
      return { detailCollapsed: !prevState.detailCollapsed};
    });
  }

  render() {
    const route = this.props.route;
    const curr_symbol = require('../../../demo-data.json')["curr-symbol"];
    return (
      <ScrollView>
        <View style={compStyles.imageContainer}>
          <Image style={compStyles.image} source={images[(route.params && route.params.image) || 'default_car']}/>
        </View>
        <Card>
          <View>
            <View style={[styles.columnContainer, compStyles.row]}>
              <Text style={[styles.text, styles.leftColumn]}>Total Price</Text>
              <Text style={[styles.text, styles.rightColumn]}>Your Premium</Text>
            </View>

            <View style={[styles.columnContainer, compStyles.row]}>
              <View style={[styles.columnContainer, styles.leftColumn]}>
                <Text style={[styles.text]}>{route.params && (curr_symbol + route.params.price)} </Text>
                {(this.state.insurancePremium != 0) && (
                  <>
                    <Icon style={[compStyles.newPrice]} name="angle-double-right" color={COLORS.secondary}/>
                    <Text style={[styles.text, compStyles.newPrice]}> {curr_symbol + this.totalPrice()}</Text>
                  </>
                  )}
              </View>
              <Text style={[styles.text, styles.rightColumn]}>{curr_symbol + this.state.insurancePremium}</Text>
            </View>
          </View>
          <View
            style={[compStyles.collapsible, this.state.detailCollapsed ? compStyles.collapsed : compStyles.expanded]}>
            <View style={[styles.columnContainer, compStyles.collapsibleContent]}>
              <View style={styles.leftColumn}>
                <View style={[styles.columnContainer, compStyles.row]}>
                  <Text style={[styles.text, styles.leftColumn]}>Base Price</Text>
                  <View style={[styles.columnContainer, styles.rightColumn]}>
                    <Text style={[styles.text, styles.rightColumn]}>{route.params && (curr_symbol + route.params.price)}</Text>
                    {(this.state.insurancePremium != 0) && (
                      <>
                        <Icon style={[compStyles.newPrice]} name="angle-double-right" color={COLORS.secondary}/>
                        <Text style={[styles.text, styles.rightColumn, compStyles.newPrice]}>{curr_symbol + this.totalPrice()}</Text>
                      </>
                      )}
                  </View>
                </View>
                <View style={[styles.columnContainer, compStyles.row]}>
                  <Text style={[styles.text, styles.leftColumn]}>Class</Text>
                  <Text style={[styles.text, styles.rightColumn]}>{route.params && route.params.class}</Text>
                </View>
                <View style={[styles.columnContainer, compStyles.row]}>
                  <Text style={[styles.text, styles.leftColumn]}>Trans.</Text>
                  <Text style={[styles.text, styles.rightColumn]}>{route.params && route.params.transmission}</Text>
                </View>
              </View>
              <View style={styles.rightColumn}>
                <View style={[styles.columnContainer, compStyles.row]}>
                  <Text style={[styles.text, styles.leftColumn]}>Doors</Text>
                  <Text style={[styles.text, styles.rightColumn]}>{route.params && route.params.doors}</Text>
                </View>
                <View style={[styles.columnContainer, compStyles.row]}>
                  <Text style={[styles.text, styles.leftColumn]}>Seats</Text>
                  <Text style={[styles.text, styles.rightColumn]}>{route.params && route.params.seats}</Text>
                </View>
                <View style={[styles.columnContainer, compStyles.row]}>
                  <Text style={[styles.text, styles.leftColumn]}>Luggage</Text>
                  <Text style={[styles.text, styles.rightColumn]}>{route.params && route.params.luggage}</Text>
                </View>
              </View>
            </View>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={this.onExpandDetailsPress.bind(this)}
            style={compStyles.expandButton}>
            {this.state.detailCollapsed ? 
              (<>
                <Icon name="angle-double-down" size={SIZES.text.s2} color={COLORS.background.dark_accent}/>
              </>) : 
              (<>
                <Icon name="angle-double-up" size={SIZES.text.s2}  color={COLORS.background.dark_accent}/>
              </>)}
            {!this}
          </TouchableOpacity>
        </Card>
        <Card>
          <CarInsurance updateRate={premium => this.setState({insurancePremium: premium})}/>
        </Card>
      </ScrollView>
    );
  }
};

// component-specific styling
const compStyles = StyleSheet.create({
  row: {
    marginBottom: 15,
  },
  imageContainer: {
    backgroundColor: COLORS.background.light,
    height: 180,
  },
  image: {
    flex: 1,
    width: null,
    height: null,
    resizeMode: 'contain',
    padding: 5,
  },
  icon: {

  },
  newPrice: {
    color: COLORS.secondary,
    fontSize: SIZES.s1
  },
  expandButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  collapsible: {
    overflow: 'hidden',
  },
  collapsed: {
    height: 0,
  },
  expanded: {
    height: 'auto',
  },
  collapsibleContent: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 15,
  }
});

export default CarDetails;
