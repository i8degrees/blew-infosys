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

  `date_created` DATETIME NOT NULL,
  `date_edited` DATETIME NOT NULL,
  `user_ip` INT(4) UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `user_name` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*
    populate-tables.sql
    Synthetic job records for development and testing
*/

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;

INSERT INTO `users`
(`user_id`, `user_password`, `date_created`, `date_edited`, `user_ip`) VALUES
    ('admin', PASSWORD('admin'), NOW(), NOW(), INET_ATON('127.0.0.1') );

/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
