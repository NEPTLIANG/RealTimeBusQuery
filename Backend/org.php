<?php
session_start();
include('conf/conf.php');
// header("Access-Control-Allow-Origin: *");   //线上环境记得关闭跨域

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
        . "FROM org "
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
        if ((preg_match($pattern, $id) !== 0) && isset($pwd) && isset($name)) {
            //var_dump(isset($dev));
            @$db = new mysqli("127.0.0.1", "root", $dbPwd);
            if (mysqli_connect_errno()) {
                $result["status"] = 500;
                $result["message"] = "无法连接到数据库，请稍后重试";
                exit(json_encode($result, JSON_UNESCAPED_UNICODE));
            }
            $db->select_db("RealTimeBusQuery");
            $query = "INSERT INTO org(id, pwd, name) VALUES (?, ?, ?)";
            $stmt = $db->prepare($query);
            $stmt->bind_param("sss", $id, $pwd, $name);
            $stmt->execute();
            if ($stmt->affected_rows > 0) {
                $result["status"] = 200;
                $result["describe"] = "OK";
            } else {
                $result["status"] = 500;
                $result["message"] = "发生错误，机构未注册";
            }
            $db->close();
        } else {
            $result["status"] = 400;
            $result["message"] = "不合法的值";
        }
        exit(json_encode($result, JSON_UNESCAPED_UNICODE));
        break;
    case "PUT":
        authentification();
        parse_str(file_get_contents('php://input'), $put);
        if (isset($put['name']) && isset($put['oldPwd']) && isset($put['newPwd'])) { 
            $id = trim($_SESSION['valid_org']);
            $name = trim($put["name"]);
            $oldPwd = trim($put['oldPwd']);
            $newPwd = trim($put['newPwd']);
            $intro = isset($put['intro']) ? trim($put["intro"]) : '暂无简介';
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
            $query = "UPDATE org "
                . "SET name=?, pwd=?, intro=? "
                . "WHERE id=?";
            $stmt = $db->prepare($query);
            $stmt->bind_param("ssss", $name, $newPwd, $intro, $id);
            $stmt->execute();
            if ($stmt->affected_rows > 0) {
                $result["status"] = 200;
                $result["describe"] = "OK";
                $result["message"] = "修改成功";
            } else {
                $result["status"] = 500;
                $result["message"] = "发生错误，未修改";
            }
            $db->close();
            exit(json_encode($result, JSON_UNESCAPED_UNICODE));
        } else if (isset($put['name'])) {     //修改机构名
            $id = trim($_SESSION['valid_org']);
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
            $query = "UPDATE org "
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
            exit(json_encode($response, JSON_UNESCAPED_UNICODE));
        } else {    //缺少参数
            $response["status"] = 400;
            $response["message"] = "缺少请求参数";
            exit(json_encode($response, JSON_UNESCAPED_UNICODE));
        }
        exit(json_encode($response, JSON_UNESCAPED_UNICODE));
        break;
    case "GET":
        $id = trim($_GET["id"]);
        $pwd = trim($_GET["pwd"]);
        if (preg_match($pattern, $id) !== 0) {
            @$db = new mysqli("127.0.0.1", "root", $dbPwd);
            if (mysqli_connect_errno()) {
                $response['status'] = 500;
                $response['message'] = "无法连接到数据库，请稍后重试";
                exit(json_encode($response, JSON_UNESCAPED_UNICODE));
            }
            $db->select_db("RealTimeBusQuery");
            $query = "SELECT pwd "
                . "FROM org "
                . "WHERE id=?";
            $stmt = $db->prepare($query);
            $stmt->bind_param("s", $id);
            $stmt->bind_result($realPwd);
            $stmt->execute();
            $stmt->store_result();
            if ($stmt->num_rows === 1) {
                $stmt->fetch();
                if ($realPwd !== $pwd) {
                    $result['status'] = 400;
                    $result['message'] = "密码错误";
                    exit(json_encode($result, JSON_UNESCAPED_UNICODE));
                }
                $result["status"] = 200;
                $result["describe"] = "OK";
                $_SESSION['valid_org'] = $id;
            } else {
                $result["status"] = 500;
                $result["message"] = "发生错误，无法查询机构信息";
            }
            $db->close();
        } else {
            $result["status"] = 400;
            $result["message"] = "不合法的值";
        }
        exit(json_encode($result, JSON_UNESCAPED_UNICODE));
        break;
    /* case "DELETE":
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
            $response['message'] = "无法连接到数据库，请稍后重试";
            exit(json_encode($response, JSON_UNESCAPED_UNICODE));
        }
        $db->select_db("RealTimeBusQuery");
        $query = "DELETE FROM org "
            . "WHERE id=?";
        $stmt = $db->prepare($query);
        $stmt->bind_param("s", $id);
        $stmt->execute();
        if ($stmt->affected_rows) {
            $response['status'] = 200;
            $response['describe'] = "OK";
        } else {
            $response['status'] = 500;
            $response['message'] = "发生错误，标识点未删除";
        }
        $db->close();
        exit(json_encode($response, JSON_UNESCAPED_UNICODE));
        break; */
}
