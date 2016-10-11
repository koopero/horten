/*
  Simple path joiner. No checking of input args.
*/
const SEP = require('./path').sep
module.exports = ( a, b ) => ( a == SEP ? '' : a ) + b + SEP
