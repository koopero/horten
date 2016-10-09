module.exports = Mutant

const path = require('./path')
    , simple = path.simple
    , resolve = path.resolve
    , split = path.split
    , blank = path.blank
    , hasKeys = require('./hasKeys')
    , eachKey = require('./eachKey')
    , eachPath = require('./eachPath')
    , isDefined = ( val ) => 'undefined' != typeof val
    , isArray = val => Array.isArray( val )

const _ = require('lodash')

Mutant.isMutant = ( val ) => val instanceof Mutant

function Mutant( initial ) {

  if ( Mutant.isMutant( initial ) )
    initial = initial.get()

  self = Object.create( Mutant.prototype )
  self._initial = initial
  self._value = initial
  return self
}

Mutant.prototype.result = function () {
  const self = this
  var value = this.value
    , isClone = false

  // console.warn('result', self )
  if ( self._subMutants ) {
    const subResults = {}

    eachKey( self._subMutants, function ( sub, key ) {
      // console.warn('sub', sub )

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
      self._value = _.extend( [], self._value, subResults )
    } else {
      self._value = _.extend( {}, self._value, subResults )
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
  var value = _.isArray( self._value ) ? [] : {}
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
    this._value = {}
  }

  if ( !this._subMutants )
    this._subMutants = {}

  return this._subMutants[key] = this._subMutants[key] || new Mutant( this._value[key] )
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
  path = split.apply( null, Array.prototype.slice.call(arguments, 1 ) )

  if ( Mutant.isMutant( value ) )
    value = value.get()

  // console.log( 'Mutant.patch!', value, path, this )

  if ( blank( path ) ) {
    if ( 'undefined' == typeof value )
      return false

    // if ( 'undefined' == typeof self._initial )
    //   self._initial = value


    if ( hasKeys( value ) && hasKeys( this._value ) ) {

      eachKey( value, function ( subVal, key ) {
        const sub = self.subMutant( key )
        sub.patch( subVal )
      } )

    } else if ( this._value != value ) {
      this._value = value
      return true
    }

    return false
  } else if ( simple( path ) ) {

    var key = path[0]

    if ( !this._subMutants && hasKeys( this._value ) ) {
      var currentValue = this._value[ key ]
      if ( value == currentValue )
        return false
    }

    const submutant = this.subMutant( key )
    return submutant.patch( value )
  } else {
    var key = path[0]

    var sub = this.subMutant( key )
    return sub.patch( value, path.slice( 1 ) )
  }

}


Mutant.prototype.set = function ( value, path ) {
  path = split.apply( null, Array.prototype.slice.call(arguments, 1 ) )

  if ( Mutant.isMutant( value ) )
    value = value.get()

  if ( blank( path ) ) {
    if ( this._value != value ) {
      this._value = value
      return true
    }

    return false
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

Mutant.prototype.eachPath = function ( callback, initialPath ) {
  return eachPath( this.get(), callback, initialPath )
}
