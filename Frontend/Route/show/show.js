import { serviceBaseUrl } from '../../Conf/conf.js';

onload = () => {
    let logoutBtn = document.getElementById('logout')
    logoutBtn.addEventListener('click', logout)
        // location.reload();
    var refresh = document.getElementById("refresh")
    refresh.addEventListener("click", loadData)
    loadData()
}

/**
 * 获取路线信息
 */
function loadData() {
    document.getElementById("list").innerHTML = '';
    var org = location.search.split("=")[1]
    console.log(org)
    var response
    var request = new XMLHttpRequest()
    var method = "GET"
    var url = `${serviceBaseUrl}/route.php?org=${org}`
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
                        prompt.innerHTML = `<h2>${reponse.status}：暂未查询到路线</h2>`
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
 * @param {object} item 路线
 */
function show(item) {
    var card = document.createElement("div")
    var intro = item.intro ? item.intro : "暂无说明"
    card.className = "card"
    card.innerHTML = `<h2>${item.name}</h2>
        <span class="id">id: ${item.id}</span>
        <div>${intro}</div>
        <a href='../modify/modify.html?id=${item.id}&name=${item.name}&org=${item.org}&intro=${item.intro}' class="cardButton">编辑</a>
        <button id="${item.id}" class="cardOption">删除</button>`
        // var link = document.createElement("a")
        // link.href = `../../Device/show/show.html?route=${item.id}`
        // link.appendChild(card)
        // document.getElementById("list").appendChild(link)
    document.getElementById("list").appendChild(card)
    card.addEventListener('click', () => {
        location = `../../Device/show/show.html?route=${item.id}`
    })
    document.getElementById(item.id).addEventListener('click', e => {
        e.stopPropagation()
        del(item.id)
    })
}

/**
 * 删除路线
 * @param {string} id 路线ID
 * @returns null
 */
let del = id => {
    if (!confirm('确定要删除路线吗？此操作将把路线下属设备与标识点一并删除，且无法恢复')) {
        return;
    }
    var request = new XMLHttpRequest()
    var method = "DELETE"
    var url = `${serviceBaseUrl}/route.php`
    var content = `id=${id}`
    request.onreadystatechange = () => {
        if (request.readyState == 4) {
            if ((request.status >= 200 && request.status < 300) || request.status == 304) {
                let response = {}
                try {
                    console.log(request.responseText)
                    response = JSON.parse(request.responseText);
                } catch (e) {
                    alert("响应格式错误，请稍后重试")
                }
                if (response !== {}) {
                    if (response.status == 200) {
                        alert("删除成功")
                        loadData()
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
        })
        .catch(err => {
            console.log(err);
        });
}