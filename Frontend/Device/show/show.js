onload = () => {
    document.getElementById("identification").onclick = () => {
        location = `../../Identification/show/show.html?route=${location.search.split("=")[1]}`
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
    var url = `http://122.51.3.35/device.php?route=${route}`
    request.onreadystatechange = () => {
        if (request.readyState == 4) {
            if ((request.status >= 200 && request.status < 300) || request.status == 304) {
                try {
                    response = JSON.parse(request.responseText);
                } catch (e) {}
                if (response) {
                    if (response.status == 200) {
                        if (!response.devices.length) {
                            var prompt = document.createElement("div")
                            prompt.className = "card"
                            prompt.innerHTML = "<h2>暂未查询到车辆</h2>"
                            document.getElementById("list").appendChild(prompt)
                            console.log(prompt)
                        } else {
                            document.getElementById("list").innerHTML = ""
                            var devices = response.devices
                            for (var index in devices) {
                                show(JSON.parse(devices[index]))
                                console.log(devices[index])
                            }
                        }
                    } else {
                        alert(response.describe)
                        var prompt = document.createElement("div")
                        prompt.className = "card"
                        prompt.innerHTML = "<h2>暂未查询到车辆</h2>"
                        document.getElementById("list").appendChild(prompt)
                        console.log(response)
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

function show(item) {
    var card = document.createElement("div")
    var position = (item.lng && item.lat) ? (item.lng + "<br/>" + item.lat) : "暂无定位"
    var intro = item.intro ? item.intro : "暂无说明"
    card.className = "card"
    let { status } = item
    card.innerHTML = `
        <h2>${item.name}</h2>
        <span class="id">id: ${item.id}</span>
        <div class="position">
            <div style="font-weight: bold">位置</div>
            ${status ? position : '设备已禁用'}
        </div>
        <div>${intro}</div>
        <button onclick="switchStatus('${item.id}', '${status}')" class="cardButton" 
            style="background-color: ${status ? '#f77' : '#777'};
            color: ${status? '#fff' : '#eee'};
            line-height: unset;
        ">
            ${status? '点击<br/>停用' : '点击<br/>启用'}
        </button>
        <a href='../modify/modify.html?id=${item.id}&name=${item.name}&route=${item.route}&intro=${item.intro}' class="cardOption">编辑</a>
        <button onclick="del('${item.id}')" class="cardOption">删除</button>
    `
    document.getElementById("list").appendChild(card)
}

function switchStatus(id, status) {
    status = Number.parseInt(status)
    if (!confirm(`确定要${status ? '停用' : '启用'}设备吗？`)) {
        return
    }
    console.log('id=car1&status=0' === `id=${id}&status=${status ? 0 : 1}`)
    let data = `id=${id}&status=${status ? 0 : 1}`
    fetch('http://122.51.3.35/device.php', {
        method: 'PUT',
        body: data
    }).then((response) => {
        console.log(response)
        try {
            return response = response.json()
        } catch (e) {
            console.log(e)
            alert("响应格式错误，请稍后重试")
        }
    }).then((response) => {
        console.log(response)
        if (response) {
            if (response.status == 200) {
                alert("修改成功")
                loadData()
            } else {
                alert(response.message)
            }
        } else {
            // alert("响应格式错误，请稍后重试")
        }
    }).catch((error) => {
        alert(`${error}：出现错误，请稍后重试`)
    })
}

var del = (id) => {
    if (!confirm("确定要删除设备吗？")) {
        return;
    }
    var request = new XMLHttpRequest()
    var method = "DELETE"
    var url = "http://122.51.3.35/device.php"
    var content = `id=${id}`
    request.onreadystatechange = () => {
        if (request.readyState == 4) {
            if ((request.status >= 200 && request.status < 300) || request.status == 304) {
                try {
                    response = JSON.parse(request.responseText);
                } catch (e) {}
                if (response) {
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
                alert(`${response.status}：出现错误，请稍后重试`)
            }
        }
    }
    request.open(method, url, true)
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
    request.send(content)
}