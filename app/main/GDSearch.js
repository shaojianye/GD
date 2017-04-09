/**
 * Created by yeshaojian on 17/3/14.
 */

import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image,
    ListView,
    Dimensions,
    Navigator,
    ActivityIndicator,
    Modal,
    AsyncStorage,
    TextInput,
    DeviceEventEmitter,
} from 'react-native';


const {width, height} = Dimensions.get('window');       // 获取屏幕尺寸
const dismissKeyboard = require('dismissKeyboard');     // 获取键盘回收方法

// 第三方
import {PullList} from 'react-native-pull';

// 引用外部文件
import CommunalNavBar from '../main/GDCommunalNavBar';
import CommunalCell from '../main/GDCommunalCell';
import CommunalDetail from '../main/GDCommunalDetail';
import NoDataView from '../main/GDNoDataView';


export default class GDHome extends Component {

    // 构造
    constructor(props) {
        super(props);
        // 初始状态
        this.state = {
            dataSource: new ListView.DataSource({rowHasChanged:(r1, r2) => r1 !== r2}),
            loaded:false,       // 是否初始化 ListView
        };

        this.data = [];
        this.changeText = '';                       // 改变后的文本

        // 绑定操作
        this.loadData = this.loadData.bind(this);
        this.loadMore = this.loadMore.bind(this);
    }

    // 加载最新数据网络请求
    loadData(resolve) {

        // 文本是否为空
        if (!this.changeText) return;

        // 初始化参数对象
        let params = {
            "q" : this.changeText
        };

        // 加载最新数据请求
        HTTPBase.get('http://guangdiu.com/api/getresult.php', params)
            .then((responseData) => {

                // 清空数组
                this.data = [];

                // 拼接数据
                this.data = this.data.concat(responseData.data);

                // 重新渲染
                this.setState({
                    dataSource: this.state.dataSource.cloneWithRows(this.data),
                    loaded:true,
                });

                // 关闭刷新动画
                if (resolve !== undefined){
                    setTimeout(() => {
                        resolve();
                    }, 1000);
                }

                // 存储数组中最后一个元素的id
                let searchLastID = responseData.data[responseData.data.length - 1].id;
                AsyncStorage.setItem('searchLastID', searchLastID.toString());

            })
            .catch((error) => {

            })
    }

    // 加载更多数据的网络请求
    loadMoreData(value) {

        // 初始化参数对象
        let params = {
            "q" : this.changeText,
            "sinceid" : value
        };

        // 加载更多请求
        HTTPBase.get('http://guangdiu.com/api/getresult.php', params)
            .then((responseData) => {

                // 拼接数据
                this.data = this.data.concat(responseData.data);

                this.setState({
                    dataSource: this.state.dataSource.cloneWithRows(this.data),
                    loaded:true,
                });

                // 存储数组中最后一个元素的id
                let searchLastID = responseData.data[responseData.data.length - 1].id;
                AsyncStorage.setItem('searchLastID', searchLastID.toString());
            })
            .catch((error) => {

            })
    }

    // 加载更多数据操作
    loadMore() {
        // 读取id
        AsyncStorage.getItem('searchLastID')
            .then((value) => {
                // 数据加载操作
                this.loadMoreData(value);
            })

    }

    // 返回
    pop() {
        // 回收键盘
        dismissKeyboard();

        this.props.navigator.pop();
    }

    // 跳转到详情页
    pushToDetail(value) {
        this.props.navigator.push({
            component:CommunalDetail,
            params: {
                url: 'https://guangdiu.com/api/showdetail.php' + '?' + 'id=' + value
            }
        })
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

    // 返回中间按钮
    renderTitleItem() {
        return(
            <Text style={styles.navBarTitleItemStyle}>搜索全网折扣</Text>
        );
    }

    // ListView尾部
    renderFooter() {
        return (
            <View style={{height: 100}}>
                {/* 旋转的小菊花 */}
                <ActivityIndicator />
            </View>
        );
    }

    // 返回每一行cell的样式
    renderRow(rowData) {
        return(
            <TouchableOpacity
                onPress={() => this.pushToDetail(rowData.id)}
            >
                <CommunalCell
                    image={rowData.image}
                    title={rowData.title}
                    mall={rowData.mall}
                    pubTime={rowData.pubtime}
                    fromSite={rowData.fromsite}
                />
            </TouchableOpacity>
        );
    }

    // 根据网络状态决定是否渲染 ListView
    renderListView() {
        if (this.state.loaded === false) {      // 无数据
            return(
                <NoDataView />
            );
        }else {
            return(     // 有数据
                <PullList
                    onPullRelease={(resolve) => this.loadData(resolve)}     // 下拉刷新操作
                    dataSource={this.state.dataSource}          // 设置数据源
                    renderRow={this.renderRow.bind(this)}       // 根据数据创建相应 cell
                    showsHorizontalScrollIndicator={false}      // 隐藏水平指示器
                    style={styles.listViewStyle}                // 样式
                    initialListSize={7}                         // 优化:一次渲染几条数据
                    renderHeader={this.renderHeader}            // 设置头部视图
                    onEndReached={this.loadMore}                // 当接近底部特定距离时调用
                    onEndReachedThreshold={60}                  // 当接近底部60时调用
                    renderFooter={this.renderFooter}            // 设置尾部视图
                />
            );
        }
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

    render() {
        return (
            <View style={styles.container}>
                {/* 导航栏样式 */}
                <CommunalNavBar
                    leftItem = {() => this.renderLeftItem()}
                    titleItem = {() => this.renderTitleItem()}
                />

                {/* 顶部工具栏 */}
                <View style={styles.toolsViewStyle} >

                    {/* 左边 */}
                    <View style={styles.inputViewStyle} >
                        <Image source={{uri:'search_icon_20x20'}} style={styles.searchImageStyle} />
                        <TextInput
                            style={styles.textInputStyle}
                            keyboardType="default"
                            placeholder="请输入搜索商品关键字"
                            placeholderTextColor='gray'
                            autoFocus={true}
                            clearButtonMode="while-editing"
                            onChangeText={(text) => {this.changeText = text}}
                            onEndEditing={() => this.loadData()}
                            underlineColorAndroid={'transparent'}
                        />
                    </View>

                    {/* 右边 */}
                    <View style={{marginRight:10}}>
                        <TouchableOpacity
                            onPress={() => this.pop()}
                        >
                            <Text style={{color:'green'}}>取消</Text>
                        </TouchableOpacity>
                    </View>

                </View>

                {/* 根据网络状态决定是否渲染 listview */}
                {this.renderListView()}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: 'white',
    },

    navBarLeftItemStyle: {
        width:20,
        height:20,
        marginLeft:15,
    },
    navBarTitleItemStyle: {
        fontSize:17,
        color:'black',
        marginRight:50
    },

    toolsViewStyle: {
        width:width,
        height:44,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between',
    },

    inputViewStyle: {
        height:35,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'rgba(239,239,241,1.0)',
        marginLeft:10,
        borderRadius:5
    },
    searchImageStyle: {
        width:15,
        height:15,
        marginLeft:8
    },
    textInputStyle: {
        width:width * 0.75,
        height:35,
        marginLeft:8
    },

    listViewStyle: {
        width:width,
    },
});
