<?php
include('conf/conf.php');
session_start();
header("Access-Control-Allow-Origin: *");   //线上环境记得关闭跨域
// if (isset($_SERVER['HTTP_ORIGIN'])) {
//     header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
// }
// header('Access-Control-Allow-Credentials: true');
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");

/**
 * 鉴权
 */
function authentification() {
    if (!isset($_SESSION['valid_user'])) {
        $response["status"] = 403;
        $response["message"] = "请先登录";
        //$response['message'] = (session_status() === PHP_SESSION_ACTIVE);
        //$response['message'] = session_id();
        //$response["message"] = "'{$_SESSION['valid_user']}'";
        exit(json_encode($response, JSON_UNESCAPED_UNICODE));
    }
}

function getPwd($id) {
    include('conf/conf.php');
    @$db = new mysqli("127.0.0.1", "root", $dbPwd);
    if (mysqli_connect_errno()) {
        $response['status'] = 500;
        $response['message'] = "无法连接到数据库：" . mysqli_connect_error();
        exit(json_encode($response, JSON_UNESCAPED_UNICODE));
    }
    $db->select_db("RealTimeBusQuery");
    $query = "SELECT pwd "
        . "FROM user "
        . "WHERE id=?";
    $stmt = $db->prepare($query);
    $stmt->bind_param("s", $id);
    $stmt->bind_result($realPwd);
    $stmt->execute();
    $stmt->store_result();
    if ($stmt->num_rows !== 1) {
        $db->close();
        $response["status"] = 500;
        $response["message"] = "发生错误，无法查询";
        exit(json_encode($response, JSON_UNESCAPED_UNICODE));
    }
    $stmt->fetch();
    $db->close();
    return $realPwd;
}

