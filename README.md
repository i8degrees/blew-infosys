# Notes

```console
# TODO: Test passing of NULL params on everything

curl -i -X POST -d rpc='{"method":"update_pr","params":{"pid":"P2006121549330062039","jobnum":"","status":"1"}}' http://localhost:3001/../

# NULL check
curl -i -X GET -d rpc='{"method":"list_pr","params":{}}' http://127.0.0.1:3001/../

# List all jobs
curl -i -X POST -d rpc='{"method":"list_pr","params":null}' http://scorpio.local:3000/api/properties/list_pr

# List specific job
curl -i -X POST -d rpc='{"method":"list_pr","params":{"pid":"1"}}' http://scorpio.local:3000/api/properties/list_pr

# NULL check
curl -i -X GET -d rpc='{"method":"list_co","params":{}}' http://127.0.0.1:3001/../

# Dump rows that have *Jeff* in the contact field
curl -i -X GET -d rpc='{"method":"list_co","params":{"cname":"Jeff"}}' http://127.0.0.1:3001/../

# Dump rows that have the number 2006 in the client key
curl -i -X GET -d rpc='{"method":"list_co","params":{"cid":"2006"}}' http://127.0.0.1:3001/../

# List contacts
curl -i -X GET -d rpc='{"method":"list_co","params":{ "cid": 2006, "cname": "Jeff"}}' http://127.0.0.1:3001/../

# List jobs by their status
curl -i -X GET -d rpc='{"method":"list_job_status","params":{"status":"2"}}' http://127.0.0.1:3001/../

# Create a job
curl -i -X POST -d rpc='{"method":"create_job","params":{"jobnum": "15-555", "client": "jeff", "status":"2"}}' http://scorpio.local:3001/../

# Delete a job
curl -i -X POST -d rpc='{"method":"delete_job","params":{"pid": 6}}' http://scorpio.local:3001/../

```

## TODO

- [ ] Consider login through Google Apps..?

- [ ] Evaluate IR_Property::Area SQL data type
- [ ] Rename lib dir to models
- [ ] Ensure that all SQL queries are escaped!!!

- [ ] Remove count object in api.js
  * Confirmed that this is what causes us to need to specify pr_rows.length > 1 to test SQL results, i.e.: properties.jade && why results display is +1 off, i.e.: properties page

- [ ] API documentation; see also: groups in ```lib/rpc.js```

- [ ] Optimize database table fields; start by matching the native DBISAM
table fields with our MySQL field equivilent, i.e.: IR_pr::JobNum should be
thirty (30) digits, not sixteen (16).

- [ ] db/uninstall.sh

- [ ] Import RTWin_co and RTWin_pr BLOBs; i.e.: JobNotes (MEMO field)

## Optimizations

See [DBISam: Optimizations](http://www.elevatesoft.com/manual?action=viewtopic&id=dbisam4&product=rsdelphi&version=XE&topic=Optimizations)

## Unsupported ANSI SQL elements

ALLOCATE CURSOR (Command)
ALLOCATE DESCRIPTOR (Command)
ALTER DOMAIN (Command)
CHECK (Constraint)
CLOSE (Command)
CONNECT (Command)
CONVERT (Function)
CORRESPONDING BY (Expression)
CREATE ASSERTION (Command)
CREATE CHARACTER SET (Command)
CREATE COLLATION (Command)
CREATE DOMAIN (Command)
CREATE SCHEMA (Command)
CREATE TRANSLATION (Command)
CREATE VIEW (Command)
CROSS JOIN (Relational operator)
DEALLOCATE DESCRIPTOR (Command)
DEALLOCATE PREPARE (Command)
DECLARE CURSOR (Command)
DECLARE LOCAL TEMPORARY TABLE (Command)
DESCRIBE (Command)
DISCONNECT (Command)
DROP ASSERTION (Command)
DROP CHARACTER SET (Command)
DROP COLLATION (Command)
DROP DOMAIN (Command)
DROP SCHEMA (Command)
DROP TRANSLATION (Command)
DROP VIEW (Command)
EXECUTE (Command)
EXECUTE IMMEDIATE (Command)
FETCH (Command)
FOREIGN KEY (Constraint)
GET DESCRIPTOR (Command)
GET DIAGNOSTICS (Command)
GRANT (Command)
MATCH (Predicate)
NATURAL (Relational operator)
NULLIF (Expression)
OPEN (Command)
OVERLAPS (Predicate)
PREPARE (Command)
REFERENCES (Constraint)
REVOKE (Command)
SET CATALOG (Command)
SET CONNECTION (Command)
SET CONSTRAINTS MODE (Command)
SET DESCRIPTOR (Command)
SET NAMES (Command)
SET SCHEMA (Command)
SET SESSION AUTHORIZATION (Command)
SET TIME ZONE (Command)
SET TRANSACTION (Command)
TRANSLATE (Function)
USING (Relational operator)

## References

[DBISam: SQL Reference](http://www.elevatesoft.com/manual?action=topics&id=dbisam4&product=rsdelphi&version=XE&section=sql_reference)

[DBISam: Unsupported SQL](http://www.elevatesoft.com/manual?action=viewtopic&id=dbisam4&product=rsdelphi&version=XE&topic=Unsupported_SQL)

## Architecture

  api/contacts
cid (client_id)
cname (Company;LName;FName)

  api/properties
pid (property_id)
cid (client_id)
jobnum

  api/users
uid (user_id)
uname (user_name)

POST http://localhost:3001/api/status
GET http://localhost:3001/api/status
GET http://localhost:3001/api/status/:property_id
PUT http://localhost:3001/api/status/:property_id
DELETE http://localhost:3001/api/status/:property_id

POST http://localhost:3001/api/contacts
GET http://localhost:3001/api/contacts
GET http://localhost:3001/api/contacts/:contact_id
PUT http://localhost:3001/api/contacts/:contact_id
DELETE http://localhost:3001/api/contacts/:contact_id

POST http://localhost:3001/api/properties
GET http://localhost:3001/api/properties
GET http://localhost:3001/api/properties/:property_id
PUT http://localhost:3001/api/properties/:property_id
DELETE http://localhost:3001/api/properties/:property_id

POST http://localhost:3001/api/users
GET http://localhost:3001/api/users
GET http://localhost:3001/api/users/:user_id
PUT http://localhost:3001/api/users/:user_id
DELETE http://localhost:3001/api/users/:user_id

JobStatus (bit fields)
STATUS_ORDERED
STATUS_FIELD
STATUS_DRAFTING
STATUS_NEEDS_REVIEW
STATUS_REVISIONS
STATUS_COMPLETED
