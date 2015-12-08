/*
    create-db.sql
    Create jobs database
*/

CREATE DATABASE IF NOT EXISTS IR;
USE IR IF EXISTS;

/*
    create-users.sql
    Create users table
*/

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users`(
  `user_id` varchar(64) NOT NULL,

  /* Must be long enough to support MySQL function, 'PASSWORD'. */
  `user_password` varchar(41) NOT NULL,

  `user_email` varchar(64) NOT NULL,
  `date_created` DATETIME NOT NULL,
  /*`last_login` DATETIME NOT NULL,*/
  /*user_api_key VARCHAR(40) NULL DEFAULT '',*/
  /*user_email VARCHAR(255) NOT NULL,*/

  /* TCP/IPv6 address; stored as 32-byte hexadecimal */
  `user_ip` CHAR(32) NULL,
  /*`user_ip` VARCHAR(15) NULL,*/

  PRIMARY KEY (`user_id`),
  /*UNIQUE KEY `user_name` (`user_id`)*/
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*
    populate-tables.sql
    Synthetic job records for development and testing
*/

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;

INSERT INTO `users`
(`user_id`, `user_password`, `date_created`, `user_ip`) VALUES
    ('admin', PASSWORD('admin'), NOW(), NOW(), HEX(INET6_ATON('127.0.0.1')) );

/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
