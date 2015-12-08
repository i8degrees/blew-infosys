var express = require("express");

var assert = require("assert");
var util = require('util');
var utils = require('./users/utils.js');
// var AppError = require('./Err.js');

var LogCategory = [
  'LOG_CATEGORY_APPLICATION',
  'LOG_CATEGORY_DATABASE',
];

var LogPriority = [
  'LOG_PRIORITY_VERBOSE',
  'LOG_PRIORITY_DEBUG',
  'LOG_PRIORITY_INFO',
  'LOG_PRIORITY_WARN',
  'LOG_PRIORITY_ERR',
  'LOG_PRIORITY_CRIT',
];

var Logger = {

  category_: 'BLEW_LOG_CATEGORY_APPLICATION',
  priority_: 'INFO',

  category: function() {
    return(this.category_);
  },

  priority: function() {
    return (this.priority_);
  },

  set_category: function(cat) {
    this.category_ = cat;
  },

  set_priority: function(prio) {
    this.priority_ = prio;
  },

  // TODO(jeff): Finish implementation; enums, priority levels and so on --
  // i.e.: nom::SDL2Logger.
  log_message: function(cat, prio, message) {
    // env = utils.env();
    var argc = arguments.length;
    var category = cat.toUpperCase();
    var priority = prio.toUpperCase();
    var prio_str = priority + ':';

    // FIXME(jeff): Figure out how to implement assertions without causing the
    // ExpressJS err, "TypeError: Cannot read property 'toString' of undefined"
    // assert(argc > 1, "Missing function argument(s)");

    // TODO(jeff): console.assert, console.trace, console.time, console.timeEnd
    switch(priority) {

      case 'TRACE': {
        // console.trace(message);
      } break;

      case 'VERBOSE': {
        console.info(prio_str, message);
      } break;

      case 'DEBUG': {
        console.info(prio_str, message);
      } break;

      default:
      case 'INFO': {
        console.info(prio_str, message);
      } break;

      case 'WARN': {
        console.warn(prio_str, message);
      } break;

      case 'ERR': {
        console.error(prio_str, message);
      } break;

      case 'CRIT': {
        console.error(prio_str, message);
      } break;
    } // end switch

  },

  verbose: function(cat, message) {
    var argc = arguments.length;
    var va_args = '';

    // FIXME(jeff): Figure out how to implement assertions without causing the
    // ExpressJS err, "TypeError: Cannot read property 'toString' of undefined"
    // assert(argc > 1, "Missing function argument(s)");

    // NOTE(jeff): Prepare variable number of arguments as strings for
    // console.log(...)
    if(argc > 1) {
      for(var arg_idx = 1; arg_idx != argc; ++arg_idx) {
        var arg = arguments[arg_idx];

        // Add a space character in between each argument
        va_args += utils.concat(' ', arg);
      }
    }

    this.log_message(cat, 'verbose', va_args);
  },

  debug: function(cat, message) {
    var argc = arguments.length;
    var va_args = '';

    // FIXME(jeff): Figure out how to implement assertions without causing the
    // ExpressJS err, "TypeError: Cannot read property 'toString' of undefined"
    // assert(argc > 1, "Missing function argument(s)");

    // NOTE(jeff): Prepare variable number of arguments as strings for
    // console.log(...)
    if(argc > 1) {
      for(var arg_idx = 1; arg_idx != argc; ++arg_idx) {
        var arg = arguments[arg_idx];

        // Add a space character in between each argument
        va_args += utils.concat(' ', arg);
      }
    }

    this.log_message(cat, 'debug', va_args);
  },

  info: function(cat, message) {
    var argc = arguments.length;
    var va_args = '';

    // FIXME(jeff): Figure out how to implement assertions without causing the
    // ExpressJS err, "TypeError: Cannot read property 'toString' of undefined"
    // assert(argc > 1, "Missing function argument(s)");

    // NOTE(jeff): Prepare variable number of arguments as strings for
    // console.log(...)
    if(argc > 1) {
      for(var arg_idx = 1; arg_idx != argc; ++arg_idx) {
        var arg = arguments[arg_idx];

        // Add a space character in between each argument
        va_args += utils.concat(' ', arg);
      }
    }

    this.log_message(cat, 'info', va_args);
  },

  warn: function(cat, message) {
    var argc = arguments.length;
    var va_args = '';

    // FIXME(jeff): Figure out how to implement assertions without causing the
    // ExpressJS err, "TypeError: Cannot read property 'toString' of undefined"
    // assert(argc > 1, "Missing function argument(s)");

    // NOTE(jeff): Prepare variable number of arguments as strings for
    // console.log(...)
    if(argc > 1) {
      for(var arg_idx = 1; arg_idx != argc; ++arg_idx) {
        var arg = arguments[arg_idx];

        // Add a space character in between each argument
        va_args += utils.concat(' ', arg);
      }
    }

    this.log_message(cat, 'warn', va_args);
  },

  err: function(cat, message) {
    var argc = arguments.length;
    var va_args = '';

    // FIXME(jeff): Figure out how to implement assertions without causing the
    // ExpressJS err, "TypeError: Cannot read property 'toString' of undefined"
    // assert(argc > 1, "Missing function argument(s)");

    // NOTE(jeff): Prepare variable number of arguments as strings for
    // console.log(...)
    if(argc > 1) {
      for(var arg_idx = 1; arg_idx != argc; ++arg_idx) {
        var arg = arguments[arg_idx];

        // Add a space character in between each argument
        va_args += utils.concat(' ', arg);
      }
    }

    this.log_message(cat, 'err', va_args);
  },

  crit: function(cat, message) {
    var argc = arguments.length;
    var va_args = '';

    // FIXME(jeff): Figure out how to implement assertions without causing the
    // ExpressJS err, "TypeError: Cannot read property 'toString' of undefined"
    // assert(argc > 1, "Missing function argument(s)");

    // NOTE(jeff): Prepare variable number of arguments as strings for
    // console.log(...)
    if(argc > 1) {
      for(var arg_idx = 1; arg_idx != argc; ++arg_idx) {
        var arg = arguments[arg_idx];

        // Add a space character in between each argument
        va_args += utils.concat(' ', arg);
      }
    }

    this.log_message(cat, 'crit', va_args);
  },

  trace: function(cat, message) {
    var argc = arguments.length;
    var va_args = '';

    // FIXME(jeff): Figure out how to implement assertions without causing the
    // ExpressJS err, "TypeError: Cannot read property 'toString' of undefined"
    // assert(argc > 1, "Missing function argument(s)");

    // NOTE(jeff): Prepare variable number of arguments as strings for
    // console.log(...)
    if(argc > 1) {
      for(var arg_idx = 1; arg_idx != argc; ++arg_idx) {
        var arg = arguments[arg_idx];

        // Add a space character in between each argument
        va_args += utils.concat(' ', arg);
      }
    }

    this.log_message(cat, 'trace', va_args);
  },
};

module.exports = Logger;
