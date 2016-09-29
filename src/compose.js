const path = require('./path')
    , flatten = require('./flatten')

const _ = require('lodash')

module.exports = function compose() {
  const result = {}

  for ( var i = 0; i < arguments.length; i ++ ) {
    var arg = arguments[i]
    _.merge( result, flatten( arg ) )
  }

  return result
}
