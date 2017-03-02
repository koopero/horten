const path = require('./path')

module.exports = function wrap( value ) {
  const segs = path.slice( arguments, 1 )
  for ( var i = segs.length - 1; i >= 0; i -- ) {
    let seg = segs[i]
      , tmp = {}
    tmp[seg] = value
    value = tmp
  }
  return value
}
