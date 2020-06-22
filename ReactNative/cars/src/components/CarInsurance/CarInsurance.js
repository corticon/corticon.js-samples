import React, { Component } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TextInput,
} from 'react-native';

import { COLORS, SIZES } from '../../constants/Constants';
import { images, styles } from '../../App';
import { AppContext } from '../../AppContext'
import  * as RentalDecisionService from "../../../corticon/decisionServiceHandler";

import RNPickerSelect from 'react-native-picker-select';

class CarInsurance extends Component {
  static contextType = AppContext;


  // default fields in form, consider populating from demo-data.json
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      age: '25',
      licenseYears: '7',
      gender: 'male',
      coverage: 'Limited',
    };
  }

  calculateInsurancePremium() {
    if (!(this.state.age && this.state.coverage && this.state.gender && this.state.licenseYears)) { return; }

    // array of entities required by decision service
    let entities = [
      {
        "Applicant": {
          "Name": this.state.name,
          "Age": parseInt(this.state.age) || 0,
          "DamageWaiver": this.state.coverage,
          "Gender": this.state.gender,
          "YearsDriving": parseInt(this.state.licenseYears) || 0,
        }
      },
    ]

    let startTime = Date.now;
    this.context.sendAppEvent({
      text: 'Calling DS on ' + this.context.backend,
      timestamp: Date(startTime),
    });
    
    // handler function to handle asynchronous response
    let responseHandler = (result) => {
      //alert(JSON.stringify(result, {}, 2));
      let endTime = Date.now() - startTime()
      this.context.sendAppEvent({
        text: 'Finished DS round-trip on ' + this.context.backend + ' in ' + endTime + 'ms',
        duration: endTime,
      });
      
      this.context.sendAppEvent({
        text: 'DS Status: ' + result.status
      });
   
      let insurancePremium = Number.parseFloat(result.Objects[0].Premium);

      // Check Decision Service status
      // if not 'success', then handle error
      if (result.status == 'success' && insurancePremium && insurancePremium != 0) {
        this.context.sendAppEvent({
          text: 'The resulting driver premium was €' + insurancePremium});
        this.props.updateRate(insurancePremium);
      } else {
        this.context.sendAppEvent({
          text: 'DS ' + result.description,
          type: 'error', 
        });
        //handle error
      }

    } // end responseHandler

    RentalDecisionService.runDecisionService(entities, {}, this.context.backend, responseHandler.bind(this));
  }

  render() {
    return (
      <View>
        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Name</Text>
          <View style={styles.formInputWrapper}>
            <TextInput
              style={styles.formInput}
              onChangeText={(text) => this.setState({name: text})}
              onEndEditing={() => this.calculateInsurancePremium()}
              value={this.state.name.toString()}
            />
          </View>
        </View>
        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Age</Text>
          <View style={styles.formInputWrapper}>
            <TextInput
              style={styles.formInput}
              onChangeText={(text) => this.setState({age: text})}
              onEndEditing={() => this.calculateInsurancePremium()}
              value={this.state.age.toString()}
              keyboardType="numeric"
            />
          </View>
        </View>
        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Years since getting License</Text>
          <View style={styles.formInputWrapper}>
            <TextInput
              style={styles.formInput}
              onChangeText={(text) => this.setState({licenseYears: text})}
              onEndEditing={() => this.calculateInsurancePremium()}
              value={this.state.licenseYears.toString()}
              keyboardType="numeric"
            />
          </View>
        </View>
        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Gender</Text>
          <View style={styles.formInputWrapper}>
            <RNPickerSelect
              placeholder={{
                label: '',
                value: null,
              }}
              style={{placeholder: styles.formInput}}
              onValueChange={(value) => {
                this.setState({gender: value}, ()=>this.calculateInsurancePremium());
              }}
              items={[
                  { label: 'male', value: 'male' },
                  { label: 'female', value: 'female' },
                  { label: 'other', value: 'other' },
              ]}
              value={this.state.gender.toString()}
            />
          </View>
        </View>
        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Damage Coverage</Text>
          <View style={styles.formInputWrapper}>
            <RNPickerSelect
              placeholder={{
                label: '',
                value: null,
              }}
              style={{placeholder: styles.formInput}}
              onValueChange={(value) => {
                this.setState({coverage: value}, ()=>this.calculateInsurancePremium());
              }}
              items={[
                  { label: 'Limited', value: 'Limited' },
                  { label: 'Full', value: 'Full' },
              ]}
              value={this.state.coverage.toString()}
            />
          </View>
        </View>
      </View>
    );
  }
};

// component-specific styling
const compStyles = StyleSheet.create({
  
});

export default CarInsurance;
