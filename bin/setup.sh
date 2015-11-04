#!/bin/sh
mysql -u root -p -h 127.0.0.1 < tables.sql
mysql -u root -p -h 127.0.0.1 < RTWin_co.sql
mysql -u root -p -h 127.0.0.1 < RTWin_pr.sql
