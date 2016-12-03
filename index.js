var H = exports

H.NS = require('./src/namespace')
H.path = require('./src/path')
H.compose = require('./src/compose')
H.pairs = require('./src/pairs')
H.set = require('./src/set')
H.wrap = require('./src/wrap')
H.unset = require('./src/unset')
H.Echo = require('./src/Echo')
H.Mutant = require('./src/Mutant')
H.Cursor = require('./src/Cursor')
H.root = require('./src/root')

Object.freeze( H )


//
// Add global.
//

global.H = H
