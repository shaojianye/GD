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
    InteractionManager,
} from 'react-native';


// 获取屏幕尺寸
const {width, height} = Dimensions.get('window');

// 第三方
import {PullList} from 'react-native-pull';

// 引用外部文件
import CommunalNavBar from '../main/GDCommunalNavBar';
import CommunalCell from '../main/GDCommunalCell';
import CommunalDetail from '../main/GDCommunalDetail';
import NoDataView from '../main/GDNoDataView';
import Settings from './GDSettings';


export default class GDHourList extends Component {

    // 构造
    constructor(props) {
        super(props);
        // 初始状态
        this.state = {
            dataSource: new ListView.DataSource({rowHasChanged:(r1, r2) => r1 !== r2}),
            loaded:false,       // 是否初始化 ListView
            prompt:'',          // 标题栏状态
            isNextTouch:false   // 下一小时按钮状态
        };

        this.nexthourhour = '';     // 下一小时时间
        this.nexthourdate = '';     // 下一小时日期
        this.lasthourhour = '';     // 上一小时时间
        this.lasthourdate = '';     // 上一小时日期

        // 绑定操作
        this.loadData = this.loadData.bind(this);
    }

    // 加载最新数据网络请求
    loadData(resolve, date, hour) {
        // 初始化参数对象
        let params = {};

        if (date) {     // 时间有值时
            params = {
                "date" : date,
                "hour" : hour
            }
        }

        // 请求相应时间段数据
        HTTPBase.get('http://guangdiu.com/api/getranklist.php', params)
            .then((responseData) => {

                let isNextTouch = true;

                if (responseData.hasnexthour == 1) {    // hasnexthour不为0时 下一小时 按钮可点击
                    isNextTouch = false;
                }

                // 重新渲染
                this.setState({
                    dataSource: this.state.dataSource.cloneWithRows(responseData.data),
                    loaded:true,
                    prompt:responseData.displaydate + responseData.rankhour + '点档' + '(' + responseData.rankduring + ')',
                    isNextTouch:isNextTouch,    // 更新按钮状态
                });

                // 关闭刷新动画
                if (resolve !== undefined){
                    setTimeout(() => {
                        resolve();
                    }, 1000);
                }

                // 需要缓存的数据
                this.nexthourhour = responseData.nexthourhour;
                this.nexthourdate = responseData.nexthourdate;
                this.lasthourhour = responseData.lasthourhour;
                this.lasthourdate = responseData.lasthourdate;
            })
            .catch((error) => {     // 网络问题处理

            })
    }

    // 跳转到设置
    pushToSettings() {
        InteractionManager.runAfterInteractions(() => {
            this.props.navigator.push({
                component: Settings,
            });
        });
    }

    // 跳转到详情页
    pushToDetail(value) {
        InteractionManager.runAfterInteractions(() => {
            this.props.navigator.push({
                component: CommunalDetail,
                params: {
                    url: 'https://guangdiu.com/api/showdetail.php' + '?' + 'id=' + value
                }
            });
        });
    }

    // 上一小时点击事件
    lastHour() {
        this.loadData(undefined, this.lasthourdate, this.lasthourhour);
    }

    // 下一小时点击事件
    nextHour() {
        this.loadData(undefined, this.nexthourdate, this.nexthourhour);
    }

    // 返回中间标题
    renderTitleItem() {
        return(
            <Image source={{uri:'navtitle_rank_106x20'}} style={styles.navBarTitleItemStyle} />
        );
    }

    // 返回右边按钮
    renderRightItem() {
        return(
            <TouchableOpacity
                onPress={()=>{this.pushToSettings()}}
            >
                <Text style={styles.navBarRightItemStyle}>设置</Text>
            </TouchableOpacity>
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
                />
            );
        }
    }

    // 进入页面
    componentDidMount() {
        // 刷新数据
        this.loadData();
    }

    render() {
        return (
            <View style={styles.container}>
                {/* 导航栏样式 */}
                <CommunalNavBar
                    titleItem = {() => this.renderTitleItem()}
                    rightItem = {() => this.renderRightItem()}
                />

                {/* 提醒栏 */}
                <View style={styles.promptViewStyle}>
                    <Text>{this.state.prompt}</Text>
                </View>

                {/* 根据网络状态决定是否渲染 listview */}
                {this.renderListView()}

                {/* 操作栏 */}
                <View style={styles.operationViewStyle}>
                    {/* 上一小时按钮 */}
                    <TouchableOpacity
                        onPress={() => this.lastHour()}
                    >
                        <Text style={{marginRight:10, fontSize:17, color:'green'}}>{"< " + "上1小时"}</Text>
                    </TouchableOpacity>

                    {/* 下一小时按钮 */}
                    <TouchableOpacity
                        onPress={() => this.nextHour()}
                        disabled={this.state.isNextTouch}
                    >
                        <Text style={{marginLeft:10, fontSize:17, color:this.state.isNextTouch == false ? 'green' : 'gray'}}>{"下1小时" + " >"}</Text>
                    </TouchableOpacity>
                </View>
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

    navBarTitleItemStyle: {
        width:106,
        height:20,
        marginLeft:50
    },
    navBarRightItemStyle: {
        fontSize:17,
        color:'rgba(123,178,114,1.0)',
        marginRight:15,
    },

    promptViewStyle: {
        width:width,
        height:44,
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'rgba(251,251,251,1.0)',
    },

    operationViewStyle: {
        width:width,
        height:44,
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
    },
});
