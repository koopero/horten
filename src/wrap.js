const _ = require('lodash')

const path = require('./path')

module.exports = function wrap( value ) {
  const segs = path.split.apply( null, _.slice( arguments, 1 ) )
  var seg
  while ( seg = segs.pop() ) {
    var tmp = {}
    tmp[seg] = value
    value = tmp
  }
  return value
}
