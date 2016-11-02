'use strict';

import React, { Component } from 'react';
import {
  AppRegistry,
  Navigator,
  StyleSheet,
  StatusBar,
  Platform,
  Text,
  View
} from 'react-native';
import {Router, Route, Schema, Animations, Actions, Scene} from 'react-native-router-flux';
import RoqyaList from './components/roqyas/RoqyaList';
import Player from './components/player/Player';
import { Author } from './data';

class RouterComponent extends Component {
  render() {
    if(Platform.OS === "ios") {
      return <Router navigationBarStyle={styles.container} titleStyle={styles.IOSnavBarTitle}>
        <Scene key="root">
          <Scene key="roqyaList" component={RoqyaList} initial={true} title="Al Ruqya"/>
          <Scene key="player" component={Player} hideNavBar={true} title="Player" titleStyle={styles.navbarPlayerTitle}/>
        </Scene>
      </Router> 
    } else {
      return <Router navigationBarStyle={styles.navBar} titleStyle={styles.navBarTitle} barButtonTextStyle={styles.barButtonTextStyle} barButtonIconStyle={styles.barButtonIconStyle}>
        <Scene key="root">
          <Scene key="roqyaList" component={RoqyaList} initial={true} title="Al Ruqya"/>
          <Scene key="player" component={Player} title="Player" titleStyle={styles.navbarPlayerTitle}/>
        </Scene>
      </Router> 
    }
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,0,0,0)',
    borderBottomWidth: 0,
  },
  navBar: {
    backgroundColor:'#1E9CA6'
  },
  IOSnavBarTitle: {
    color:'white',
  },
  navBarTitle:{
      color:'#FFFFFF',
      textAlign: 'left',
      marginLeft: 20
  },
  barButtonTextStyle:{
      color:'#FFFFFF'
  },
  navbarPlayerTitle: {
    marginLeft: 50
  },
  barButtonIconStyle:{
      tintColor:'rgb(255,255,255)'
  },
});

module.exports = RouterComponent;