'use strict'

module.exports = pairs

const SEP = require('./path').sep
    , pathJoin = require('./pathJoin')
    , hasKeys = require('./hasKeys')
    , eachKey = require('./eachKey')

function pairs ( object ) {
  const result = []
  walk( object, SEP )
  return result

  function walk( ob, path ) {
    if ( !hasKeys( ob ) ) {
      result.push( [ path, ob ] )
    } else {
      for ( var k in ob ) {
        if ( ob.hasOwnProperty( k ) ) {
          walk( ob[k], pathJoin( path, k ) )
        }
      }
    }
  }

}
