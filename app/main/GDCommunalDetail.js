/**
 * Created by yeshaojian on 2017/3/30.
 */
import React, { Component, PropTypes } from 'react';
import {
    StyleSheet,
    WebView,
    View,
    Text,
    TouchableOpacity,
    DeviceEventEmitter,
    Image,
} from 'react-native';


// 引入外部文件
import CommunalNavBar from './GDCommunalNavBar';


export default class GDCommunalDetail extends Component {

    static propTypes = {
        url:PropTypes.string,
    };

    // 返回
    pop() {
        this.props.navigator.pop();
    }

    // 返回左边按钮
    renderLeftItem() {
        return(
            <TouchableOpacity
                onPress={() => {this.pop()}}
            >
                <View style={{flexDirection:'row', alignItems:'center'}}>
                    <Image source={{uri:'back'}} style={styles.navBarLeftItemStyle} />
                    <Text>返回</Text>
                </View>
            </TouchableOpacity>
        );
    }

    // 准备加载组件
    componentWillMount() {
        // 发送通知
        DeviceEventEmitter.emit('isHiddenTabBar', true);
    }

    // 准备销毁组件
    componentWillUnmount() {
        // 发送通知
        DeviceEventEmitter.emit('isHiddenTabBar', false);
    }

    consoleLog(){

    }

    render() {
        return(
            <View style={styles.container}>
                {/* 导航栏 */}
                <CommunalNavBar
                    leftItem = {() => this.renderLeftItem()}
                />

                {/* 初始化WebView */}
                <WebView ref="webView"
                    style={styles.webViewStyle}                     // 样式
                    source={{uri:this.props.url, method: 'GET' }}   // 路径(uri:路径, method:请求方式)
                    javaScriptEnabled={true}                        // 安卓平台允许javaScript
                    domStorageEnabled={true}                        // 安卓平台允许DOM本地存储
                    scalesPageToFit={false}                         // 不允许网页缩放或用户改变缩放比例
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex:1
    },

    webViewStyle: {
        flex:1
    },

    navBarLeftItemStyle: {
        width:20,
        height:20,
        marginLeft:15,
    },
});