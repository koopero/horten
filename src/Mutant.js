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
    , isDefined = ( val ) =>{ 'undefined' != typeof val}
    , isArray = val => {Array.isArray( val )}

const EMIT = Symbol('EMIT')
    , _patchingSub = Symbol()

class Mutant extends EventEmitter {
  constructor ( initial ) {
    super()
    this[ NS.isMutant ] = true
    const self = this
    this[ NS.initial ] = initial
    this[ NS.value ] = initial
    // console.log('new', this[ NS.value ] )
  }

  get path() {
    if ( !this[ NS.path ] ) {
      this[ NS.path ] = []
    }
    return this[ NS.path ]
  }

  get key() {
    return this[ NS.key ]
  }

  get parent() {
    return this[ NS.parent ]
  }

  get root() {
    return this[ NS.root ] = this[ NS.root ] || this
  }

  get key() {
    return pathlib.last( this[ NS.path ] )
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


Mutant.prototype.result = function () {
  const self = this
      , subResults = {}

  var value = this.value
    , isClone = false

  if ( self[ NS.subs ] ) {

    eachKey( self[ NS.subs ], function ( sub, key ) {
      if ( !sub.isDirty() )
        return

      const subResult = sub.result()
      if ( 'undefined' != typeof subResult ) {

        if ( !isClone || !hasKeys( self[ NS.value ] ) ) {
          copy()
        }

        subResults[key] = self[ NS.value ][key] = subResult
      } else if ( sub._deleted ) {

        delete subResults[key]
        if ( hasKeys( self[ NS.value ] ) && !isClone ) {
          copy()
          delete self[ NS.value ][key]
        }
      }
    })
  }

  return self[ NS.value ]

  function copy() {

    if ( isArray( self[ NS.value ] ) ) {
      self[ NS.value ] = Object.assign( [], self[ NS.value ], subResults )
    } else if ( hasKeys( self[ NS.value ] ) ) {
      self[ NS.value ] = Object.assign( {}, self[ NS.value ], subResults )
    } else {
      self[ NS.value ] = {}
    }

    isClone = true
  }
}

Mutant.prototype.compose = function () {
  eachKey( arguments, function ( arg ) {
    arg = normalize( arg )
    self.merge( arg )
  } )
}

Mutant.prototype.isDirty = function () {
  if ( this[ NS.value ] != this[ NS.initial ] )
    return true

  if ( this[ NS.subs ] )
    for ( var key in this[ NS.subs ] ) {
      if ( this[ NS.subs ][key].isDirty() )
        return true
    }

  return false
}

Mutant.prototype.subMutant = function ( key ) {
  if ( !hasKeys( this[ NS.value ] ) ) {
    // this[ NS.value ] = {}
  }

  if ( !this[ NS.subs ] )
    this[ NS.subs ] = {}

  var sub = this[ NS.subs ][key]

  if ( !sub ) {
    sub = new Mutant( hasKeys( this[ NS.value ] ) ? this[ NS.value ][key] : undefined )
    sub[ NS.key ] = key
    sub[ NS.path ] = split( this.path, key )
    sub[ NS.root ] = this.root
    sub[ NS.parent ] = this
  }

  return this[ NS.subs ][key] = sub
}

Mutant.prototype.get = function () {
  const path = split( arguments )
  if ( blank( path ) ) {
    return this.result()
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
  return this[ NS.mutate ]( value, path, { needDelta: true } ).changed
}

Mutant.prototype.map = function ( callback ) {
  callback = callback || function() {}
  const self = this
      , data = this.get()
  if ( hasKeys( data ) ) {
    eachKey( data, function ( value, key ) {
      var sub = self.subMutant( key )
        , result = callback( sub, key )

      if ( isDefined( result ) && result != sub )
        sub.patch( result )
    })
  }

  return self.result()
}

Mutant.prototype.walk = function () {
  const path = split( arguments )
  if ( blank( path ) ) {
    return this
  } else {
    const key = path[0]
    return this.subMutant( key ).walk( path.slice( 1 ) )
  }
}

Mutant.prototype.isString = function () {
  return typeof this[ NS.value ] == 'string'
}

Mutant.prototype.isDefined = function () {
  return typeof this[ NS.value ] != 'undefined'
}

Mutant.prototype.del = function () {
  const path = split( arguments )
  if ( blank( path ) ) {
    if ( this.isDefined() || !this._deleted ) {
      this[ NS.value ] = undefined
      this._deleted = true
      return true
    } else {
      return false
    }
  } else {
    const key = path[0]
        , sub = this.subMutant( key )
    return sub.del( path.slice( 1 ) )
  }
}


Mutant.prototype.eachPath = function ( callback, initialPath ) {
  return eachPath( this.get(), callback, initialPath )
}

Mutant.prototype.cursor = function() {
  const Cursor = require('./Cursor')
      , cursor = Cursor()

  cursor.root = this.root
  cursor.path = this.path

  return cursor
}


Mutant.prototype[ NS.mutate ] = function ( value, path, options ) {
  const self = this
      , result = {}

  //
  // Process options
  //
  options = options || {}
  options.needDelta = options.needDelta || !!self.listenerCount( 'delta')
  options.needKeys = options.needKeys || !!self.listenerCount( 'keys')

  //
  // Set state
  //
  self[ NS.mutating ] = true

  //
  // Preprocess value
  //
  if ( Mutant.isMutant( value ) )
    value = value.get()
  else
    Object.freeze( value )

  if ( blank( path ) ) {

    if ( 'undefined' == typeof value ) {

    } else if ( hasKeys( value ) && hasKeys( this[ NS.value ] ) ) {

      eachKey( value, function ( subVal, key ) {

        const sub = self.subMutant( key )
        self[ _patchingSub ] = sub
        const subDelta = sub.patch( subVal )
        self[ _patchingSub ] = null

        if ( subDelta === undefined )
          return

        result.delta = result.delta || {}
        result.delta[key] = subDelta
      } )

    } else if ( this[ NS.value ] != value ) {
      this[ NS.value ] = value
      result.delta = value
    }

  } else {
    var key = path[0]

    var sub = this.subMutant( key )
    self[ _patchingSub ] = sub
    result.delta = sub.patch( value, path.slice( 1 ) )
    self[ _patchingSub ] = null


    if ( result.delta !== undefined )
      result.delta = wrap( result.delta, key )
  }


  //
  // Dispatch results
  //

  result.changed = result.changed || !!result.delta

  Object.freeze( result )

  self[ NS.emit ]( result, [] )

  if ( self.parent && !self.parent[ NS.mutating ] ) {
    self.parent[ NS.onSubMutate ]( result, [ self.key ] )
  }

  // console.log('mutate', self.path, value, result )

  self[ NS.mutating ] = false

  return result

}

Mutant.prototype[ NS.emit ] = function ( result, path ) {
  // console.log('EMIT', result )
  if ( 'changed' in result ) {
    this.emit('change')
    this.emit( 'value', this.get() )
  }

  if ( 'delta' in result ) {
    Object.freeze( result.delta )
    this.emit('delta', wrap( result.delta, path ) )
  }
}


Mutant.prototype[ NS.onSubMutate ] = function ( result, path ) {
  this[ NS.emit ]( result, path )

  if ( this.parent ) {
    this.parent[ NS.onSubMutate ]( result, split( this.key, path ) )
  }
}
