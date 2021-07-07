/*
 * @Author: NeptLiang
 * @Date: 2021-03-05 13:46:26
 * @LastEditors: NeptLiang
 * @LastEditTime: 2021-04-07 14:34:17
 * @Description: 调用高德API进行地图选点
 */
//加载PositionPicker，loadUI的路径参数为模块名中 'ui/' 之后的部分
AMapUI.loadUI(['misc/PositionPicker'], function(PositionPicker) {
    var map = new AMap.Map('container', {
        center: [113.264499, 23.130058], //中心点坐标
        zoom: 8,
        scrollWheel: true
    })
    var positionPicker = new PositionPicker({
        mode: 'dragMap', //设定为拖拽地图模式，可选'dragMap'、'dragMarker'，默认为'dragMap'
        map: map //依赖地图对象
    });

    // 当拖拽结束后，拖拽选址组件会进行服务查询获得所选位置的地址、周边信息等数据，如果获取成功，
    // 将触发success事件，否则将触发fail事件。创建完拖拽选址组件的对象之后，
    // 我们需要为其绑定success和fail事件：
    positionPicker.on('success', function(positionResult) {
        // console.log(document.getElementById('lnglat'));
        document.getElementById('lnglat').value = positionResult.position;
        document.getElementById('position').value = positionResult.address;
        // document.getElementById('nearestJunction').innerHTML = positionResult.nearestJunction;
        // document.getElementById('nearestRoad').innerHTML = positionResult.nearestRoad;
        // document.getElementById('nearestPOI').innerHTML = positionResult.nearestPOI;
    });
    positionPicker.on('fail', function(positionResult) {
        // 海上或海外无法获得地址信息
        document.getElementById('lnglat').innerHTML = ' ';
        document.getElementById('position').innerHTML = ' ';
        // document.getElementById('nearestJunction').innerHTML = ' ';
        // document.getElementById('nearestRoad').innerHTML = ' ';
        // document.getElementById('nearestPOI').innerHTML = ' ';
    });
    // var onModeChange = function(e) {
    //     positionPicker.setMode(e.target.value)
    // }
    // var startButton = document.getElementById('start');
    // var stopButton = document.getElementById('stop');
    // var dragMapMode = document.getElementsByName('mode')[0];
    // var dragMarkerMode = document.getElementsByName('mode')[1];
    // startButton.addEventListener('click', function() {
    // positionPicker.start(map.getBounds().getSouthWest()) //通过start方法开始拖拽选点的操作
    // })
    // stopButton.addEventListener('click', function() {
    //     positionPicker.stop();
    // })
    // dragMapMode.addEventListener('change', onModeChange)
    // dragMarkerMode.addEventListener('change', onModeChange);
    positionPicker.start();
    map.panBy(0, 1);

    map.addControl(new AMap.ToolBar({
        liteStyle: true
    }))
});