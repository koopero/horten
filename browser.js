`use strict`
require('babel-polyfill')

const H = exports

H.NS = require('./src/namespace')
H.path = require('./src/path')
H.util = {}
H.util.compose = require('./src/compose')
H.util.set = require('./src/set')
H.wrap = H.util.wrap = require('./src/wrap')

H.pairs = require('./src/pairs')
H.set = require('./src/set')
H.unset = require('./src/unset')
H.Echo = require('./src/Echo')
H.Mutant = require('./src/Mutant')
H.Cursor = require('./src/Cursor')
H.Tracer = require('./src/Tracer')
H.root = require('./src/root')

Object.freeze( H )

//
// Add global.
//
global.H = H
