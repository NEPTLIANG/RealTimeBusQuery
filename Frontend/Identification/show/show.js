import { serviceBaseUrl } from '../../Conf/conf.js'

onload = () => {
    document.getElementById("device").onclick = () => {
        location = `../../Device/show/show.html?route=${location.search.split("=")[1]}`
    }
    var refresh = document.getElementById("refresh")
    refresh.addEventListener("click", loadData)
    loadData()
}

function loadData() {
    var route = location.search.split("=")[1]
    var response
    var request = new XMLHttpRequest()
    var method = "GET"
    var url = `${serviceBaseUrl}/identification.php?route=${route}`
    request.onreadystatechange = () => {
        if (request.readyState == 4) {
            if ((request.status >= 200 && request.status < 300) || request.status == 304) {
                try {
                    response = JSON.parse(request.responseText)
                } catch (e) {}
                if (response) {
                    document.getElementById('list').innerHTML = ''
                    if (response.status == 200) {
                        if (!response.identifications.length) {
                            var prompt = document.createElement("div")
                            prompt.className = "card"
                            prompt.innerHTML = "<h2>暂无标识点</h2>"
                            document.getElementById("list").appendChild(prompt)
                            console.log(prompt)
                                // alert(response.message)
                        } else {
                            document.getElementById("list").innerHTML = ""
                            var identifications = response.identifications
                            for (var index in identifications) {
                                console.log(identifications[index])
                                show(identifications[index])
                            }
                        }
                    } else {
                        // alert(response.message)
                        var prompt = document.createElement("div")
                        prompt.className = "card"
                        prompt.innerHTML = "<h2>暂未查询到标识点</h2>"
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
 * 把标识点信息展示在页面上
 * @param {object} item 标识点
 */
function show(item) {
    console.log(item)
    var card = document.createElement("div")
    var intro = item.intro ? item.intro : "暂无说明"
    card.className = "card"
    card.innerHTML = `<h2>${item.name}</h2>
        <span class="id">id: ${item.id}</span>
        <div>${intro}</div>
        <a href='../modify/modify.html?id=${item.id}&name=${item.name}&route=${item.route}&lng=${item.lng}&lat=${item.lat}&intro=${item.intro}' class="cardButton">编辑</a>
        <button onclick="del('${item.id}')" class="cardOption">删除</button>`
    document.getElementById("list").appendChild(card)
    document.getElementById(`del_${item.id}`).addEventListener('click', () => del(item.id))
}

var del = (id) => {
    if (!confirm("确定要删除标识点吗？")) {
        return;
    }
    var request = new XMLHttpRequest()
    var method = "DELETE"
    var url = `${serviceBaseUrl}/identification.php`
    var content = `id=${id}`
    request.onreadystatechange = () => {
        if (request.readyState == 4) {
            if ((request.status >= 200 && request.status < 300) || request.status == 304) {
                let response = {}
                try {
                    console.log(request.responseText)
                    response = JSON.parse(request.responseText);
                } catch (e) {}
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