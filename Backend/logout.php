<?php
/*
 * @Author: NeptLiang
 * @Date: 2021-04-09 14:06:06
 * @LastEditors: NeptLiang
 * @LastEditTime: 2021-04-09 14:12:08
 * @Description: 注销登录
 */

session_start();
unset($_SESSION['valid_user']);
unset($_SESSION['valid_org']);
if (session_destroy()) {
    $response['status'] = 200;
    $response['message'] = '注销成功';
} else {
    $response['status'] = 500;
    $response['message'] = '注销失败，请稍后重试';
}
exit(json_encode($response, JSON_UNESCAPED_UNICODE));

?>