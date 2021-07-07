/*
 * @Author: NeptLiang
 * @Date: 2020-08-28 14:13:47
 * @LastEditors: NeptLiang
 * @LastEditTime: 2021-05-13 23:59:08
 * @Description: 修改设备
 */
import { serviceBaseUrl } from '../../Conf/conf.js'

onload = () => {
    let { oldId } = getInfo();
    var addBtn = document.getElementById("modify");
    addBtn.addEventListener("click", function() {
        var newId = document.getElementById("id").value;
        var name = document.getElementById("name").value;
        var route = document.getElementById("route").value;
        var intro = document.getElementById("intro").value;
        intro = (intro.length > 0) ? intro : "暂无说明";
        var content = `oldId=${oldId}&newId=${newId}&name=${name}&route=${route}&intro=${intro}`;
        var url = `${serviceBaseUrl}/device.php`;
        if (typeof "XMLHttpRequest" !== "undefined") {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = () => {
                if (xhr.readyState == 4) {
                    if (xhr.status == "200") {
                        // var x = eval(xhr.responseText);
                        try {
                            console.log(xhr.responseText);
                            var response = JSON.parse(xhr.responseText);
                        } catch (e) {
                            alert("没有响应");
                        }
                        if (typeof(response) !== "undefined") {
                            if (response.status === 200) {
                                alert("设备信息修改成功");
                            } else {
                                alert(response.message);
                            }
                        }
                    } else {
                        alert("请求失败");
                    }
                }
            }
            xhr.open("PUT", url, true);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.send(content);
        }
    })
}

/**
 * 获取旧设备信息
 * @returns 旧设备信息
 */
function getInfo() {
    var param = document.location.search.substr(1).split("&");
    // console.log(decodeURIComponent(param[0].substr(param[0].indexOf("=") + 1)))
    let oldId = param[0].substr(param[0].indexOf("=") + 1);
    document.getElementById("id").value = oldId;
    document.getElementById("name").value = decodeURIComponent(param[1].substr(param[1].indexOf("=") + 1));
    document.getElementById("route").value = param[2].substr(param[2].indexOf("=") + 1);
    document.getElementById("intro").value = decodeURIComponent(param[3].substr(param[3].indexOf("=") + 1));
    return {
        oldId: oldId
    };
}