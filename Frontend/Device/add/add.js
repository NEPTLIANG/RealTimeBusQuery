/*
 * @Author: NeptLiang
 * @Date: 2020-08-28 14:13:47
 * @LastEditors: NeptLiang
 * @LastEditTime: 2021-05-04 12:56:14
 * @Description: 添加设备
 */
import { serviceBaseUrl } from '../../Conf/conf.js'

onload = () => {
    var addBtn = document.getElementById("add");
    addBtn.addEventListener("click", function() {
        var id = document.getElementById("id").value;
        var name = document.getElementById("name").value;
        var route = document.getElementById("route").value;
        var intro = document.getElementById("intro").value;
        intro = (intro.length > 0) ? intro : "暂无说明";
        var content = "id=" + id + "&name=" + name + "&route=" + route + "&intro=" + intro;
        var url = `${serviceBaseUrl}/device.php`;
        if (typeof "XMLHttpRequest" !== "undefined") {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = () => {
                if (xhr.readyState == 4) {
                    if (xhr.status == "200") {
                        // var x = eval(xhr.responseText);
                        try {
                            var response = JSON.parse(xhr.responseText);
                        } catch (e) {
                            alert("没有响应");
                        }
                        if (typeof(response) !== "undefined") {
                            alert("设备添加成功");
                        }
                    } else {
                        alert("请求失败");
                    }
                }
            }
            xhr.open("POST", url, true);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.send(content);
        }
    })
}