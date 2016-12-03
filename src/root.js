'use strict'

var Mutant = require('./Mutant')
    , globalKey = '__horten_root'

module.exports = global[globalKey] = global[globalKey] || Mutant()
