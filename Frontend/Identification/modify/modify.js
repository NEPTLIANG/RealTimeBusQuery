/*
 * @Author: NeptLiang
 * @Date: 2021-03-05 13:46:26
 * @LastEditors: NeptLiang
 * @LastEditTime: 2021-05-13 22:16:02
 * @Description: 修改标识点
 */
import { serviceBaseUrl } from '../../Conf/conf.js'

onload = () => {
    let { oldId } = getInfo();
    var modifyBtn = document.getElementById("modify");
    modifyBtn.addEventListener("click", function() {
        var newId = document.getElementById("id").value;
        var name = document.getElementById("name").value;
        var route = document.getElementById("route").value;
        var intro = document.getElementById("intro").value;
        var lng = document.getElementById("lnglat").value.split(",")[0];
        var lat = document.getElementById("lnglat").value.split(",")[1];
        intro = (intro.length > 0) ? intro : "暂无说明";
        var content = `oldId=${oldId}&newId=${newId}&name=${name}&route=${route}` +
            `&intro=${intro}&lng=${lng}&lat=${lat}`;
        var url = `${serviceBaseUrl}/identification.php`;
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
                                alert("标识点信息修改成功");
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
 * 获取旧站点信息
 * @returns 旧站点信息
 */
function getInfo() {
    // console.log(document.location.search.substr(1).split("&"));
    var param = document.location.search.substr(1).split("&");
    let oldId = param[0].substr(param[0].indexOf("=") + 1)
    document.getElementById("id").value = oldId;
    document.getElementById("name").value = decodeURIComponent(param[1].substr(param[1].indexOf("=") + 1));
    document.getElementById("route").value = param[2].substr(param[2].indexOf("=") + 1);
    document.getElementById("intro").value = decodeURIComponent(param[5].substr(param[5].indexOf("=") + 1));
    document.getElementById('lnglat').value = decodeURIComponent(param[3].substr(param[3].indexOf('=') + 1)) +
        ", " +
        decodeURIComponent(param[4].substr(param[4].indexOf('=') + 1));
    return {
        oldId: oldId
    };
}