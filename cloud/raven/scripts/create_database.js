#!/usr/bin/env node --harmony

'use strict';

const
    mysql  = require('mysql'),                   
    config = require('../config'),

    // MySQL connection.
    dbh = mysql.createConnection(config.db.connection);

dbh.connect();

/* 
* USERS 
*/

dbh.query('DROP TABLE IF EXISTS users');
dbh.query('\
CREATE TABLE users (\
    id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT, \
    name VARCHAR(50) NOT NULL, \
    email VARCHAR(100) NOT NULL, \
    password VARCHAR(100) NOT NULL, \
    secret VARCHAR(100) NOT NULL, \
    phone VARCHAR(25), \
    active TINYINT(1) UNSIGNED NOT NULL DEFAULT 1, \
    created_on timestamp DEFAULT CURRENT_TIMESTAMP, \
    updated_on timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \
    PRIMARY KEY (id), \
    UNIQUE INDEX email_unique (email ASC) \
) ENGINE=InnoDB DEFAULT CHARSET=utf8');

/* 
* DEVICE_TYPES
*/

dbh.query('DROP TABLE IF EXISTS DEVICE_TYPES');
dbh.query('\
CREATE TABLE device_types (\
    id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT, \
    name VARCHAR(100) NOT NULL, \
    unit VARCHAR(20), \
    created_on timestamp DEFAULT CURRENT_TIMESTAMP, \
    updated_on timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \
    PRIMARY KEY (id) \
) ENGINE=InnoDB DEFAULT CHARSET=utf8');

/* 
* SYSTEMS
*/

dbh.query('DROP TABLE IF EXISTS systems');
dbh.query('\
CREATE TABLE systems (\
    id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT, \
    name VARCHAR(50) NOT NULL, \
    timezone VARCHAR(100) NOT NULL, \
    armed TINYINT(1) UNSIGNED NOT NULL DEFAULT 0, \
    state TINYINT(1) UNSIGNED NOT NULL DEFAULT 0, \
    created_on timestamp DEFAULT CURRENT_TIMESTAMP, \
    updated_on timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \
    PRIMARY KEY (id) \
) ENGINE=InnoDB DEFAULT CHARSET=utf8');


/*
* SYSTEM USERS
*/

dbh.query('DROP TABLE IF EXISTS system_users');
dbh.query("\
CREATE TABLE system_users (\
    id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT, \
    user_id INT(10) UNSIGNED NOT NULL, \
    system_id INT(10) UNSIGNED NOT NULL, \
    notify_preference ENUM('NONE', 'PHONE', 'EMAIL', 'PUSH') NOT NULL DEFAULT 'PHONE', \
    created_on timestamp DEFAULT CURRENT_TIMESTAMP, \
    updated_on timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \
    PRIMARY KEY (id), \
    KEY user_id_index (user_id), \
    KEY system_id_index (system_id) \
) ENGINE=InnoDB DEFAULT CHARSET=utf8");

/* 
* SYSTEM_DEVICES
*/

dbh.query('DROP TABLE IF EXISTS system_devices');
dbh.query('\
CREATE TABLE system_devices ( \
    id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT, \
    system_id INT(10) UNSIGNED NOT NULL, \
    device_type_id INT(10) UNSIGNED NOT NULL, \
    duid VARCHAR(50) NOT NULL, \
    name VARCHAR(100) NOT NULL, \
    should_trigger TINYINT(1) UNSIGNED DEFAULT 0, \
    trigger_value DECIMAL(10,3), \
    created_on timestamp DEFAULT CURRENT_TIMESTAMP, \
    updated_on timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \
    PRIMARY KEY (id), \
    KEY system_id_index (system_id) \
) ENGINE=InnoDB DEFAULT CHARSET=utf8');

/*
* - duid is a serial number of device
*/

/* 
* METRICS
*/

dbh.query('DROP TABLE IF EXISTS metrics');
dbh.query('\
CREATE TABLE metrics ( \
    id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT, \
    system_id INT(10) UNSIGNED NOT NULL, \
    system_device_id INT(10) UNSIGNED NOT NULL, \
    value DECIMAL(10,3) NOT NULL, \
    created_on timestamp DEFAULT CURRENT_TIMESTAMP, \
    PRIMARY KEY (id), \
    KEY system_devices_index (system_id, system_device_id) \
) ENGINE=MyISAM DEFAULT CHARSET=utf8');

console.log('DONE!')

dbh.end();








