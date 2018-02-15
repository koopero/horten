'use strict'
module.exports = MutantFactory

const NS = require('./namespace')
    , pathlib = require('./path')
    , simple = pathlib.simple
    , resolve = pathlib.resolve
    , split = pathlib.split
    , slice = pathlib.slice
    , blank = pathlib.blank
    , hasKeys = require('./hasKeys')
    , eachKey = require('./eachKey')
    , eachPath = require('./eachPath')
    , wrap = require('./wrap')
    , EventEmitter = require('events')
    , isDefined = ( val ) => 'undefined' != typeof val
    , isArray = val => {Array.isArray( val )}
    , isEmpty = require('./isEmpty')
    , listenerCount = require('listenercount')

class Mutant extends EventEmitter {
  constructor ( initial ) {
    super()
    const self = this
    this[ NS.isMutant ] = true
    this[ NS.path ] = []
    this[ NS.void ] = true

    if ( arguments.length ) {
      this.set( initial )
    }

    Object.defineProperty( this, 'path', {
      enumerable: true,
      get: () => this[ NS.path ]
    } )

    Object.defineProperty( this, 'key', {
      enumerable: true,
      get: () => this[ NS.key ]
    } )

    Object.defineProperty( this, 'value', {
      enumerable: true,
      get: () => this.get(),
      set: ( v ) => this.set( v )
    } )

  }

  get parent() {
    return this[ NS.parent ]
  }

  get root() {
    this[ NS.root ] = this[ NS.root ] || this
    return this[ NS.root ]
  }
}

function MutantFactory( init )  {
  if ( MutantFactory.isMutant( init ) )
    init = init.get()

  return new Mutant( init )
}

MutantFactory.isMutant = Mutant.isMutant = ( val ) =>
  ( val instanceof Mutant )
  || ( val && val[ NS.isMutant ] )
  || false

Mutant.prototype[ NS.rebuild ] = function () {
  const self = this

  var value = {}

  eachKey( self[ NS.subs ], function ( sub, key ) {
    if ( sub[ NS.void ] )
      return

    value[ key ] = sub.get()
  } )

  self[ NS.value ] = value
  self[ NS.stale ] = false
  self[ NS.void ] = false
}


Mutant.prototype.compose = function () {
  eachKey( arguments, function ( arg ) {
    arg = normalize( arg )
    self.merge( arg )
  } )
}

// Mutant.prototype.isDirty = function () {
//   if ( this[ NS.value ] != this[ NS.initial ] )
//     return true
//
//   if ( this[ NS.subs ] )
//     for ( var key in this[ NS.subs ] ) {
//       if ( this[ NS.subs ][key].isDirty() )
//         return true
//     }
//
//   return false
// }

Mutant.prototype.subMutant = function ( key ) {
  if ( !hasKeys( this[ NS.value ] ) ) {
    // this[ NS.value ] = {}
  }

  if ( !this[ NS.subs ] )
    this[ NS.subs ] = {}

  var sub = this[ NS.subs ][ key ]
  const initial = hasKeys( this[ NS.value ] ) ? this[ NS.value ][key] : undefined

  if ( !( key in this[ NS.subs ] ) ) {
    sub = new Mutant()
    sub[ NS.key ] = key
    sub[ NS.path ] = split( this[ NS.path ], key )
    sub['_path'] = split( this[ NS.path ], key )
    sub[ NS.root ] = this.root
    sub[ NS.parent ] = this
  }


  return this[ NS.subs ][key] = sub
}

Mutant.prototype.get = function () {
  const path = split( arguments )
  if ( blank( path ) ) {
    if ( this[ NS.stale ] )
      this[ NS.rebuild ]()


    return this[NS.value]
  } else {
    const key = path[0]
        , sub = this.subMutant( key )

    return sub.get( path.slice( 1 ) )
  }

}

Mutant.prototype.patch = function ( value, path ) {
  path = slice( arguments, 1 )
  return this[ NS.mutate ]( value, path, { needDelta: true } ).delta
}


Mutant.prototype.merge = function ( value, path ) {
  path = slice( arguments, 1 )
  return this[ NS.mutate ]( value, path, { needDelta: true } ).delta
}

Mutant.prototype.set = function ( value, path ) {
  path = slice( arguments, 1 )
  return this[ NS.mutate ]( value, path, { needDelta: true, hard: true } ).changed
}

Mutant.prototype.map = function ( callback ) {
  callback = callback || function() {}
  const self = this
      , data = this.get()

  if ( hasKeys( data ) ) {
    eachKey( data, function ( value, key ) {
      var sub = self.subMutant( key )
        , result = callback( sub, key )

      if ( isDefined( result ) && result != sub ) {
        sub.set( result )
      }

    })
  }

  return self.get()
}

Mutant.prototype.walk = function () {
  var path = split( arguments )
  if ( blank( path ) ) {
    return this
  } else {
    var key = path[0]
    return this.subMutant( key ).walk( path.slice( 1 ) )
  }
}

Mutant.prototype.isString = function () {
  return typeof this[ NS.value ] == 'string'
}

Mutant.prototype.isDefined = function () {
  return typeof this[ NS.value ] != 'undefined'
}

Mutant.prototype.unset = function () {
  const path = split( arguments )
      , result = this[ NS.mutate ]( null, path, { unset: true } )

  return result['changed']
}


Mutant.prototype.eachPath = function ( callback, initialPath ) {
  const value = this.get()
  return eachPath( value, callback, initialPath )
}

Mutant.prototype.cursor = function() {
  const Cursor = require('./Cursor')
      , cursor = new Cursor()

  cursor.root = this.root
  cursor.path = this.path

  return cursor
}

Mutant.prototype.optimize = function () {
  const self = this
  var empty = true

  if ( hasKeys( self.value ) ) {
    eachKey( self[ NS.subs ], function ( sub, key ) {
      empty = empty && sub.optimize()
    } )
  } else if ( !self[ NS.void ] ){
    empty = false
  }

  if ( empty && !self[ NS.void ] )
    this.unset()

  return empty
}

Mutant.prototype.keys = function () {
  return getKeys( this.get() )
}


Mutant.prototype[ NS.mutate ] = require('./mutate')

Mutant.prototype[ NS.emit ] = function ( result, path ) {
  // console.log('emit', path, result )
  if ( 'changed' in result ) {
    this.emit('change')
    this.emit('value', this.get() )
  }


  if ( result.keysChanged && path.length == 0 ) {
    // console.log('keys 1', this.path, path, result )
    this.emit('keys', result.keys )
  }

  if ( path.length == 1 && ( !result.wasDefined || result.unset ) ) {
    // console.log('keys 2', this.path, path, result )
    
    this.emit('keys', this.keys() )
  }

  if ( !isEmpty( result.delta ) ) {
    if ( hasKeys( result.delta ) )
      Object.freeze( result.delta )
    this.emit('delta', wrap( result.delta, path ) )
  }
}


Mutant.prototype[ NS.onSubMutate ] = function ( result, path ) {

  // console.log('onSubMutate', path )

  if ( result['changed'] || result['unset'] )
    this[ NS.stale ] = true

  this[ NS.emit ]( result, path )

  if ( this.parent ) {
    this.parent[ NS.onSubMutate ]( result, split( this[ NS.key ], path ) )
  }
}


function getKeys( value ) {
  if ( hasKeys( value ) ) {
    let result = Object.keys( value )
    result.sort()
    return result
  } 

  return []
}