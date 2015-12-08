exports.dbc = [
  {
    name: 'default',
    host: process.env.MYSQL_HOST || "localhost",
    user: process.env.MYSQL_USER || "blew",
    password: process.env.MYSQL_PASSWORD || "Invalid password",
    database: process.env.MYSQL_DATABASE || "IR_properties",
    table: "IR_properties",
    multipleStatements: false,
  },
  {
    name: 'err',
    host: 'localhost',
    user: "bflew",
    password: 'pass',
    database: 'IR',
    table: 'IR_properties',
    multipleStatements: false,
  }
];

module.exports = exports.dbc;

// var assert = require('assert');
// var app_utils = require('../lib/users/utils.js');

// exports.DatabaseConfig = function(config) {
//   // This is expected to be either an 'Array' or 'Object' type, or that is --
//   // two or more configuration objects, or a single configuration 'Object'.
//   var configs = null;

//   var num_databases = config.length;
//   console.log('num_databases:', num_databases);

//   for(var idx = 0; idx != num_databases; ++idx) {

//     if(app_utils.array(config) === true) {
//       var cfg = config[idx];

//       var cfg_obj = {
//         name: cfg.name || 'database',
//         host: cfg.host || 'invalid host',
//         user: cfg.user || 'invalid user',
//         password: cfg.password || 'invalid password',
//         database: cfg.database || 'invalid database',
//         table: cfg.table || 'invalid table',

//         // Additional options that are specific to the node-mysql library
//         // interface
//         multipleStatements: cfg.multipleStatements || false,
//       };

//       configs = [];
//       configs.push(cfg_obj);

//     // if(app_utils.enumerate(configs, 0) === true) {
//       this.config_ = configs;
//     // }

//     } else if(app_utils.object(config) === true) {

//       var cfg_obj = {
//         name: cfg.name || 'database',
//         host: cfg.host || 'invalid host',
//         user: cfg.user || 'invalid user',
//         password: cfg.password || 'invalid password',
//         database: cfg.database || 'invalid database',
//         table: cfg.table || 'invalid table',

//         // Additional options that are specific to the node-mysql library
//         // interface
//         multipleStatements: cfg.multipleStatements || false,
//       };

//       configs = {};
//       configs = cfg_obj;

//       // if(app_utils.enumerate(configs, 'cfg_obj') === true) {
//         this.config_ = configs;
//       // }
//     }
//   } // end for loop
// };

// exports.DatabaseConfig.prototype.config = function(index) {
//   var cfg = this.config_;
//   var obj_value = null;

//   // if(app_utils.enumerate(configs, 'cfg_obj') === true) {
//     // obj_value = 'cfg_obj';
//   // } else if(app_utils.enumerate(configs, 0) === true) {
//     // enum_value = 0;
//   // }

//   if(app_utils.enumerate(cfg, 0) === true && index != cfg.length) {
//     return cfg[index];
//   }
// };
