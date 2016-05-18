# Conformist

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

A mostly functional [sic] JSON schema validator

## Overview

Conformist is an attempt to build a
[JSON schema validator][json-schema-validation] based around
[applicative validation][first-class-failures]. It is something of a
clean rewrite of [jjv][jjv]. It attempts to preserve a similar API
while using a functional programming based approach for the internals.

## Stability

Unstable: Expect patches, additional features, and API changes.

This module is still under conceptual development.

## Example

``` js
var Conformist = require('conformist')

var env = Conformist()
var validate = env.compile({ type: 'string' })

validate(null)
```

## License

MIT

[json-schema-validation]: http://json-schema.org/latest/json-schema-validation.html
[first-class-failures]: http://robotlolita.me/2013/12/08/a-monad-in-practicality-first-class-failures.html
[jjv]: https://github.com/acornejo/jjv
