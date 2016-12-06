'use strict'

/*
  Simple path joiner. No checking of input args.
*/
const SEP = require('./namespace').SEP
module.exports = ( a, b ) => ( a == SEP ? '' : a ) + b + SEP
