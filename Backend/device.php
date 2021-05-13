<?php

class Device
{
    private $name;      //设备名
    private $id;        //id
    private $route;     //属于哪条路线
    private $lng;       //经度
    private $lat;       //纬度
    private $intro;     //说明

    function __get($name)
    {
        return $this->$name;
    }

    function __set($name, $value)
    {
        switch ($name) {
            case "id":
                $pattern = "[a-zA-Z0-9_-]{2,21}";
                if (preg_match($pattern, $value)) {
                    $this->id = $value;
                }
                break;
            case "lng":
            case "lat":
                $lng = substr($value, 0, strlen($value) - 1);
                if ($lng >= 0 && $lng <= 180) {
                    $this->lng = $value;
                }
                break;
        }
    }

    function __construct($name, $id, $route)
    {
        $pattern = "/^[a-zA-Z0-9_\-]{1,20}$/";
        if (preg_match($pattern, $id) !== 0 && preg_match($pattern, $route) !== 0 && $name !== "") {
            $this->name = $name;
            $this->id = $id;
            $this->route = $route;
        }
    }
}

include_once('conf/conf.php');
session_start();

header("Access-Control-Allow-Origin: *");   //线上环境记得关闭跨域
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");

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

switch ($_SERVER['REQUEST_METHOD']) {
    case "POST" :
        authentification();
        if (!isset($_POST['name']) || !isset($_POST['id']) || !isset($_POST['route'])) {
            $result['status'] = 400;
            $result['message'] = '参数缺失';
            exit(json_encode($result, JSON_UNESCAPED_UNICODE));
        }
        $name   = trim($_POST['name']);
        $id     = trim($_POST['id']);
        $route  = trim($_POST['route']);
        $intro = (isset($_POST['intro']) && trim($_POST['intro'])) ? trim($_POST['intro']) : "暂无说明";
        if (isset($name) && isset($id) && isset($route)) {
            $dev = new Device($name, $id, $route);
        } else {
            $result["status"] = 400;
            $result["message"] = "不合法的值";
            exit(json_encode($result, JSON_UNESCAPED_UNICODE));
        }
        if (isset($dev)) {
            @$db = new mysqli("127.0.0.1", "root", $dbPwd);
            if (mysqli_connect_errno()) {
                $result["status"] = 500;
                $result["message"] = "无法连接到数据库，请稍后重试";
                exit(json_encode($result, JSON_UNESCAPED_UNICODE));
            }
            $db->select_db("RealTimeBusQuery");
            $query = "INSERT INTO device VALUES (?, ?, ?, 0, 0, ?, 0x00)";
            $stmt = $db->prepare($query);
            if (!$stmt) {
                // exit(var_dump($db->error_list[0]['error']));
                // $errMsg = json_encode($db->error_list);
                $result['status'] = 500;
                $result['message'] = "设备添加失败，查询出错：{$db->error_list[0]['error']}";
                exit(json_encode($result, JSON_UNESCAPED_UNICODE));
            }
            $stmt->bind_param("ssss", $id, $name, $route, $intro);
            $stmt->execute();
            if ($stmt->affected_rows > 0) {
                $result["status"] = 200;
                $result["describe"] = "OK";
                $result["message"] = "设备添加成功";
            } else {
                $result['status'] = 500;
                $result['message'] = "发生错误，设备未添加";
            }
            $db->close();
            exit(json_encode($result, JSON_UNESCAPED_UNICODE));
            /*@$db = mysqli_connect("localhost", "root", "916616515");
            if (mysqli_connect_errno()) {
                echo "无法连接到数据库";
                exit;
            }
            mysqli_select_db($db, "RealTimeBusQuery");
            $query = "INSERT INTO device"
                . "VALUES(?, ?, ?, ?)";
            mysqli_stmt_prepare($query);
            mysqli_stmt_bind_param("s", $name, $id, $route, $intro);
            mysqli_stmt_execute($query);*/
        } else {
            $result["status"] = 400;
            $result["message"] = "不合法的值";
            exit(json_encode($result, JSON_UNESCAPED_UNICODE));
        }
        break;
    case "PUT":
        authentification();
        $pattern = "/^[a-zA-Z0-9_\-]{1,20}$/";
        parse_str(file_get_contents('php://input'), $data);
        if (isset($data["id"]) && isset($data["lng"]) && isset($data["lat"])) {  //上传定位
            $id = trim($data["id"]);
            $lng = doubleval(trim($data["lng"]));  //经度
            $lat = doubleval(trim($data["lat"]));  //纬度
            if (preg_match($pattern, $id) !== 0
                && ($lng >= 0 && $lng <= 180) && ($lat >= 0 && $lat <= 90)) {
                @$db = new mysqli("127.0.0.1", "root", $dbPwd);
                if (mysqli_connect_errno()) {
                    $response['status'] = 500;
                    $response['message'] = "无法连接到数据库，请稍后重试";
                    exit(json_encode($response, JSON_UNESCAPED_UNICODE));
                }
                $db->select_db("RealTimeBusQuery");
                $query = "UPDATE device "
                    . "SET id=?, lng=?, lat=? "
                    . "WHERE id=?";
                $stmt = $db->prepare($query);
                $stmt->bind_param("sdds", $id, $lng, $lat, $id);
                $stmt->execute();
                if ($stmt->affected_rows > 0) {
                    $response['status'] = 200;
                    $response['describe'] = "OK";
                } else {
                    $response['status'] = 500;
                    $response['message'] = "发生错误，定位未上传";
                }
            } else {
                $response['code'] = 400;
                $response['message'] = "不合法的值";
                exit(json_encode($response, JSON_UNESCAPED_UNICODE));
            }
        } else if (isset($data['oldId']) && isset($data['newId']) && isset($data['name'])
            && isset($data['route']) && isset($data['intro'])) {  //修改信息
            $oldId  = trim($data['oldId']);
            $newId  = trim($data['newId']);
            $name   = trim($data['name']);
            $route  = trim($data['route']);
            $intro  = trim($data['intro']);
            $intro  = $intro ? $intro : "暂无说明";
            if ($name && preg_match($pattern, $oldId) && preg_match($pattern, $newId)
                && preg_match($pattern, $route) && $intro) {
                @$db = new mysqli("127.0.0.1", "root", $dbPwd);
                if (mysqli_connect_errno()) {
                    $response['status'] = 500;
                    $response['message'] = "无法连接到数据库，请稍后重试";
                    exit(json_encode($response, JSON_UNESCAPED_UNICODE));
                }
                $db->select_db("RealTimeBusQuery");
                $query = "UPDATE device "
                    . "SET id=?, name=?, route=?, intro=? "
                    . "WHERE id=?";
                $stmt = $db->prepare($query);
                $stmt->bind_param("sssss", $newId, $name, $route, $intro, $oldId);
                $stmt->execute();
                if ($stmt->affected_rows > 0) {
                    $response['status'] = 200;
                    $response['describe'] = "OK";
                } else {
                    $response['status'] = 500;
                    $response['message'] = "发生错误，设备信息未修改";
                }
            } else {
                $response['code'] = 400;
                $response['message'] = "不合法的值";
                exit(json_encode($response, JSON_UNESCAPED_UNICODE));
            }
        } else if (isset($data["id"]) && isset($data["status"])) {  //设置状态
            $id = trim($data["id"]);
            $status = intval(trim($data["status"]));
            if (preg_match($pattern, $id) !== 0
                && ($status === 1 || $status === 0)) {
                @$db = new mysqli("127.0.0.1", "root", $dbPwd);
                if (mysqli_connect_errno()) {
                    $response['status'] = 500;
                    $response['message'] = "无法连接到数据库，请稍后重试";
                    exit(json_encode($response, JSON_UNESCAPED_UNICODE));
                }
                $db->select_db("RealTimeBusQuery");
                $query = "UPDATE device "
                    . "SET status=? "
                    . "WHERE id=?";
                $stmt = $db->prepare($query);
                $stmt->bind_param("ds", $status, $id);
                $stmt->execute();
                if ($stmt->affected_rows > 0) {
                    $response['status'] = 200;
                    $response['describe'] = "OK";
                } else {
                    $response['status'] = 500;
                    $response['message'] = "发生错误，设备状态未修改";
                }
            } else {
                $response['code'] = 400;
                $response['message'] = "不合法的值";
                exit(json_encode($response, JSON_UNESCAPED_UNICODE));
            }
        } else {
            $response['code'] = 400;
            $response['message'] = "不合法的值";
            exit(json_encode($response, JSON_UNESCAPED_UNICODE));
        }
        $db->close();
        exit(json_encode($response, JSON_UNESCAPED_UNICODE));
        break;
    case "GET":
        if (!isset($_GET['route'])) {
            $response['code'] = 400;
            $response['message'] = "请先登录并选择路线";
            exit(json_encode($response, JSON_UNESCAPED_UNICODE));
        }
        $route = trim($_GET["route"]);
        $pattern = "/^[a-zA-Z0-9_\-]{1,20}$/";
        if (preg_match($pattern, $route) !== 0) {
            @$db = new mysqli("127.0.0.1", "root", $dbPwd);
            if (mysqli_connect_errno()) {
                $response['status'] = 500;
                $response['message'] = "无法连接到数据库，请稍后重试";
                exit(json_encode($response, JSON_UNESCAPED_UNICODE));
            }
            $db->select_db("RealTimeBusQuery");
            $query = "SELECT id, name, route, intro, lng, lat, status "
                . "FROM device "
                . "WHERE route=?";
            $stmt = $db->prepare($query);
            $stmt->bind_param("s", $route);
            $stmt->bind_result($id, $name, $route, $intro, $lng, $lat, $status);
            $stmt->execute();
            $stmt->store_result();
            if ($stmt->num_rows > 0) {
                $devices = [];
                while ($stmt->fetch()) {
                    $device = [
                        "id" => $id,
                        "name" => $name,
                        "route" => $route,
                        "intro" => $intro,
                        "lng" => $lng,
                        "lat" => $lat,
                        'status' => $status
                    ];
                    array_push($devices, json_encode($device));
                }
                $db->close();
                $result["status"] = 200;
                $result["describe"] = "OK";
                $result["devices"] = $devices;
            } else {
                $result["status"] = 500;
                $result["message"] = "没有找到设备";
            }
            exit(json_encode($result, JSON_UNESCAPED_UNICODE));
        } else {
            $result["status"] = 400;
            $result["message"] = "不合法的值";
            exit(json_encode($result, JSON_UNESCAPED_UNICODE));
        }
        break;
    case "DELETE":
        authentification();
        parse_str(file_get_contents("php://input"), $data);
        $id = trim($data['id']);
        $pattern = "/^[a-zA-Z0-9_\-]{1,20}$/";
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
        $query = "DELETE FROM device "
            . "WHERE id=?";
        $stmt = $db->prepare($query);
        $stmt->bind_param("s", $id);
        $stmt->execute();
        if ($stmt->affected_rows) {
            $result['status'] = 200;
            $result['describe'] = "OK";
        } else {
            $result['status'] = 500;
            $result['message'] = "发生错误，设备未删除";
        }
        $db->close();
        exit(json_encode($result, JSON_UNESCAPED_UNICODE));
        break;
}
