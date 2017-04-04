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
} from 'react-native';

// 第三方
import {PullList} from 'react-native-pull';

const {width, height} = Dimensions.get('window');
const dismissKeyboard = require('dismissKeyboard');

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
            loaded:false,
            isModal:false
        };

        this.data = [];
        this.changeText = '';
        this.loadData = this.loadData.bind(this);
        this.loadMore = this.loadMore.bind(this);
    }

    // 加载最新数据网络请求
    loadData(resolve) {

        if (!this.changeText) return;

        let params = {
            "q" : this.changeText
        };

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

        let params = {
            "q" : this.changeText,
            "sinceid" : value
        };

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

    // 返回左边按钮
    renderLeftItem() {
        return(
            <TouchableOpacity
                onPress={() => {this.pop()}}
            >
                <View style={{flexDirection:'row', alignItems:'center'}}>
                    <Image source={{uri:'back'}} style={styles.navbarLeftItemStyle} />
                    <Text>返回</Text>
                </View>

            </TouchableOpacity>
        );
    }

    // 返回中间按钮
    renderTitleItem() {
        return(
            <Text>搜索全网折扣</Text>
        );
    }

    // ListView尾部
    renderFooter() {
        return (
            <View style={{height: 100}}>
                <ActivityIndicator />
            </View>
        );
    }

    // 根据网络状态决定是否渲染 listview
    renderListView() {
        if (this.state.loaded === false) {
            return(
                <NoDataView />
            );
        }else {
            return(
                <PullList
                    onPullRelease={(resolve) => this.loadData(resolve)}
                    dataSource={this.state.dataSource}
                    renderRow={this.renderRow.bind(this)}
                    showsHorizontalScrollIndicator={false}
                    style={styles.listViewStyle}
                    initialListSize={5}
                    renderHeader={this.renderHeader}
                    onEndReached={this.loadMore}
                    onEndReachedThreshold={60}
                    renderFooter={this.renderFooter}
                />
            );
        }
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

    navbarLeftItemStyle: {
        width:20,
        height:20,
        marginLeft:15,
    },
    navbarTitleItemStyle: {
        width:66,
        height:20,
    },
    navbarRightItemStyle: {
        width:20,
        height:20,
        marginRight:15,
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
