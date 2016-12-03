'use strict'

/*
  Simple path joiner. No checking of input args.
*/
var SEP = require('./path').sep
module.exports = ( a, b ) => ( a == SEP ? '' : a ) + b + SEP
