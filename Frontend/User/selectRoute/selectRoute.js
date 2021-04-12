import { serviceBaseUrl } from '../../Conf/conf.js'

onload = () => {
    let logoutBtn = document.getElementById('logout')
    logoutBtn.addEventListener('click', logout)
    var refresh = document.getElementById("refresh")
    refresh.addEventListener("click", loadData)
    loadData()
}

/**
 * 加载路线信息
 */
function loadData() {
    var response
    var request = new XMLHttpRequest()
    var method = "GET"
    var url = `http://122.51.3.35/route.php`
    request.onreadystatechange = () => {
        if (request.readyState == 4) {
            if ((request.status >= 200 && request.status < 300) || request.status == 304) {
                try {
                    console.log(request.responseText)
                    response = JSON.parse(request.responseText)
                } catch (e) {}
                if (response) {
                    if (response.status == 200) {
                        if (!response.routes.length) {
                            var prompt = document.createElement("div")
                            prompt.className = "card"
                            prompt.innerHTML = "<h2>暂未查询到路线</h2>"
                            document.getElementById("list").innerHTML = ""
                            document.getElementById("list").appendChild(prompt)
                            console.log(prompt)
                        } else {
                            document.getElementById("list").innerHTML = ""
                            var routes = response.routes
                            for (var index in routes) {
                                show(JSON.parse(routes[index]))
                            }
                        }
                    } else {
                        alert(response.message)
                        var prompt = document.createElement("div")
                        prompt.className = "card"
                        prompt.innerHTML = "<h2>暂未查询到路线</h2>"
                        document.getElementById("list").innerHTML = ""
                        document.getElementById("list").appendChild(prompt)
                        console.log(prompt)
                    }
                } else {
                    alert("响应格式错误，请稍后重试")
                }
            } else {
                alert(`${response.status}：出现错误，请稍后重试`)
            }
        }
    }
    request.open(method, url, true)
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
    request.send(null)
}

/**
 * 显示路线信息
 * @param {object} item 路线信息
 */
function show(item) {
    var card = document.createElement("div")
    var intro = item.intro ? item.intro : "暂无说明"
    card.className = "card"
    card.innerHTML = `<h2>${item.name}</h2>
        <span class="id">所属机构: ${item.org}</span>
        <div>${intro}</div>
        <button onclick="select('${item.id}')" id="${item.id}" class="cardButton">选择</button>`
        // var link = document.createElement("a")
        // link.href = `../../Device/show/show.html?route=${item.id}`
        // link.appendChild(card)
    document.getElementById("list").appendChild(card)
    document.getElementById("item.id}").onclick = () => select(item.id); //要append到DOM中后才能get到Element
}

/**
 * 选择路线
 * @param {string} route 路线id
 * @returns null
 */
var select = (route) => {
    if (!confirm("确定要更改路线吗？")) {
        return;
    }
    var request = new XMLHttpRequest()
    var method = "PUT"
    var url = "http://122.51.3.35/user.php"
    var content = `route=${route}&id=444`
    request.onreadystatechange = () => {
        if (request.readyState == 4) {
            if ((request.status >= 200 && request.status < 300) || request.status == 304) {
                let response = {};
                try {
                    console.log(request.responseText)
                    response = JSON.parse(request.responseText);
                } catch (e) {}
                if (typeof(response) !== {}) {
                    if (response.status == 200) {
                        alert("更改成功")
                        loadData()
                        history.back()
                    } else {
                        alert(response.message)
                    }
                } else {
                    alert("响应格式错误，请稍后重试")
                }
            } else {
                alert(`${request.status}：出现错误，请稍后重试`)
            }
        }
    }
    request.open(method, url, true)
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
    request.send(content)
}

/**
 * 注销登录
 */
function logout() {
    fetch(`${serviceBaseUrl}/logout.php`)
        .then(res => res.json())
        .then(response => {
            if (response.status === 200) {
                alert('注销成功');
            } else {
                alert(`注销失败：${response.message}`);
            }
        }).catch(err => {
            console.log(err);
        });
}