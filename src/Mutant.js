'use strict'
module.exports = MutantFactory

const pathlib = require('./path')
    , simple = pathlib.simple
    , resolve = pathlib.resolve
    , split = pathlib.split
    , slice = pathlib.slice
    , blank = pathlib.blank
    , hasKeys = require('./hasKeys')
    , eachKey = require('./eachKey')
    , eachPath = require('./eachPath')
    , wrap = require('./wrap')
    , isDefined = ( val ) => 'undefined' != typeof val
    , isArray = val => Array.isArray( val )
    , EventEmitter = require('events')

const EMIT = Symbol('EMIT')
    , SUB_DELTA = Symbol('SUB_DELTA')
    , _patchingSub = Symbol()

class Mutant extends EventEmitter {
  constructor ( initial ) {
    super()
    const self = this
    this._initial = initial
    this._value = initial
  }

  get path() {
    if ( !this._path ) {
      this._path = []
    }
    return this._path
  }

  get parent() {
    return this._parent
  }

  get root() {
    return this._root = this._root || this
  }

  get key() {
    return pathlib.last( this._path )
  }
}

function MutantFactory( init )  {
  if ( MutantFactory.isMutant( init ) )
    init = init.get()

  return new Mutant( init )
}

MutantFactory.isMutant = Mutant.isMutant = ( val ) => val instanceof Mutant


Mutant.prototype.result = function () {
  const self = this
      , subResults = {}

  var value = this.value
    , isClone = false

  if ( self._subMutants ) {

    eachKey( self._subMutants, function ( sub, key ) {
      if ( !sub.isDirty() )
        return

      const subResult = sub.result()
      if ( 'undefined' != typeof subResult ) {

        if ( !isClone || !hasKeys( self._value ) ) {
          copy()
        }

        subResults[key] = self._value[key] = subResult
      } else if ( sub._deleted ) {

        delete subResults[key]
        if ( hasKeys( self._value ) && !isClone ) {
          copy()
          delete self._value[key]
        }
      }
    })
  }

  return self._value

  function copy() {

    if ( isArray( self._value ) ) {
      self._value = Object.assign( [], self._value, subResults )
    } else if ( hasKeys( self._value ) ) {
      self._value = Object.assign( {}, self._value, subResults )
    } else {
      self._value = {}
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

Mutant.prototype.___mutate = function () {
  const self = this
  var value = Array.isArray( self._value ) ? [] : {}
  eachKey( self._value, function ( value, key ) {
    self._subMutants[ key ] = self._subMutants[ key ] || new Mutant( value )
    value[ key ] = value
  })

  this._value = value
}

Mutant.prototype.isDirty = function () {
  if ( this._value != this._initial )
    return true

  if ( this._subMutants )
    for ( var key in this._subMutants ) {
      if ( this._subMutants[key].isDirty() )
        return true
    }

  return false
}

Mutant.prototype.subMutant = function ( key ) {
  if ( !hasKeys( this._value ) ) {
    // this._value = {}
  }

  if ( !this._subMutants )
    this._subMutants = {}

  var sub = this._subMutants[key]

  if ( !sub ) {
    sub = new Mutant( hasKeys( this._value ) ? this._value[key] : undefined )
    sub._path = split( this.path, key )
    sub._root = this.root
    sub._parent = this
  }

  return this._subMutants[key] = sub
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
  const self = this
  path = slice( arguments, 1 )

  if ( Mutant.isMutant( value ) )
    value = value.get()
  else
    Object.freeze( value )

  var delta

  if ( blank( path ) ) {
    if ( 'undefined' == typeof value )
      return

    if ( hasKeys( value ) && hasKeys( this._value ) ) {

      eachKey( value, function ( subVal, key ) {

        const sub = self.subMutant( key )
        self[ _patchingSub ] = sub
        const subDelta = sub.patch( subVal )
        self[ _patchingSub ] = null

        if ( subDelta === undefined )
          return

        delta = delta || {}
        delta[key] = subDelta
      } )

      if ( delta ) {
        this[ EMIT ].delta.call( self, delta )
        return delta
      }

    } else if ( this._value != value ) {
      this._value = value
      this[ EMIT ].delta.call( self, value )
      return value
    }

    return
  } else {
    var key = path[0]

    var sub = this.subMutant( key )
    self[ _patchingSub ] = sub
    delta = sub.patch( value, path.slice( 1 ) )
    self[ _patchingSub ] = null
    

    if ( delta === undefined )
      return

    delta = wrap( delta, key )

    this[ EMIT ].delta.call( self, delta )
    return delta
  }

}


Mutant.prototype.set = function ( value, path ) {
  const self = this
  path = split.apply( null, Array.prototype.slice.call(arguments, 1 ) )

  if ( Mutant.isMutant( value ) )
    value = value.get()

  if ( blank( path ) ) {
    if ( this._value != value ) {
      this._value = value
      this[ EMIT ].delta.call( self, value )
      return value
    }

    return
  } else if ( simple( path ) ) {
    var key = path[0]
    if ( !this._subMutants && hasKeys( this._value ) ) {
      var currentValue = this._value[ key ]
      if ( value == currentValue )
        return false
    }

    const submutant = this.subMutant( key )
    return submutant.set( value )
  } else {
    var key = path[0]

    var sub = this.subMutant( key )
    return sub.set( value, path.slice( 1 ) )
  }

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
  return typeof this._value == 'string'
}

Mutant.prototype.isDefined = function () {
  return typeof this._value != 'undefined'
}

Mutant.prototype.del = function () {
  const path = split( arguments )
  if ( blank( path ) ) {
    if ( this.isDefined() || !this._deleted ) {
      this._value = undefined
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

Mutant.prototype[ SUB_DELTA ] = function ( delta, key ) {
  if ( !this[ _patchingSub ] )
    this[ EMIT ].delta.call( this, wrap( delta, key ) )

  if ( this._parent )
    this._parent[ SUB_DELTA ]( delta, this.key )
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


Mutant.prototype[ EMIT ] = {}
Mutant.prototype[ EMIT ].delta = function ( delta ) {

  this.emit('delta', delta )
  this.emit('change')

  if ( this.listenerCount( 'value' ) )
    this.emit( 'value', this.get() )

  if ( this._parent )
    this._parent[ SUB_DELTA ]( delta, this.key )
}
