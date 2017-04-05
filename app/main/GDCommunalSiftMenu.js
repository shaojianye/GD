/**
 * Created by yeshaojian on 2017/4/5.
 */
import React, { Component, PropTypes } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Image,
    ListView,
    TouchableOpacity,
    Dimensions,
    Platform,
} from 'react-native';

const {width, height} = Dimensions.get('window');

export default class GDCommunalSiftMenu extends Component {

    static defaultProps = {
        removeModal:{},
    };

    static propTypes = {
        data:PropTypes.array,
    };

    // 构造
      constructor(props) {
        super(props);
        // 初始状态
        this.state = {
            dataSource: new ListView.DataSource({rowHasChanged:(r1, r2) => r1 !== r2})
        };
      }

    // 退出
    popToHome(data) {
        this.props.removeModal(data);
    }

    // 处理数据
    loadData() {
        let data = [];

        for (let i = 0; i<this.props.data.length; i++) {
            data.push(this.props.data[i]);
        }

        // 重新渲染
        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(data),
        })
    }

    renderRow(rowData) {
        return(
            <View style={styles.itemViewStyle}>
                <Image source={{uri:rowData.image}} style={styles.itemImageStyle} />
                <Text>{rowData.title}</Text>
            </View>
        )
    }

    componentDidMount() {
        this.loadData();
    }

    render() {
        return(
                <View style={styles.container}>
                    {/* 菜单内容 */}
                    <ListView
                        dataSource={this.state.dataSource}
                        renderRow={this.renderRow}
                        contentContainerStyle={styles.contentViewStyle}
                        initialListSize={16}
                    />
                </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex:1,
    },

    contentViewStyle: {
        flexDirection:'row',
        flexWrap:'wrap',
        width: width,
        top:Platform.OS === 'ios' ? 64 : 44
    },

    itemViewStyle: {
        width:width * 0.25,
        height:70,
        backgroundColor:'green',
        justifyContent:'center',
        alignItems:'center'
    },

    itemImageStyle: {
        width:40,
        height:40
    }
});