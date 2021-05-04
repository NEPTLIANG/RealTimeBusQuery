/*
 * @Author: NeptLiang
 * @Date: 2020-08-28 14:13:47
 * @LastEditors: NeptLiang
 * @LastEditTime: 2021-05-04 18:01:44
 * @Description: 修改路线信息
 */
import { serviceBaseUrl } from '../../Conf/conf.js'

onload = () => {
    let { oldId } = getInfo();
    var addBtn = document.getElementById("modify");
    addBtn.addEventListener("click", function() {
        var newId = document.getElementById("id").value;
        var name = document.getElementById("name").value;
        var org = document.getElementById("org").value;
        var intro = document.getElementById("intro").value;
        intro = (intro.length > 0) ? intro : "暂无说明";
        var content = `oldId=${oldId}&newId=${newId}&name=${name}&org=${org}&intro=${intro}`;
        var url = `${serviceBaseUrl}/route.php`;
        if (typeof "XMLHttpRequest" !== "undefined") {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = () => {
                if (xhr.readyState == 4) {
                    if (xhr.status == "200") {
                        try {
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
 * 获取URL传进来的路线旧信息
 * @returns 路线旧信息
 */
function getInfo() {
    console.log(document.location.search.substr(1).split("&"));
    var param = document.location.search.substr(1).split("&");
    let oldId = param[0].substr(param[0].indexOf("=") + 1);
    document.getElementById("id").value = oldId;
    document.getElementById("name").value = decodeURIComponent(param[1].substr(param[1].indexOf("=") + 1));
    document.getElementById("org").value = param[2].substr(param[2].indexOf("=") + 1);
    document.getElementById("intro").value = decodeURIComponent(param[3].substr(param[3].indexOf("=") + 1));
    return {
        oldId: oldId
    };
}