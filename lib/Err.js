/// \brief An enumeration of common error codes and their respective string
/// representations.
exports.ecodes = {

  /// \see https://en.wikipedia.org/wiki/List_of_HTTP_status_codes
  http: {
    // 1xx Informational
    continue: { code: 100, message: 'Continue' },
    processing: { code: 102, message: 'Processing' },

    // 2xx Success
    ok: { code: 200, message: 'OK' },
    created: { code: 201, message: 'Created' },
    accepted: { code: 202, message: 'Accepted' },

    // IMPORTANT(jeff): Special implementation requirements; see article [1]
    // for details!
    // 1. http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html#sec10.2.5
    no_content: { code: 204, message: 'No Content' },
    reset_content: { code: 205, message: 'Reset Content' },

    // 3xx Redirection
    redirect_perm: { code: 301, message: 'Moved permanently' },
    found: { code: 302, message: 'Found' },
    see_other: { code: 303, message: 'See Other' },

    // IMPORTANT(jeff): Special implementation requirements; see article [1]
    // for details!
    // 1. http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html#sec10.3.5
    not_modified: { code: 304, message: 'Not Modified' },
    redirect_temp: { code: 307, message: 'Temporary Redirect' },

    // 4xx Client Error
    invalid_request: { code: 400, message: 'Invalid request' },
    unauthorized: { code: 401, message: 'Unauthorized' },
    forbidden: { code: 403, message: 'Forbidden' },
    not_found: { code: 404, message: 'Not Found', data: 'No results found' },
    invalid_method: { code: 405, message: 'Method Not Allowed' },
    unacceptable: { code: 406, message: 'Not Acceptable' },
    timeout: {
      code: 408,
      message: 'Request Timeout',
      data: 'The server timed out waiting for a response -- ' +
      'please try resending your request at a later time.'
    },
    conflict: { code: 409, message: 'Conflict' },
    gone: {
      code: 410,
      message: 'Gone',
      data: 'The requested resource is no longer available'
    },
    length_required: {
      code: 411,
      message: 'Length Required',
      data: 'The HTTP header, "Content-Length", is required'
    },
    request_overflow: { code: 413, message: 'Request Entity Too Large' },
    uri_overflow: { code: 414, message: 'URI Too Long' },
    unsupported_input: { code: 415, message: 'Unsupported Media Type' },
    auth_timeout: { code: 419, message: 'Authentication Timeout' },
    unproccessable: { code: 422, message: 'Unprocessable Entity' },
    header_overflow: { code: 431, message: 'Request Header Fields Too Large' },
    token_required: { code: 499, message: 'Token required' },

    // 5xx Server Error
    internal: { code: 500, message: 'Internal Server Error' },
    unavailable: { code: 503, message: 'Service Unavailable' },
    no_storage: {  code: 507,  message: 'Insufficient Storage' },
    network_auth: {  code: 511, message: 'Network Authentication Required' },
    unknown: { code: 520, message: 'Unknown Error' },
  },

  /// \see http://xmlrpc-epi.sourceforge.net/specs/rfc.fault_codes.php
  rpc: {
    // -323xx to -325xx Server Error
    transport: { code: -32300, message: 'Transport Error' },
    system: { code: -32400, message: 'System Error' },
    app: { code: -32500, message: 'Application Error' },

    // -326xx Client Error
    invalid_input: { code: -32600, message: 'Non-conforming RPC call' },
    no_method: { code: -32601, message: 'Method not found' },
    invalid_method: { code: -32602, message: 'Invalid method parameters' },
    internal_server: { code: -32603, message: 'Internal RPC error' },

    // -327xx Parse Error
    no_data: { code: -32700, message: 'Invalid data; not well-formed' },
    bad_encoding: { code: -32701, message: 'Unsupported encoding' },
    invalid_encoding: { code: -32702, message: 'Invalid character for encoding' },

    // Misc
    internal: { code: -326021, message: 'Internal Error' },
  },
};

module.exports = exports.ecodes;
