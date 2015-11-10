CREATE DATABASE IF NOT EXISTS IR;
use IR;

DROP TABLE `IR_properties`;
CREATE TABLE IF NOT EXISTS IR_properties(
  PropertyKey       INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  DateCreated       DATETIME NOT NULL,
  DateEdited        DATETIME NOT NULL,
  JobNum            VARCHAR(16) NULL,
  JobDateNeeded     DATE NULL,
  JobStatus         VARCHAR(1) NULL,
  JobContact        VARCHAR(255) NULL,
  JobCity           VARCHAR(255) NULL,
  JobAddress        TEXT NULL,
  JobNotes          TEXT NULL
);
