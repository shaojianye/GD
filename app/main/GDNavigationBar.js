/**
 * Created by yeshaojian on 2017/4/15.
 */
import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Navigator,
    TouchableOpacity
} from 'react-native';

const styles = StyleSheet.create({

});

let NavigationBarRouteMapper = {
    LeftButton(route, navigator, index, navState) {
        if (index > 0) {
            return (
                <TouchableOpacity
                    onPress={() => navigator.pop()}
                >
                    <Text>返回</Text>
                </TouchableOpacity>
            )
        }
    },

    RightButton(route, navigator, index, navState) {

    },

    Title(route, navigator, index, navState) {
        return(
            <Text>{route.name}</Text>
        )
    },
};

export default (
    <Navigator.NavigationBar
        style={{backgroundColor:'green'}}
        routeMapper={NavigationBarRouteMapper}
    />
)