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
    DeviceEventEmitter,
    InteractionManager,
    Animated,
} from 'react-native';


// 获取屏幕尺寸
const {width, height} = Dimensions.get('window');

// 数据
import HTSiftData from '../data/HTSiftData.json';

// 第三方
import {PullList} from 'react-native-pull';

// 引用外部文件
import CommunalNavBar from '../main/GDCommunalNavBar';
import CommunalCell from '../main/GDCommunalCell';
import CommunalDetail from '../main/GDCommunalDetail';
import CommunalSiftMenu from '../main/GDCommunalSiftMenu';
import USHalfHourHot from './GDUSHalfHourHot';
import Search from '../main/GDSearch';
import NoDataView from '../main/GDNoDataView';


export default class GDHome extends Component {

    static defaultProps = {
        loadDataNumber:{}   // 回调
    };

    // 构造
    constructor(props) {
        super(props);
        // 初始状态
        this.state = {
            dataSource: new ListView.DataSource({rowHasChanged:(r1, r2) => r1 !== r2}),
            loaded:false,                   // 是否显示 ListView
            isUSHalfHourHotModal:false,     // 半小时热门状态
            isSiftModal:false,              // 筛选菜单状态
        };

        this.data = [];

        // 绑定操作
        this.loadData = this.loadData.bind(this);
        this.loadMore = this.loadMore.bind(this);
    }

