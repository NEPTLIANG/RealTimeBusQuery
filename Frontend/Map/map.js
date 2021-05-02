import { serviceBaseUrl } from '../Conf/conf.js'

var map = {};
var userId = location.search.split("=")[1];
var routeId = "";
var points = [];
var cars = {};

onload = () => {
    mapInit();
    getRoute();
    getIdentifications();
    getCars();
    globalThis.interval = setInterval(getCars, 3000);
}

/**
 * 初始化地图
 */
function mapInit() {
    map = new AMap.Map('container', {
        zoom: 13, //缩放级别
        center: [111.791588, 22.17042], //中心点坐标
        viewMode: '3D', //使用3D视图
        mapStyle: 'amap://styles/whitesmoke', //设置地图的显示样式
    });
    AMap.plugin('AMap.ToolBar', function() { //异步加载插件
        var toolbar = new AMap.ToolBar();
        map.addControl(toolbar);
    });
    // map.setFeatures(['bg','road','point','building']); // 多个种类要素显示
    map.setFeatures(['bg', 'road']);

    // 创建一条折线覆盖物
    /* var path = [
        new AMap.LngLat("116.368904","39.913423"),
        new AMap.LngLat("116.382122","39.901176"),
        new AMap.LngLat("116.387271","39.912501"),
        new AMap.LngLat("116.398258","39.904600")
    ];
    var polyline = new AMap.Polyline({
        path: path,  
        borderWeight: 2, // 线条宽度，默认为 1
        strokeColor: 'red', // 线条颜色
        lineJoin: 'round' // 折线拐点连接处样式
    });
    map.add(polyline); */
}

/**
 * 获取路线
 */
function getRoute() {
    var url = `${serviceBaseUrl}/user.php?id=${userId}`; //获取路线
    if (typeof XMLHttpRequest != "undefined") {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
                    // console.log(xhr.responseText)
                    var response = JSON.parse(xhr.responseText);
                    if (response.status === 200 && response.routes.length >= 1) {
                        routeId = response.routes;
                    } else if (response.status === 200 && response.routes.length === 0) {
                        alert("没有查询到路线");
                    } else {
                        // if (response.status === 403) {
                        //     history.back();
                        // }
                        alert("发生错误：" + response.message);
                        throw new SyntaxError("发生错误：" + response.message);
                    }
                } else {
                    alert("请求失败：" + xhr.status);
                }
            }
        };
        xhr.open("GET", url, false);
        xhr.send(null);
    }
}

/**
 * 获取标识点
 */
function getIdentifications() {
    var url = `${serviceBaseUrl}/identification.php?route=${routeId}`; //获取标识点
    if (typeof XMLHttpRequest != "undefined") {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
                    var response = JSON.parse(xhr.responseText);
                    if (response.status === 200 && response.identifications.length >= 1) {
                        handleIdentifications(response);
                    } else if (response.status === 200 && response.devices.length === 0) {
                        alert("未添加标识点");
                    } else {
                        alert("发生错误：" + response.message);
                    }
                    // car1.setPosition(new AMap.LngLat(response.lng, response.lat));
                } else {
                    alert("请求失败：" + xhr.status);
                }
            }
        };
        xhr.open("GET", url, true);
        xhr.send(null);
    }
    map.setFitView(points);
}

/**
 * 处理返回的标识点
 * @param {object} response 
 * @returns 
 */
function handleIdentifications(response) {
    for (var index = 0; index < response.identifications.length; index++) {
        var identification = response.identifications[index];
        if (points[identification.id] === undefined) {
            var content = `
                <div class="point">
                    <div class="info">
                        ${identification.name}
                    </div>
                    <img src="../Map/img/3.png" style="width: 8px; height: 8px;margin-left: 8px;"/>
                    <div style="width:16px; height:16px; border-radius:16px; background-color: #77f; box-shadow: 0 0 8px rgba(127,127,255,0.5);"></div>
                </div>
            `;
            if (!identification.lng || !identification.lat) {
                alert(`发生错误：标识点${identification.name}位置未定义`)
                return 1;
            }
            var pointOfidentification = new AMap.Marker({
                content: content, // 自定义点标记覆盖物内容
                position: new AMap.LngLat(identification.lng, identification.lat),
                title: identification.name,
                offset: new AMap.Pixel(0, -100) // 相对于基点的偏移位置
            });
            points.push(pointOfidentification);
            // point[identification.id] = pointOfidentification;
            map.add(pointOfidentification);
        } else {
            points[identification.id].setPosition(new AMap.LngLat(identification.lng, identification.lat));
        }
        // map.setFitView(point);
    }
}

/**
 * 获取车辆
 */
