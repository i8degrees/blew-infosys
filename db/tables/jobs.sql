/*
    create-db.sql
    Create jobs database && tables
*/

CREATE DATABASE IF NOT EXISTS IR;
USE IR IF EXISTS;

DROP TABLE IF EXISTS `IR_properties`;
CREATE TABLE IF NOT EXISTS IR_properties(
  PropertyKey       INT(11) NOT NULL AUTO_INCREMENT,
  DateCreated       DATETIME NOT NULL,
  DateEdited        DATETIME NOT NULL,
  JobNum            VARCHAR(16) NULL,
  JobDateNeeded     DATE NULL,
  JobStatus
    ENUM('not assigned', 'fieldwork', 'drafting', 'review', 'completed')
    NOT NULL,
  JobContact        VARCHAR(128) NULL,
  JobAddress        TEXT(255) NULL,
  JobNotes          TEXT(255) NULL,
  JobAttachments    LONGBLOB,
  PRIMARY KEY(`PropertyKey`),
  FULLTEXT KEY `search_index` (`JobNum`,`JobContact`,`JobNotes`, `JobAddress`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users`(
  `user_id` varchar(64) NOT NULL,

  /* Must be long enough to support MySQL function, 'PASSWORD'. */
  `user_password` varchar(41) NOT NULL,

  `date_created` DATETIME NOT NULL,
  `date_edited` DATETIME NOT NULL,
  `user_ip` varchar(15) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `user_name` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*
    populate-tables.sql
    Synthetic job records for testing API and such
*/

LOCK TABLES `IR_properties` WRITE;
/*!40000 ALTER TABLE `IR_properties` DISABLE KEYS */;

INSERT INTO `IR_properties` (`PropertyKey`, `DateCreated`, `DateEdited`, `JobNum`, `JobDateNeeded`, `JobStatus`, `JobContact`, `JobAddress`, `JobNotes`, `JobAttachments`)
VALUES
    (1,'2010-10-10 00:00:00','2010-10-10 00:00:00','01-08','2010-10-10','review','kt',NULL,'yeah buddy!',NULL),
    (2,'2015-02-15 00:00:00','2015-02-15 00:00:00','15-041','2015-12-31','not assigned','beker',NULL,'lot survey, $600',NULL),
    (9,'2015-02-15 00:00:00','2015-02-15 00:00:00','15-042','2015-12-31','not assigned','jamie',NULL,'lot survey, $600',NULL),
    (3,'2015-12-01 00:00:00','2015-12-01 00:00:00','15-1212','2015-11-01','fieldwork','I Square, LLC.',NULL,'ALTA',NULL),
    (4,'2015-11-16 15:31:14','2015-11-16 15:31:14','66-603','2015-01-01','completed','devilman','524 W SYCAMORE ST','sheeeeeeeeeit',NULL),
    (5,'2015-11-16 15:35:15','2015-11-16 15:35:15','153332','2015-10-10','drafting','bitchboyqq','','',NULL),
    (6,'2015-12-01 00:00:00','2015-12-01 00:00:00','15-1214','2015-11-01','fieldwork','I Square, LLC.',NULL,'ALTA',NULL),
    (7,'2015-11-16 15:31:14','2015-11-16 15:31:14','66-603','2015-01-01','review','devilman','524 W SYCAMORE ST','sheeeeeeeeeit',NULL),
    (8,'2015-11-16 15:35:15','2015-11-16 15:35:15','153334','2015-10-10','completed','bitchboyqq','','',NULL);

/*!40000 ALTER TABLE `IR_properties` ENABLE KEYS */;
UNLOCK TABLES;
