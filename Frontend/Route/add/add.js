/*
 * @Author: NeptLiang
 * @Date: 2021-03-05 13:46:26
 * @LastEditors: NeptLiang
 * @LastEditTime: 2021-04-25 15:36:49
 * @Description: 添加路线
 */
import { serviceBaseUrl } from '../../Conf/conf.js';

onload = () => {
    var addBtn = document.getElementById("add");
    addBtn.addEventListener("click", function() {
        var id = document.getElementById("id").value;
        var name = document.getElementById("name").value;
        var org = document.getElementById("org").value;
        var intro = document.getElementById("intro").value;
        intro = (intro.length > 0) ? intro : "暂无说明";
        var content = "id=" + id + "&name=" + name + "&org=" + org + "&intro=" + intro;
        var url = `${serviceBaseUrl}/route.php`;
        if (typeof "XMLHttpRequest" !== "undefined") {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = () => {
                if (xhr.readyState == 4) {
                    if (xhr.status == "200") {
                        handleResponse(xhr.responseText);
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

function handleResponse(responseText) {
    // var x = eval(xhr.responseText);
    try {
        console.log(responseText)
        var response = JSON.parse(responseText);
    } catch (e) {
        alert("没有响应");
    }
    if (typeof(response) === "undefined") {
        alert("添加失败，响应格式错误");
    }
    if (response.status === 200) {
        alert('添加成功');
    } else {
        alert(`添加失败：${response.message}`);
    }
}