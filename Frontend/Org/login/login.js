/*
 * @Author: NeptLiang
 * @Date: 2021-03-05 13:46:26
 * @LastEditors: NeptLiang
 * @LastEditTime: 2021-04-08 17:13:12
 * @Description: 登录
 */
onload = () => {
    var loginBtn = document.getElementById("login");
    loginBtn.addEventListener("click", function() {
        var id = document.getElementById("id").value;
        var pwd = CryptoJS.SHA512(document.getElementById("pwd").value).toString();
        if (!id || !document.getElementById("pwd").value) {
            alert('请填写机构ID及密码');
            return;
        }
        // console.log(pwd);
        var url = "http://122.51.3.35/org.php?" + "id=" + id + "&pwd=" + pwd;
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
                                console.log("OK");
                                location = `../../Route/show/show.html?id=${id}`;
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
            xhr.send(null);
        }
    })
}