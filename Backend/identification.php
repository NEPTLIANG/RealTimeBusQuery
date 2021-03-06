<?php
session_start();
include('conf/conf.php');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE");

/**
 * 鉴权
 */
function authentification() {
    if (!isset($_SESSION['valid_org'])) {
        $result["status"] = 403;
        $result["message"] = "请先登录";
        exit(json_encode($result, JSON_UNESCAPED_UNICODE));
    }
}

$pattern = "/[a-zA-Z0-9_-]{1,21}/";
switch ($_SERVER['REQUEST_METHOD']) {
    case "POST":
        authentification();
        if (!isset($_POST['name']) || !isset($_POST['id']) || !isset($_POST['route']) 
            || !isset($_POST['lng']) || !isset($_POST['lat'])) {
            $result['status'] = 400;
            $result['message'] = '参数缺失';
            exit(json_encode($result, JSON_UNESCAPED_UNICODE));
        }
        $name   = trim($_POST['name']);
        $id     = trim($_POST['id']);
        $route  = trim($_POST['route']);
        $lng    = doubleval(trim($_POST['lng']));
        $lat    = doubleval(trim($_POST['lat']));
        $intro = (isset($_POST['intro']) && trim($_POST['intro'])) ? trim($_POST['intro']) : "暂无说明";
        if (strlen($name) > 20 || !preg_match($pattern, $id) || !preg_match($pattern, $route)
            || $lng < 0 || $lng > 180 || $lat < 0 || $lat >180 || strlen($intro) > 128) {
            $result["status"] = 400;
            $result["message"] = "不合法的值";
            exit(json_encode($result, JSON_UNESCAPED_UNICODE));
        }
        @$db = new mysqli("127.0.0.1", "root", $dbPwd);
        if (mysqli_connect_errno()) {
            $result["status"] = 500;
            $result["message"] = "无法连接到数据库，请稍后重试";
            exit(json_encode($result, JSON_UNESCAPED_UNICODE));
        }
        $db->select_db("RealTimeBusQuery");
        $query = "INSERT INTO identification(name, id, route, lng, lat, intro) "
            . "VALUES(?, ?, ?, ?, ?, ?)";
        $stmt = $db->prepare($query);
        $stmt->bind_param("ssssss", $name, $id, $route, $lng, $lat, $intro);
        $stmt->execute();
        if ($stmt->affected_rows > 0) {
            $result["status"] = 200;
            $result["describe"] = "OK";
        } else {
            $result["status"] = 500;
            $result["message"] = "发生错误，标识点未添加";
        }
        $db->close();
        exit(json_encode($result, JSON_UNESCAPED_UNICODE));
        break;
    case "GET":
        $route = trim($_GET['route']);
        if (!preg_match($pattern, $route)) {
            $result['status'] = 400;
            $result['message'] = "不合法的值";
        }
        @$db = new mysqli("127.0.0.1", "root", $dbPwd);  //这里应该用本地ip而非localhost，否则报错
        if (mysqli_connect_errno()) {
            $result['status'] = 500;
            $result['message'] = "无法连接到数据库，请稍后重试";
            exit(json_encode($result, JSON_UNESCAPED_UNICODE));
        }
        $db->select_db("RealTimeBusQuery");
        $query = "SELECT id, name, route, lng, lat, intro "
            . "FROM identification "
            . "WHERE route=?";
        $stmt = $db->prepare($query);
        $stmt->bind_param("s", $route);
        $stmt->bind_result($id, $name, $route, $lng, $lat, $intro);
        $stmt->execute();
        $stmt->store_result();
        if (!$stmt->num_rows) {
            $result['status'] = 400;
            $result['message'] = "没有查询到标识点";
            exit(json_encode($result, JSON_UNESCAPED_UNICODE));
        }
        $identifications = [];
        while ($stmt->fetch()) {
            $identification = [
                "id"    => $id,
                "name"  => $name,
                "route" => $route,
                "lng" => $lng,
                "lat" => $lat,
                "intro" => $intro
            ];
            array_push($identifications, $identification);
        }
        $db->close();
        $result['status'] = 200;
        $result['describe'] = "OK";
        $result['identifications'] = $identifications;
        exit(json_encode($result, JSON_UNESCAPED_UNICODE));
        break;
    case "PUT":
        authentification();
        parse_str(file_get_contents('php://input'), $data);
        if (!isset($data['name']) || !isset($data['oldId']) || !isset($data['newId']) 
            || !isset($data['route']) || !isset($data['lng']) || !isset($data['lat'])) {
            $result['status'] = 400;
            $result['message'] = '参数缺失';
            exit(json_encode($result, JSON_UNESCAPED_UNICODE));
        }
        $name   = trim($data['name']);
        $oldId     = trim($data['oldId']);
        $newId     = trim($data['newId']);
        $route  = trim($data['route']);
        $lng    = doubleval(trim($data['lng']));
        $lat    = doubleval(trim($data['lat']));
        $intro = (isset($data['intro']) && trim($data['intro'])) ? trim($data['intro']) : "暂无说明";
        if (strlen($name) > 20 || !preg_match($pattern, $oldId) || !preg_match($pattern, $newId) 
            || !preg_match($pattern, $route) || $lng < 0 || $lng > 180 
            || $lat < 0 || $lat >180 || strlen($intro) > 128) {
            $result['status'] = "400";
            $result['message'] = "不合法的值";
            exit(json_encode($result, JSON_UNESCAPED_UNICODE));
        }
        @$db = new mysqli("127.0.0.1", "root", $dbPwd);
        if (mysqli_connect_errno()) {
            $result['status'] = 500;
            $result['message'] = "无法连接到数据库，请稍后重试";
            exit(json_encode($result, JSON_UNESCAPED_UNICODE));
        }
        $db->select_db("RealTimeBusQuery");
        $query = "UPDATE identification "
            . "SET id=?, name=?, route=?, lng=?, lat=?, intro=? "
            . "WHERE id=?";
        $stmt = $db->prepare($query);
        $stmt->bind_param("sssddss", $newId, $name, $route, $lng, $lat, $intro, $oldId);
        $stmt->execute();
        if (!$stmt->affected_rows) {
            $result['status'] = 500;
            $result['message'] = "发生错误，标识点信息未修改";
        } else {
            $result['status'] = 200;
            $result['describe'] = "OK";
        }
        $db->close();
        exit(json_encode($result, JSON_UNESCAPED_UNICODE));
        break;
    case "DELETE":
        authentification();
        parse_str(file_get_contents("php://input"), $data);
        $id = trim($data['id']);
        if (!preg_match($pattern, $id)) {
            $result['status'] = 400;
            $result['message'] = "不合法的值";
            exit(json_encode($result, JSON_UNESCAPED_UNICODE));
        }
        @$db = new mysqli("127.0.0.1", "root", $dbPwd);
        if (mysqli_connect_errno()) {
            $result['status'] = 500;
            $result['message'] = "无法连接到数据库，请稍后重试";
            exit(json_encode($result, JSON_UNESCAPED_UNICODE));
        }
        $db->select_db("RealTimeBusQuery");
        $query = "DELETE FROM identification "
            . "WHERE id=?";
        $stmt = $db->prepare($query);
        $stmt->bind_param("s", $id);
        $stmt->execute();
        if ($stmt->affected_rows) {
            $result['status'] = 200;
            $result['describe'] = "OK";
        } else {
            $result['status'] = 500;
            $result['message'] = "发生错误，标识点未删除";
        }
        $db->close();
        exit(json_encode($result, JSON_UNESCAPED_UNICODE));
        break;
}