    // 加载最新数据网络请求
    loadData(resolve) {

        let params = {
            "count" : 10,
            "country" : "us"
        };

        HTTPBase.get('https://guangdiu.com/api/getlist.php', params)
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

                // 获取最新数据个数
                this.loadDataNumber();

                // 存储数组中最后一个元素的id
                let uslastID = responseData.data[responseData.data.length - 1].id;
                AsyncStorage.setItem('uslastID', uslastID.toString());

                // 存储数组中第一个元素的id
                let usfirstID = responseData.data[0].id;
                AsyncStorage.setItem('usfirstID', usfirstID.toString());

                // 清楚本地存储的数据
                RealmBase.removeAllData('HomeData');

                // 存储数据到本地
                RealmBase.create('HomeData', responseData.data);
            })
            .catch((error) => {
                // 拿到本地存储的数据,展示出来,如果没有存储,那就显示无数据页面
                this.data = RealmBase.loadAll('HomeData');

                // 重新渲染
                this.setState({
                    dataSource: this.state.dataSource.cloneWithRows(this.data),
                    loaded:true,
                });
            })
    }

    // 加载更多数据的网络请求
    loadMoreData(value) {

        let params = {
            "count" : 10,
            "sinceid" : value,
            "country" : "us"
        };

        HTTPBase.get('https://guangdiu.com/api/getlist.php', params)
            .then((responseData) => {

                // 拼接数据
                this.data = this.data.concat(responseData.data);

                this.setState({
                    dataSource: this.state.dataSource.cloneWithRows(this.data),
                    loaded:true,
                });

                // 存储数组中最后一个元素的id
                let uslastID = responseData.data[responseData.data.length - 1].id;
                AsyncStorage.setItem('uslastID', uslastID.toString());

            })
            .catch((error) => {

            })
    }

    // 筛选数据网络请求
    loadSiftData(mall, cate) {

        let params = {};

        if (mall === "" && cate === "") {   // 全部
            this.loadData(undefined);
            return;
        }

        if (mall === "") {  // cate 有值
            params = {
                "cate" : cate,
                "country" : "us"
            };
        }else {
            params = {
                "mall" : mall,
                "country" : "us"
            };
        }


        HTTPBase.get('https://guangdiu.com/api/getlist.php', params)
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

                // 存储数组中最后一个元素的id
                let cnlastID = responseData.data[responseData.data.length - 1].id;
                AsyncStorage.setItem('cnlastID', cnlastID.toString());

            })
            .catch((error) => {

            })
    }

    // 获取最新数据个数
    loadDataNumber() {
        this.props.loadDataNumber();
    }

    // 加载更多数据操作
    loadMore() {
        // 读取id
        AsyncStorage.getItem('uslastID')
            .then((value) => {
                // 数据加载操作
                this.loadMoreData(value);
            });
    }

    // 模态到近半小时热门
    pushToHalfHourHot() {
        this.setState({
            isUSHalfHourHotModal:true
        });
    }

    // 显示筛选菜单
    showSiftMenu() {
        this.setState({
            isSiftModal:true,
        });
    }

    // 跳转到搜索
    pushToSearch() {
        this.props.navigator.push({
            component:Search,
        });
    }

    // 跳转到详情页
    pushToDetail(value) {
        InteractionManager.runAfterInteractions(() => {
            this.props.navigator.push({
                component: CommunalDetail,
                // 根据url进行跳转
                params: {
                    url: 'https://guangdiu.com/api/showdetail.php' + '?' + 'id=' + value
                }
            });
        });
    }

    // 点击了Item
    clickTabBarItem() {

        let PullList = this.refs.pullList;

        if (PullList.scroll.scrollProperties.offset > 0) {      // 不在顶部
            // 一键置顶
            PullList.scrollTo({y:0});
        }else {     // 在顶部

            // 执行下拉刷新动画
            PullList.state.pullPan = new Animated.ValueXY({x: 0, y: this.topIndicatorHeight * -1});

            // 加载最新数据
            this.loadData();

            // 关闭动画
            setTimeout(() => {
                PullList.resetDefaultXYHandler();
            },1000);
        }
    }

    // 安卓模态销毁处理
    onRequestClose() {
        this.setState({
            isUSHalfHourHotModal:false,
            isSiftModal:false,
        });
    }

    // 关闭模态
    closeModal(data) {
        this.setState({
            isUSHalfHourHotModal:data,
            isSiftModal:data
        });
    }

    // 返回左边按钮
    renderLeftItem() {
        return(
            <TouchableOpacity
                onPress={() => {this.pushToHalfHourHot()}} >
                <Image source={{uri:'hot_icon_20x20'}} style={styles.navbarLeftItemStyle} />
            </TouchableOpacity>
        );
    }

    // 返回中间按钮
    renderTitleItem() {
        return(
            <TouchableOpacity
                onPress={() => this.showSiftMenu()} >
                <Image source={{uri:'navtitle_home_down_66x20'}} style={styles.navbarTitleItemStyle} />
            </TouchableOpacity>
        );
    }

    // 返回右边按钮
    renderRightItem() {
        return(
            <TouchableOpacity
                onPress={()=>{this.pushToSearch()}} >
                <Image source={{uri:'search_icon_20x20'}} style={styles.navbarRightItemStyle} />
            </TouchableOpacity>
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
        if (this.state.loaded === false) {  // 无数据
            return(
                <NoDataView />
            );
        }else {     // 有数据
            return(
                <PullList ref="pullList"
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

    // 组件加载完成
    componentDidMount() {
        // 加载最新数据
        this.loadData();

        // 注册通知
        this.subscription = DeviceEventEmitter.addListener('clickHTItem', () => this.clickTabBarItem());
    }

    componentWillUnmount() {
        // 注销通知
        this.subscription.remove();
    }

    render() {
        return (
            <View style={styles.container}>
                {/* 导航栏样式 */}
                <CommunalNavBar
                    leftItem = {() => this.renderLeftItem()}
                    titleItem = {() => this.renderTitleItem()}
                    rightItem = {() => this.renderRightItem()}
                />

                {/* 根据网络状态决定是否渲染 listview */}
                {this.renderListView()}

                {/* 初始化近半小时热门 */}
                <Modal
                    animationType='slide'
                    transparent={false}
                    visible={this.state.isUSHalfHourHotModal}
                    onRequestClose={() => this.onRequestClose()}
                >
                    <Navigator
                        initialRoute={{
                            name:'usHalfHourHot',
                            component:USHalfHourHot
                        }}

                        renderScene={(route, navigator) => {
                            let Component = route.component;
                            return <Component
                                removeModal={(data) => this.closeModal(data)}
                                {...route.params}
                                navigator={navigator} />
                        }} />
                </Modal>

                {/* 初始化筛选菜单 */}
                <Modal
                    animationType='none'
                    transparent={true}
                    visible={this.state.isSiftModal}
                    onRequestClose={() => this.onRequestClose()}
                >
                    <CommunalSiftMenu
                        removeModal={(data) => this.closeModal(data)}
                        data={HTSiftData}
                        loadSiftData={(mall, cate) => this.loadSiftData(mall, cate)} />
                </Modal>
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

    listViewStyle: {
        width:width,
    },
});
