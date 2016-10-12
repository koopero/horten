const map = require('lodash.map')
    , hasKeys = require('./hasKeys')

module.exports = function ( subject, callback ) {

  if ( hasKeys( subject ) )
    // This is still cheating. Write it for real.
    return map( subject, callback )
}
