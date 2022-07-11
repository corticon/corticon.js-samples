import React, { Component } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TextInput,
  Modal,
  TouchableHighlight,
  TouchableWithoutFeedback,
} from 'react-native';
import { Icon } from 'react-native-material-ui';
import { Picker } from '@react-native-community/picker';
import App from '../../App';
import styles from '../../App';
import Card from '../Containers/Card';
import CustomHeader from '../CustomHeader/CustomHeader';
import CurrencyLabel from '../CurrencyLabel/CurrencyLabel';
import ListItem from '../Containers/ListItem';
import { COLORS, SIZES } from '../../constants/Constants';

//TODO: move modal out into component
const appJson = require('../../../app.json');

// When selection changes, query corticon for rate?
class Exchange extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currencySell: 'EUR',
      currencyBuy: 'USD',
      quantitySell: 0,
      quantityBuy: 0,
      modalVisible: false,
      modalPicker: 0,
    };

    this.onQuantitySellChange = this.onQuantitySellChange.bind(this);
    this.getRate = this.getRate.bind(this);
  }

  //TODO decimal/prcision
  onQuantitySellChange(text) {
    const n = parseInt(text, 10)
    this.setState({ 
      quantitySell: n,
      quantityBuy: (n * this.getRate()).toFixed(2),
    });
  };
  
  setModalVisible = (visible) => {
    this.setState({ modalVisible: visible });
  }

  getRate(sell=this.state.currencySell, buy=this.state.currencyBuy) {
    // TODO: connect me

    //temporary default
    return appJson.demo.value.curr[this.state.currencyBuy] / appJson.demo.value.curr[this.state.currencySell];
  }

  render() {
    return (
      <View>
        <CustomHeader navigation={this.props.navigation} title='Exchange'/>
        <Modal
          animationType="none"
          transparent={true}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            Alert.alert("Modal has been closed.");
          }}
          style={compStyles.modal}
        >
          <TouchableWithoutFeedback
            onPress={() => this.setModalVisible(!this.state.modalVisible)}
          > 
            <View style={compStyles.modalWrapper}>
              <View style={compStyles.modalContent}>
                <ScrollView>
                  {appJson.demo.currencyList.map(currency => {
                    return (
                      <ListItem>
                        <TouchableHighlight
                          activeOpacity={0.6}
                          underlayColor={COLORS.background.dark}
                          style={compStyles.picker}
                          onPress={() => {
                            this.setState(this.state.modalPicker ? {currencyBuy: currency} : {currencySell: currency})
                            this.setModalVisible(false);
                          }}>
                          <CurrencyLabel currency={currency}/>
                        </TouchableHighlight>
                      </ListItem>
                    )
                  })}
                </ScrollView>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
        <ScrollView>
          <Card>
            <View>
              <View style={compStyles.currencyRow}>
                <View style={compStyles.currencyPicker}>
                  <TouchableHighlight
                    activeOpacity={0.6}
                    underlayColor={COLORS.background.dark}
                    style={compStyles.picker}
                    onPress={() => {
                      this.setModalVisible(!this.state.modalVisible);
                      this.setState({modalPicker: 0});
                    }}>
                    <CurrencyLabel currency={this.state.currencySell} />
                  </TouchableHighlight>
                  
                </View>
                <View style={compStyles.currencyRowInput}>
                  <TextInput
                    style={compStyles.textInput}
                    onChangeText={(text) => { 
                      this.onQuantitySellChange(text);
                    }}
                    value={this.state.quantitySell.toString()}
                    placeholder="0"
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <View style={compStyles.rateRow}>
                <View style={compStyles.rate}>
                  <Text>{this.getRate()}</Text>
                </View>
              </View>
              <View style={compStyles.currencyRow}>
                <View style={compStyles.currencyPicker}>
                  <TouchableHighlight
                    activeOpacity={0.6}
                    underlayColor={COLORS.background.dark}
                    style={compStyles.picker}
                    onPress={() => {
                      this.setModalVisible(!this.state.modalVisible);
                      this.setState({modalPicker: 1})
                    }}>
                    <CurrencyLabel currency={this.state.currencyBuy} />
                  </TouchableHighlight>
                </View>
                <View style={compStyles.currencyRowInput}>
                  <TextInput
                    style={compStyles.textInput}
                    value={this.state.quantityBuy.toString()}
                    placeholder="0"
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
          </Card>
        </ScrollView>
      </View>
    );
  }
};

// component-specific styling
const compStyles = StyleSheet.create({
  currencyPicker: {
    flex: 2,
  },
  currencyRow: {
    display: 'flex',
    flexDirection: 'row',
  },
  currencyRowInput: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    margin: 10,
  },
  textInput: {
    fontSize: SIZES.text.s2,
  },
  modal: {
    
  },
  modalWrapper: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#00000080",
  },
  modalContent: {
    backgroundColor: COLORS.background.light,
    padding: 10,
    maxWidth: '75%',
    maxHeight: '50%',
  },
});

export default Exchange;
