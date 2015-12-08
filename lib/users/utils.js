var express = require("express");
var app = express();

var util = require("util");
var assert = require("assert");
var hashlib = require("node_hash");
// var handle = require("../models/db.js");

// TODO(jeff): Move this file to lib/utils.js from lib/users/utils.js

module.exports = {

  env: function() {
    var result = app.get('env');  // NODE_ENV shell variable

    return result;
  },

  // NOTE(jeff): Prepare variable number of arguments as strings for
  // console.log(...)
  // concat: function(separator) {
  //   var argc = arguments.length;
  //   var args = Array.prototype.slice.call(arguments, 0);
  //   return args.join(separator);
  // },

  // NOTE(jeff): Prepare variable number of arguments as strings for
  // console.log(...)
  concat: function(separator) {
    var argc = arguments.length;
    var va_args = '';

    if(argc > 1) {
      var arg = arguments[1];
      va_args += arg + ' ';
    }

    return va_args;
  },

  generate_hash: function(passphrase) {
    var result = '';

    result = hashlib.sha512(passphrase);

    return result;
  },

  decode_hex: function(body) {
    var engine = new Buffer(body);
    var result = engine.toString('utf8');

    return result;
  },

  encode_hex: function(body) {
    var engine = new Buffer(body);
    var result = engine.toString('hex');

    return result;
  },

  decode_base64: function(body) {
    var engine = new Buffer(body);
    var result = engine.toString('utf8');

    return result;
  },

  encode_base64: function(body) {
    var engine = new Buffer(body);
    var result = engine.toString('base64');

    return result;
  },

  generate_api_key: function(length) {

    var key_length = 0;

    if(arguments.length < 1) {
      // API key length default when not specified
      key_length = 10;
    } else {
      key_length = length;
    }

    var ticks = process.hrtime();
    var nticks = ticks[1]; // a tuple of two values: seconds, nanoseconds
    var nticks_str = String(nticks);

    var hash = hashlib.sha1(nticks_str);
    var hash_encoding = new Buffer(hash);

    var result = hash_encoding.toString('base64');
    result = result.slice(0,key_length);
    result = result.trim();
    return result;
  },

  /// \returns A String value containing the object type of the argument.
  type: function(value) {
    return(typeof value);
  },

  defined: function(value) {
    return(util.isUndefined(value) === false);
  },

  null: function(value) {
    return(util.isNull(value) === true);
  },

  null_or_undefined: function(value) {
    return(util.isNullOrUndefined(value) === true);
  },

  string: function(value) {
    return(util.isString(value));
  },

  number: function(value) {
    return(util.isNumber(value));
  },

  boolean: function(value) {
    return(util.isBoolean(value));
  },

  array: function(value) {
    return(util.isArray(value) === true);
  },

  object: function(value) {
    return(util.isObject(value) === true);
  },

  function: function(fn) {
    return(util.isFunction(fn) === true);
  },

  map: function(value) {
    return((this.type(value) === 'Map') === true);
  },

  weak_map: function(value) {
    return((this.type(value) === 'WeakMap') === true);
  },

  set: function(value) {
    return((this.type(value) === 'Set') === true);
  },

  has: function(object, key) {
    var type = (this.null_or_undefined(object) === false &&
                this.string(key) === true);
    var result = false;

    // assert(type === true);
    if(type === false) {
      return result;
    }

    if(this.object(object) === true) {
      result = object.hasOwnProperty(key);
    } else if(this.map(object) === true) {
      result = object.has(key);
    } else if(this.set(object) === true) {
      result = object.has(key);
    }

    return(result);
  },

  enumerate: function(object, value) {
    var null_type =
      this.null(object) === true || this.object(object) === false;
    var result = false;

    if(null_type === false) {
      result = object.propertyIsEnumerable(value);
    }

    return result;
  },

  seconds: function(ms) {
    var milliseconds = Number(ms);
    var seconds = milliseconds * 1000;

    return seconds;
  },
};
