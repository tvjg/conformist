const {
  Validation: {Success, Failure}
} = require('folktale/data')

const tests = {
  'alpha': (v) => (/^[a-zA-Z]+$/).test(v),
  'alphanumeric': (v) => (/^[a-zA-Z0-9]+$/).test(v),
  'identifier': (v) => (/^[-_a-zA-Z0-9]+$/).test(v),
  'hexadecimal': (v) => (/^[a-fA-F0-9]+$/).test(v),
  'numeric': (v) => (/^[0-9]+$/).test(v),
  'date-time': (v) => !isNaN(Date.parse(v)) && v.indexOf('/') === -1,
  'uppercase': (v) => v === v.toUpperCase(),
  'lowercase': (v) => v === v.toLowerCase(),
  'hostname': (v) => v.length < 256 && (/^([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])(\.([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9]))*$/).test(v),
  'uri': (v) => (/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/).test(v),

  // email, ipv4 and ipv6 adapted from node-validator
  'email': (v) => {
    return (/^(?:[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+\.)*[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+@(?:(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!\.)){0,61}[a-zA-Z0-9]?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!$)){0,61}[a-zA-Z0-9]?)|(?:\[(?:(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\.){3}(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\]))$/).test(v)
  },
  'ipv4': (v) => {
    if ((/^(\d?\d?\d)\.(\d?\d?\d)\.(\d?\d?\d)\.(\d?\d?\d)$/).test(v)) {
      let parts = v.split('.').sort()
      if (parts[3] <= 255) return true
    }
    return false
  },
  'ipv6': (v) => (/^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/).test(v)
}

/* eslint-disable key-spacing */
/* eslint-disable no-multi-spaces */
module.exports = {
  'alpha':         (a) => tests['alpha'](a)        ? Success(a) : Failure([{'format': 'alpha'}]),
  'alphanumeric':  (a) => tests['alphanumeric'](a) ? Success(a) : Failure([{'format': 'alphanumeric'}]),
  'identifier':    (a) => tests['identifier'](a)   ? Success(a) : Failure([{'format': 'identifier'}]),
  'hexadecimal':   (a) => tests['hexadecimal'](a)  ? Success(a) : Failure([{'format': 'hexadecimal'}]),
  'numeric':       (a) => tests['numeric'](a)      ? Success(a) : Failure([{'format': 'numeric'}]),
  'uppercase':     (a) => tests['uppercase'](a)    ? Success(a) : Failure([{'format': 'uppercase'}]),
  'lowercase':     (a) => tests['lowercase'](a)    ? Success(a) : Failure([{'format': 'lowercase'}]),
  'hostname':      (a) => tests['hostname'](a)     ? Success(a) : Failure([{'format': 'hostname'}]),
  'uri':           (a) => tests['uri'](a)          ? Success(a) : Failure([{'format': 'uri'}]),
  'email':         (a) => tests['email'](a)        ? Success(a) : Failure([{'format': 'email'}]),
  'ipv4':          (a) => tests['ip4'](a)          ? Success(a) : Failure([{'format': 'ip4'}]),
  'ipv6':          (a) => tests['ipv6'](a)         ? Success(a) : Failure([{'format': 'ipv6'}])
}
/* eslint-enable key-spacing */
/* eslint-enable no-multi-spaces */
