/*
 * @Author: NeptLiang
 * @Date: 2021-04-01 09:30:59
 * @LastEditors: NeptLiang
 * @LastEditTime: 2021-04-02 17:37:19
 * @Description: 修改信息/密码
 */
//TODO: 注销待完成
onload = () => {
    let changePwdCheckBox = document.getElementById('changePwd');
    let pwdBox = document.getElementById('pwdBox');
    changePwdCheckBox.addEventListener('click', (e) => {
        pwdBox.style.display = e.target.checked ? 'block' : 'none';
    })
    var modifyBtn = document.getElementById("modify");
    modifyBtn.addEventListener("click", function() {
        var name = document.getElementById("name").value; //用户名
        if (!name) {
            alert('用户名不能为空');
            return;
        }
        if (changePwdCheckBox.checked) {
            if (!document.getElementById("oldPwd").value ||
                !document.getElementById("newPwd").value ||
                !document.getElementById("confirmPwd").value) {
                alert('请填写新旧密码');
                return;
            }
            var oldPwd = CryptoJS.SHA512(document.getElementById("oldPwd").value).toString();
            var newPwd = CryptoJS.SHA512(document.getElementById("newPwd").value).toString();
            var confirmPwd = CryptoJS.SHA512(document.getElementById("confirmPwd").value).toString();
            if (newPwd !== confirmPwd) {
                alert("两次密码不一致");
                document.getElementById("newPwd").value = "";
                document.getElementById("confirmPwd").value = "";
                return;
            }
            var url = "http://122.51.3.35/user.php"
            content = `name=${name}&oldPwd=${oldPwd}&newPwd=${newPwd}`;
            if (typeof "XMLHttpRequest" !== "undefined") {
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = () => {
                    if (xhr.readyState == 4) {
                        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
                            handleResponse(xhr) //TODO: 注销待完成
                        } else {
                            alert("请求失败，请稍后再试");
                        }
                    }
                }
                xhr.open("PUT", url, true);
                xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                xhr.send(content);
            }
        } else {
            fetch('http://122.51.3.35/user.php', {
                method: 'PUT',
                body: `name=${name}`
            }).then(response =>
                response.json()
            ).then(response => {
                if (response.status === 200) {
                    alert("修改成功")
                } else {
                    alert(`修改失败：${response.message}`);
                }
            }).catch((e) => {
                alert(`请求失败：${e.message}`);
            })
        }
    })
}

/**
 * 处理响应
 * @param {object} xhr XMLHttpRequest响应对象
 */
function handleResponse(xhr) {
    try {
        console.log(xhr.responseText)
        var response = JSON.parse(xhr.responseText);
    } catch (e) {
        alert("响应格式错误，请稍后再试");
    }
    if (typeof(response) !== "undefined") {
        if (response.status === 200) {
            alert("修改成功，请重新登录")
            location = "../login/login.html" //TODO: 注销待完成
        } else {
            alert(`修改失败：${response.message}`);
        }
    }
}