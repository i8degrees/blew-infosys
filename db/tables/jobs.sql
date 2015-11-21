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
    ENUM('fieldwork', 'drafting', 'review', 'completed') NULL
  JobContact        VARCHAR(128) NULL,
  JobAddress        TEXT(255) NULL,
  JobNotes          TEXT(255) NULL,
  JobAttachments    LONGBLOB,
  PRIMARY KEY(`PropertyKey`),
  FULLTEXT KEY `search_index` (`JobNum`,`JobContact`,`JobNotes`, `JobAddress`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*
    populate-tables.sql
    Synthetic job records for testing API and such
*/

INSERT INTO IR_properties(PropertyKey, DateCreated, DateEdited, JobNum, JobDateNeeded, JobStatus, JobContact, JobAddress, JobNotes, JobAttachments)
VALUES(1, '2010-10-10 00:00:00', '2010-10-10 00:00:00', '01-08', '2010-10-10', 4, 'kt', NULL, 'yeah buddy!', NULL);

INSERT INTO IR_properties(PropertyKey, DateCreated, DateEdited, JobNum, JobDateNeeded, JobStatus, JobContact, JobAddress, JobNotes, JobAttachments)
VALUES(2, '2015-02-15 00:00:00', '2015-02-15 00:00:00', '15-041', '2015-12-31', 1, 'beker', NULL, 'lot survey, $600', NULL);

INSERT INTO IR_properties(PropertyKey, DateCreated, DateEdited, JobNum, JobDateNeeded, JobStatus, JobContact, JobAddress, JobNotes, JobAttachments)
VALUES(3, '2015-12-01 00:00:00', '2015-12-01 00:00:00', '15-1211', '2015-11-01', 2, 'I Square, LLC.', NULL, 'ALTA', NULL);

LOCK TABLES `IR_properties` WRITE;
/*!40000 ALTER TABLE `IR_properties` DISABLE KEYS */;

INSERT INTO `IR_properties` (`PropertyKey`, `DateCreated`, `DateEdited`, `JobNum`, `JobDateNeeded`, `JobStatus`, `JobContact`, `JobAddress`, `JobNotes`, `JobAttachments`)
VALUES(4,'2010-10-10 00:00:00','2010-10-10 00:00:00','01-08','2010-10-10','0','kt',NULL,NULL,'yeah buddy!',NULL),
VALUES(5,'2015-02-15 00:00:00','2015-02-15 00:00:00','07-048','2015-12-31','1','carp',NULL,NULL,'$$$',NULL),
VALUES(6,'2015-12-01 00:00:00','2015-11-15 18:31:21','15-1211','2015-11-01','3','I Square, LLC.',NULL,'ALTA ',NULL),
VALUES(7,'2010-10-10 00:00:00','2010-10-10 00:00:00','01-09','2010-10-10','1','boobies',NULL,NULL,'yeah buddy!',NULL),
VALUES(8,'2015-02-15 00:00:00','2015-02-15 00:00:00','07-047','2015-12-31','4','carp',HWY 112','$$$',NULL)

/*!40000 ALTER TABLE `IR_properties` ENABLE KEYS */;
UNLOCK TABLES;