$pattern = "/^[a-zA-Z0-9_\-]{1,20}$/";
$pwdPattern = "/^[a-fA-F0-9]{128}$/";
switch ($_SERVER['REQUEST_METHOD']) {
    case "POST" :
        $name = trim($_POST['name']);
        $id = trim($_POST['id']);
        $pwd = trim($_POST['pwd']);
        if (strlen($name) <= 20 && (preg_match($pattern, $id) !== 0) && preg_match($pwdPattern, $pwd)) {
            @$db = new mysqli("127.0.0.1", "root", $dbPwd);
            if (mysqli_connect_errno()) {
                $response["status"] = 500;
                $response["message"] = "无法连接到数据库：" . mysqli_connect_error();
                exit(json_encode($response, JSON_UNESCAPED_UNICODE));
            }
            $db->select_db("RealTimeBusQuery");
            $query = "INSERT INTO user(name, id, pwd) VALUES (?, ?, ?)";
            $stmt = $db->prepare($query);
            $stmt->bind_param("sss", $name, $id, $pwd);
            $stmt->execute();
            if ($stmt->affected_rows > 0) {
                $response["status"] = 200;
                $response["describe"] = "OK";
                $response["message"] = "注册成功";
            } else {
                $response["status"] = 500;
                $response["message"] = "发生错误，未注册";
            }
            $db->close();
        } else {
            $response["status"] = 400;
            $response["message"] = "不合法的值";
        }
        exit(json_encode($response, JSON_UNESCAPED_UNICODE));
        break;
    case "PUT":
        authentification();
        parse_str(file_get_contents('php://input'), $put);
        if (isset($id['route'])) {      //用户添加路线
            $id = trim($_SESSION['valid_user']);
            $route = trim($put["route"]);
            if ((/* !preg_match($pattern, $id) !== 0) &&  */
                !preg_match($pattern, $route) !== 0)) {
                $response["status"] = 400;
                $response["message"] = "不合法的值";
            }
            @$db = new mysqli("127.0.0.1", "root", $dbPwd);
            if (mysqli_connect_errno()) {
                $response["status"] = 500;
                $response["message"] = "无法连接到数据库：" . mysqli_connect_error();
                exit(json_encode($response, JSON_UNESCAPED_UNICODE));
            }
            $db->select_db("RealTimeBusQuery");
            $query = "UPDATE user "
                . "SET route=? "
                . "WHERE id=?";
            $stmt = $db->prepare($query);
            $stmt->bind_param("ss", $route, $id);
            $stmt->execute();
            if ($stmt->affected_rows > 0) {
                $response["status"] = 200;
                $response["describe"] = "OK";
                $response["message"] = "修改成功";
            } else {
                $response["status"] = 500;
                $response["message"] = "发生错误，未修改";
            }
            $db->close();
            exit(json_encode($response));
        } else if (isset($put['name']) && isset($put['oldPwd']) && isset($put['newPwd'])) {     //修改密码
            $id = trim($_SESSION['valid_user']);
            $name = trim($put['name']);
            $oldPwd = trim($put['oldPwd']);
            $newPwd = trim($put['newPwd']);
            $realPwd = getPwd($id);
            if ($realPwd !== $oldPwd) {
                $response["status"] = 403;
                $response["message"] = "旧密码错误";
                exit(json_encode($response, JSON_UNESCAPED_UNICODE));
            }
            if (!(preg_match($pwdPattern, $newPwd) !== 0) && !isset($name)) {
                $response["status"] = 400;
                $response["message"] = "不合法的值";
                exit(json_encode($response, JSON_UNESCAPED_UNICODE));
            }
            @$db = new mysqli("127.0.0.1", "root", $dbPwd);
            if (mysqli_connect_errno()) {
                $response["status"] = 500;
                $response["message"] = "无法连接到数据库：" . mysqli_connect_error();
                exit(json_encode($response, JSON_UNESCAPED_UNICODE));
            }
            $db->select_db("RealTimeBusQuery");
            $query = "UPDATE user "
                . "SET name=?, pwd=? "
                . "WHERE id=?";
            $stmt = $db->prepare($query);
            $stmt->bind_param("sss", $name, $newPwd, $id);
            $stmt->execute();
            if ($stmt->affected_rows > 0) {
                $response["status"] = 200;
                $response["describe"] = "OK";
                $response["message"] = "修改成功";
            } else {
                $response["status"] = 500;
                $response["message"] = "发生错误，未修改";
            }
            $db->close();
            exit(json_encode($response));
        } else if (isset($put['name'])) {     //修改用户名
            $id = trim($_SESSION['valid_user']);
            $name = trim($put['name']);
            if (!isset($name)) {
                $response["status"] = 400;
                $response["message"] = "不合法的值";
                exit(json_encode($response, JSON_UNESCAPED_UNICODE));
            }
            @$db = new mysqli("127.0.0.1", "root", $dbPwd);
            if (mysqli_connect_errno()) {
                $response["status"] = 500;
                $response["message"] = "无法连接到数据库：" . mysqli_connect_error();
                exit(json_encode($response, JSON_UNESCAPED_UNICODE));
            }
            $db->select_db("RealTimeBusQuery");
            $query = "UPDATE user "
                . "SET name=? "
                . "WHERE id=?";
            $stmt = $db->prepare($query);
            $stmt->bind_param("ss", $name, $id);
            $stmt->execute();
            if ($stmt->affected_rows > 0) {
                $response["status"] = 200;
                $response["describe"] = "OK";
                $response["message"] = "修改成功";
            } else {
                $response["status"] = 500;
                $response["message"] = "发生错误，未修改";
            }
            $db->close();
            exit(json_encode($response));
        } else {    //缺少参数
            $response["status"] = 400;
            $response["message"] = "缺少请求参数";
            exit(json_encode($response));
        }
        exit(json_encode($response));
        break;
    case "GET":
        if (isset($_GET['pwd'])) {  //登录验证
            $id = trim($_GET["id"]);
            $pwd = trim($_GET["pwd"]);
            if (!preg_match($pattern, $id) || !preg_match($pwdPattern, $pwd)) {
                $response["status"] = 400;
                $response["message"] = "不合法的值";
                exit(json_encode($response, JSON_UNESCAPED_UNICODE));
            }
            $realPwd = getPwd($id);
            if ($realPwd !== $pwd) {
                $response["status"] = 400;
                $response["message"] = "密码错误";
                exit(json_encode($response, JSON_UNESCAPED_UNICODE));
            }
            $_SESSION['valid_user'] = $id;
            // session_commit();
            //$response['message'] = (session_status() === PHP_SESSION_ACTIVE);
            //$response['message'] = $_SESSION['valid_user'];
            $response["status"] = 200;
            $response["describe"] = "OK";
            exit(json_encode($response, JSON_UNESCAPED_UNICODE));
        } else {  //查询路线
            authentification();
            $id = trim($_SESSION['valid_user']);
            @$db = new mysqli("127.0.0.1", "root", "amd,yes!");
            if (mysqli_connect_errno()) {
                $response['status'] = 500;
                $response['message'] = "无法连接到数据库：" . mysqli_connect_error();
                exit(json_encode($response, JSON_UNESCAPED_UNICODE));
            }
            $db->select_db("RealTimeBusQuery");
            $query = "SELECT route "
                . "FROM user "
                . "WHERE id=?";
            $stmt = $db->prepare($query);
            $stmt->bind_param("s", $id);
            $stmt->bind_result($route);
            $stmt->execute();
            $stmt->store_result();
            if ($stmt->num_rows === 1) {
                $stmt->fetch();
                $response["status"] = 200;
                $response["describe"] = "OK";
                $response["routes"] = $route;
            } else {
                $response["status"] = 500;
                $response["message"] = "发生错误，无法查询";
            }
            $db->close();
            exit(json_encode($response, JSON_UNESCAPED_UNICODE));
        }
        break;
    /* case "DELETE":   //暂不支持注销用户
        parse_str(file_get_contents("php://input"), $delete);
        $id = trim($delete['id']);
        if (!preg_match($pattern, $id)) {
            $response['status'] = 400;
            $response['message'] = "不合法的值";
            exit(json_encode($response, JSON_UNESCAPED_UNICODE));
        }
        @$db = new mysqli("127.0.0.1", "root", $dbPwd);
        if (mysqli_connect_errno()) {
            $response['status'] = 500;
            $response['message'] = "无法连接到数据库：" . mysqli_connect_error();
            exit(json_encode($response, JSON_UNESCAPED_UNICODE));
        }
        $db->select_db("RealTimeBusQuery");
        $query = "DELETE FROM user "
            . "WHERE id=?";
        $stmt = $db->prepare($query);
        $stmt->bind_param("s", $id);
        $stmt->execute();
        if ($stmt->affected_rows) {
            $response['status'] = 200;
            $response["describe"] = "OK";
        } else {
            $response['status'] = 500;
            $response['message'] = "发生错误，用户未删除";
        }
        $db->close();
        exit(json_encode($response, JSON_UNESCAPED_UNICODE));
        break; */
}