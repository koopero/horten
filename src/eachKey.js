'use strict'

const hasKeys = require('./hasKeys')

module.exports = function ( subject, callback ) {

  if ( hasKeys( subject ) ) {
    let keys = Object.keys( subject )
    let result = []
    for ( let key of keys ) {
      result.push( callback( subject[key], key ) )
    }
    return result
  }

}
