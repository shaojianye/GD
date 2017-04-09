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


// 获取屏幕尺寸
const {width, height} = Dimensions.get('window');


export default class GDCommunalCell extends Component {

    static propTypes = {
        image:PropTypes.string,
        title:PropTypes.string,
        mall:PropTypes.string,
        pubTime:PropTypes.string,
        fromSite:PropTypes.string,
    };

    // 返回时间计算结果
    renderDate(pubTime, fromSite) {

        // 时间差的计算
        let minute = 1000 * 60;     // 1分钟
        let hour = minute * 60;     // 1小时
        let day = hour * 24;        // 1天
        let week = day * 7;         // 1周
        let month = day * 30;       // 1个月

        // 计算时间差
        let now = new Date().getTime();     // 获取当前时间
        let diffValue = now - Date.parse(pubTime.replace(/-/gi, "/"));

        if (diffValue < 0) return;

        let monthC = diffValue/month;   // 相差了几个月
        let weekC = diffValue/week;     // 相差几周
        let dayC = diffValue/day;       // 相差几天
        let hourC = diffValue/hour;     // 相差几小时
        let minuteC = diffValue/minute; // 相差几分钟

        let result;

        if (monthC >= 1) {
            result = parseInt(monthC) + "月前";
        }else if (weekC >= 1) {
            result = parseInt(weekC) + "周前";
        }else if (dayC >= 1) {
            result = parseInt(dayC) + "天前";
        }else if (hourC >= 1) {
            result = parseInt(hourC) + "小时前";
        }else if (minuteC >= 1) {
            result = parseInt(minuteC) + "分钟前";
        }else result = "刚刚";

        return result + ' · ' + fromSite;       // 拼接

    }

    render() {
        return (
            <View style={styles.container}>
                {/* 左边图片 */}
                <Image source={{uri:this.props.image === '' ? 'defaullt_thumb_83x83' : this.props.image}} style={styles.imageStyle} />

                {/* 中间 */}
                <View style={styles.centerViewStyle}>
                    {/* 标题 */}
                    <View>
                        <Text numberOfLines={3} style={styles.titleStyle}>{this.props.title}</Text>
                    </View>

                    {/* 详情 */}
                    <View style={styles.detailViewStyle}>
                        {/* 平台 */}
                        <Text style={styles.detailMallStyle}>{this.props.mall}</Text>
                        {/* 时间 + 来源 */}
                        <Text style={styles.timeStyle}>{this.renderDate(this.props.pubTime, this.props.fromSite)}</Text>
                    </View>

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

    centerViewStyle: {
        height:90,
        justifyContent:'space-around',
    },

    titleStyle: {
        width:width * 0.60,
    },

    detailViewStyle: {
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center'
    },
    detailMallStyle: {
        fontSize:11,
        color:'green',
    },
    timeStyle: {
        fontSize:11,
        color:'gray',
    },

    arrowStyle: {
        width:10,
        height:10,
        marginRight:30,
    }
});
