/*
 * @Author: NeptLiang
 * @Date: 2021-03-05 13:46:26
 * @LastEditors: NeptLiang
 * @LastEditTime: 2021-05-03 01:49:45
 * @Description: 用户登录
 */
import { serviceBaseUrl } from '../../Conf/conf.js'

onload = () => {
    var addBtn = document.getElementById("add");
    addBtn.addEventListener("click", function() {
        var id = document.getElementById("id").value;
        var pwd = CryptoJS.SHA512(document.getElementById("pwd").value).toString();
        if (!id || !document.getElementById("pwd").value) {
            alert('请填写ID、密码');
            return;
        }
        var url = `${serviceBaseUrl}/user.php?id=${id}&pwd=${pwd}`;
        if (typeof "XMLHttpRequest" !== "undefined") {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = () => {
                if (xhr.readyState == 4) {
                    if (xhr.status == "200") {
                        try {
                            console.log(xhr.responseText)
                            var response = JSON.parse(xhr.responseText);
                        } catch (e) {
                            alert("没有响应");
                        }
                        if (typeof(response) !== "undefined") {
                            if (response.status === 200) {
                                localStorage.setItem('user', id);
                                location = `../../Map/map.html?id=${id}`
                            } else {
                                alert(response.message);
                            }
                        }
                    } else {
                        alert("请求失败");
                    }
                }
            }
            xhr.open("GET", url, true);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            // xhr.withCredentials = true;
            xhr.send(null);
        }
    })
}