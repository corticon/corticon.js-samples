import React, { Component } from 'react';
import {
  Image,
  StyleSheet,
  ScrollView,
  View,
  Text,
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
    };
  }

  totalPrice() {
    return (this.props.route.params ? this.props.route.params.price : 0) + this.state.insurancePremium; 
  }

  render() {
    const route = this.props.route;
    return (
      <ScrollView>
        <View style={compStyles.imageContainer}>
          <Image style={compStyles.image} source={images[(route.params && route.params.image) || 'default_car']}/>
        </View>
        <Card>
          <View style={styles.columnContainer}>
            <View style={styles.leftColumn}>
              <View style={[styles.columnContainer, compStyles.row]}>
                <Text style={[styles.text, styles.leftColumn]}>Price/day</Text>
                <View style={[styles.columnContainer, styles.rightColumn]}>
                  <Text style={[styles.text, styles.rightColumn]}>&euro;{route.params && route.params.price}</Text>
                  {(this.state.insurancePremium != 0) && (
                    <>
                      <Icon style={[compStyles.newPrice]} name="angle-double-right" color={COLORS.secondary}/>
                      <Text style={[styles.text, styles.rightColumn, compStyles.newPrice]}>&euro;{this.totalPrice()}</Text>
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
    height: 200,
  },
  image: {
    flex: 1,
    width: null,
    height: null,
    resizeMode: 'contain',
    padding: 15,
  },
  icon: {

  },
  newPrice: {
    color: COLORS.secondary,
    fontSize: SIZES.s1
  }
});

export default CarDetails;
