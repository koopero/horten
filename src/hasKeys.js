'use strict'

module.exports = ( ob ) =>
  ob !== null
  && typeof ob == 'object'
  && !Buffer.isBuffer( ob )
