CREATE DATABASE RealTimeBusQuery;  /* 建库 */
USE RealTimeBusQuery;

GRANT SELECT, INSERT, UPDATE, DELETE
    ON RealTimeBusQuery.*
    TO bus;

CREATE TABLE org(  /* 机构 */
    name VARCHAR(20),
    id VARCHAR(20),
    pwd VARCHAR(128),
    intro VARCHAR(50)
);
ALTER TABLE org
    ADD PRIMARY KEY(id);
ALTER TABLE org
    MODIFY name VARCHAR(20) NOT NULL;
ALTER TABLE org
    MODIFY pwd VARCHAR(128) NOT NULL;

CREATE TABLE route(  /* 路线 */
    name VARCHAR(20),
    id VARCHAR(20),
    org VARCHAR(20),
    intro VARCHAR(50)
);
ALTER TABLE route
    ADD PRIMARY KEY(id, org);
ALTER TABLE route
    ADD FOREIGN KEY(org) REFERENCES org(id);
ALTER TABLE route
    MODIFY name VARCHAR(20) NOT NULL;

-- DROP TRIGGER autoDelIdentificationAndDevice;
delimiter |
CREATE TRIGGER autoDelIdentificationAndDevice BEFORE DELETE ON route   /* 路线级联删除触发器 */
    FOR EACH ROW
    BEGIN
        DELETE FROM identification WHERE route = OLD.id;
        DELETE FROM device WHERE route = OLD.id;
    END;
|
delimiter ;

-- DROP TABLE identification;
CREATE TABLE identification(  /* 标识点 */
    name VARCHAR(20),
    id VARCHAR(20),
    route VARCHAR(20),
    lng DOUBLE,  /* 经度 */
    lat DOUBLE,  /* 纬度 */
    intro VARCHAR(50),
    PRIMARY KEY(id, route),
    FOREIGN KEY(route) 
        REFERENCES route(id) 
        ON UPDATE CASCADE   /* 级联更新 */
);
ALTER TABLE identification
    MODIFY name VARCHAR(20) NOT NULL;
-- alter table identification add lng double after route;
-- alter table identification add lat double after lng;

-- DROP TABLE device;
CREATE TABLE device(  /*设备*/
    name VARCHAR(20) NOT NULL,
    id VARCHAR(20) NOT NULL,
    status BIT NOT NULL,
    route VARCHAR(20),
    lng DOUBLE,  /* 经度 */
    lat DOUBLE,  /* 纬度 */
    intro VARCHAR(50),
    PRIMARY KEY(id, route),  /* MySQL不支持直接在列名后声明主键和外键 */
    FOREIGN KEY(route) 
        REFERENCES route(id)
        ON UPDATE CASCADE
);

CREATE TABLE user(  /* 用户 */
    name VARCHAR(20),
    id VARCHAR(20),
    pwd VARCHAR(128),
    route VARCHAR(100),
    intro VARCHAR(50),
    PRIMARY KEY(id)
);
ALTER TABLE user
    MODIFY name VARCHAR(20) NOT NULL;
ALTER TABLE user
    MODIFY pwd VARCHAR(128) NOT NULL;

INSERT INTO org(name, id, pwd)  /* 插入测试数据 */
    VALUES("岭师", "000", "password");
INSERT INTO route(name, id, org)
    VALUES("校车", "111", "000");
INSERT INTO device(name, id, route, status, lng, lat)
    VALUES("校车1", "222", "111", 0, 0, 0);
INSERT INTO device(name, id, route, status, lng, lat)
    VALUES("1路", "cccar1", "ccbus", 1, 111.800219, 22.159332);
INSERT INTO identification(name, id, route)
    VALUES("东大门", "333", "111");
INSERT INTO identification(name, id, route, lng, lat)
    VALUES("交警大队", "jjdd", "ccbus", 111.80348, 22.181723);
INSERT INTO identification(name, id, route, lng, lat)
    VALUES("一中", "yz", "ccbus", 111.80156, 22.145386);
INSERT INTO user(name, id, pwd)
    VALUES("哈哈哈", "444", "password");
UPDATE route 
    SET id='ycbus', name='春城公交', org='cc', intro='春城' 
    WHERE id='ccbus';
UPDATE route 
    SET id='ccbus', name='春城公交', org='cc', intro='春城' 
    WHERE id='ycbus';