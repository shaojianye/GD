/**
 * Created by yeshaojian on 2017/3/25.
 */
import React, { Component } from 'react';
import {
    StyleSheet,
    Image,
    Dimensions,
} from 'react-native';

// 获取屏幕尺寸
const {width, height} = Dimensions.get('window');

// 引入外部文件
import Main from './GDMain';

export default class GDLaunchPage extends Component {

    // 组件加载完成
    componentDidMount() {
        setTimeout(() => {
            this.props.navigator.replace({
                component:Main
            })
        }, 1500)
    }

    render() {
        return(
            // 启动页
            <Image source={{uri:'launchimage'}} style={styles.imageStyle} />
        );
    }
}

const styles = StyleSheet.create({
    imageStyle: {
        width:width,
        height:height,
    }
});