function getCars() {
    var url = `${serviceBaseUrl}/device.php?route=${routeId}`;
    if (typeof XMLHttpRequest != "undefined") {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
                    var response = JSON.parse(xhr.responseText);
                    if (response.status === 200 && response.devices.length >= 1) {
                        handleCards(response);
                    } else if (response.status === 200 && response.devices.length === 0) {
                        alert("未添加设备");
                    } else {
                        alert("发生错误：" + response.message);
                        clearInterval(globalThis.interval)
                    }
                    // car1.setPosition(new AMap.LngLat(response.lng, response.lat));
                } else {
                    alert("请求失败：" + xhr.status);
                }
            }
        };
        xhr.open("GET", url, true);
        xhr.send(null);
    }
}

/**
 * 处理后端返回的定位信息
 * @param {object} response 
 */
function handleCards(response) {
    for (var index = 0; index < response.devices.length; index++) {
        var device = JSON.parse(response.devices[index]);
        // if (!device.status) {
        //     map.setFitView(points);
        //     return;
        // }
        if (cars[device.id] === undefined) {
            var content = `
                <div class="point">
                    <div class="info">
                        ${device.name}
                    </div>
                    <img src="../Map/img/3.png" style="width: 8px; height: 8px;margin-left: 8px;"/>
                    <div style="width:16px; height:16px; border-radius:16px; background-color: #77f; box-shadow: 0 0 8px rgba(127,127,255,0.5);"></div>
                </div>
            `;
            var car = new AMap.Marker({
                content: content, // 自定义点标记覆盖物内容
                position: new AMap.LngLat(device.lng, device.lat),
                title: device.name,
                offset: new AMap.Pixel(-17, -42) // 相对于基点的偏移位置
            });
            if (device.status) {
                cars[device.id] = car;
                map.add(car);
                points.push(car);
            }
        } else {
            if (device.status) {
                cars[device.id].setPosition(new AMap.LngLat(device.lng, device.lat));
            } else {
                map.remove(cars[device.id]);
                delete cars[device.id];
                let pointIndex = points.findIndex(p => p.Ce.title === device.name);
                points.splice(pointIndex, 1);
            }
            // let position = new AMap.LngLat(device.lng, device.lat);
            // cars[device.id].setPosition(position);
        }
        map.setFitView(points);
    }
}

// 自动适配到合适视野范围
// 无参数，默认包括所有覆盖物的情况
// map.setFitView();
// 传入覆盖物数组，仅包括polyline和marker1的情况
// map.setFitView(point);

function test() {
    // 创建两个点标记
    var marker1 = new AMap.Marker({
        position: new AMap.LngLat(110.352556, 21.274520), // 经纬度对象，如 new AMap.LngLat(116.39, 39.9); 也可以是经纬度构成的一维数组[116.39, 39.9]
        title: '北2门'
    });
    var marker2 = new AMap.Marker({
        position: new AMap.LngLat(110.344556, 21.264520), // 经纬度对象，如 new AMap.LngLat(116.39, 39.9); 也可以是经纬度构成的一维数组[116.39, 39.9]
        title: '南门'
    });
    var marker3 = new AMap.Marker({
        position: new AMap.LngLat(110.347556, 21.269520), // 经纬度对象，如 new AMap.LngLat(116.39, 39.9); 也可以是经纬度构成的一维数组[116.39, 39.9]
        title: '综合实验楼A'
    });
    // map.add(marker3);
    var car1 = new AMap.Marker({
        position: new AMap.LngLat(110.345556, 21.265520), // 经纬度对象，如 new AMap.LngLat(116.39, 39.9); 也可以是经纬度构成的一维数组[116.39, 39.9]
        title: '校车1'
    });
    // map.add(car1);
    map.add(marker1);
    map.add(marker2);
    car1.setPosition(new AMap.LngLat(110.351556, 21.273520));

    //自定义点标记
    // var content = '<div>'
    //     + '<div style="border-radius: 8px 8px 8px 0px;background-color: rgba(255,255,255,0.5); padding: 8px 16px;margin: 0 0 -1px 8px;width:max-content;color: #77f">'
    //             + device.name + '</div>'
    //     + '<img src="../Map/img/3.png" style="width: 16px; height: 16px;margin-left: 8px;"/>'
    //     + '<div style="width:16px; height:16px; border-radius:16px; background-color: #77f; box-shadow: 0 0 8px rgba(127,127,255,0.5);"></div>'
    //     + '</div>';
    // var marker = new AMap.Marker({
    //     content: content,  // 自定义点标记覆盖物内容
    //     position:  [116.397428, 39.90923], // 基点位置
    //     offset: new AMap.Pixel(-17, -42) // 相对于基点的偏移位置
    // });
    // map.add(marker);
}