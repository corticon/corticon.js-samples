import React, {Component} from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
} from 'react-native';

import { COLORS } from '../../constants/Constants';
import Collapsible from 'react-native-collapsible';
import { AppContext } from '../../AppContext';

class AppEvent extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
 
  render() {
    return (
      <AppContext.Consumer>
        {({appEvents, sendAppEvent}) => {
          return (
            <Collapsible collapsed={this.props.collapsed}>
              <ScrollView style={compStyles.eventList} ref={ref => {this.scrollView = ref}} onContentSizeChange={() => this.scrollView.scrollToEnd({animated: true})}>
                {appEvents.map(appEvent => {
                  return (
                    <View style={[compStyles.eventTextListItem, {backgroundColor: this.props.color}]}>
                      <Text style={compStyles.eventText}>{appEvent.text}</Text>
                    </View>
                  )
                })}
              </ScrollView>
            </Collapsible>   
        )}}
      </AppContext.Consumer>
    );
  }
};

// component-specific styling
const compStyles = StyleSheet.create({
  eventText: {

  },
  eventTextListItem: {
    backgroundColor: COLORS.accent,
    alignItems: 'center',
  },
  eventList: {
    marginTop: 15,
    marginLeft: 5,
    marginRight: 5,
    marginBottom: 0,
    maxHeight: 150,
  },
});

export default AppEvent;
