/**
 * Created by yeshaojian on 17/3/14.
 */

import React, { Component, PropTypes } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Dimensions,
    Platform,
    Image,
} from 'react-native';

const {width, height} = Dimensions.get('window');

export default class GDCommunalNavBar extends Component {

    static propTypes = {
        image:PropTypes.string,
        title:PropTypes.string,
    };

    render() {
        return (
            <View style={styles.container}>
                {/* 左边图片 */}
                <Image source={{uri:this.props.image === '' ? 'defaullt_thumb_83x83' : this.props.image}} style={styles.imageStyle} />
                {/* 中间的文中 */}
                <View>
                    <Text numberOfLines={3} style={styles.titleStyle}>{this.props.title}</Text>
                </View>
                {/* 右边的箭头 */}
                <Image source={{uri:'icon_cell_rightArrow'}} style={styles.arrowStyle} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between',
        backgroundColor:'white',
        height:120,
        width:width,
        borderBottomWidth:0.5,
        borderBottomColor:'gray',
        marginLeft:15,
        overflow:'hidden',
    },

    imageStyle: {
        width:90,
        height:90,
    },
    titleStyle: {
        width:width * 0.60,
    },
    arrowStyle: {
        width:10,
        height:10,
        marginRight:30
    }
});
