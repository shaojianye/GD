/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
    AppRegistry,
    Navigator,
} from 'react-native';

// 引入外部文件
import LaunchPage from './app/main/GDLaunchPage';

export default class GD extends Component {
  render() {
    return (
        <Navigator
            initialRoute={{
                name:'launchPage',
                component:LaunchPage
            }}

            renderScene={(route, navigator) => {
                let Component = route.component;
                return <Component {...route.params} navigator={navigator} />
            }}
        />
    );
  }
}

AppRegistry.registerComponent('GD', () => GD);