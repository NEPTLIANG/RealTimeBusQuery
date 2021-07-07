/*
 * @Author: NeptLiang
 * @Date: 2021-03-05 13:46:26
 * @LastEditors: NeptLiang
 * @LastEditTime: 2021-05-04 14:41:51
 * @Description: 机构注册
 */
import { serviceBaseUrl } from '../../Conf/conf.js'

/**
 * 基本判空
 * @returns content || false
 */
function checkout() {
    var name = document.getElementById("name").value;
    var id = document.getElementById("id").value;
    var pwd = CryptoJS.SHA512(document.getElementById("pwd").value).toString();
    var pwd2 = CryptoJS.SHA512(document.getElementById("pwd2").value).toString();
    if (!name || !id || !document.getElementById("pwd").value) {
        alert('请完整填写信息');
        return false;
    }
    if (pwd !== pwd2) {
        alert("两次密码不一致");
        document.getElementById("pwd").value = "";
        document.getElementById("pwd2").value = "";
        return false;
    }
    return `name=${name}&id=${id}&pwd=${pwd}`;
}

onload = () => {
    var registBtn = document.getElementById("regist");
    registBtn.addEventListener("click", function() {
        var url = `${serviceBaseUrl}/org.php`
        let content = checkout();
        if (!content) {
            return;
        }
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
                                alert("注册成功")
                                location = "../login/login.html"
                            } else {
                                alert(response.message);
                            }
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