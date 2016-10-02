module.exports = Mutant

const path = require('./path')
    , simple = path.simple
    , resolve = path.resolve
    , split = path.split
    , blank = path.blank
    , isTree = require('./isTree')

const _ = require('lodash')

function Mutant( initial ) {
  this._initial = initial
  this._value = initial
}

Mutant.prototype.result = function () {
  const self = this
  var value = this.value
  if ( self._subMutants ) {
    const subResults = {}

    _.map( self._subMutants, function ( sub, key ) {
      if ( sub.isDirty() ) {
        if ( self._value == self._initial || !isTree( self._value ) ) {
          self._value = _.extend( {}, self._value, subResults )
        }
      }
      subResults[key] = self._value[key] = sub.result()
    })

  }
  return self._value
}

Mutant.prototype.compose = function () {
  _.map( arguments, function ( arg ) {
    arg = normalize( arg )
    self.merge( arg )
  } )
}

Mutant.prototype.___mutate = function () {
  const self = this
  var value = {}
  _.map( self._value, function ( value, key ) {
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
  if ( !isTree( this._value ) ) {
    this._value = {}
  }

  if ( !this._subMutants )
    this._subMutants = {}

  return this._subMutants[key] = this._subMutants[key] || new Mutant( this._value[key] )
}

Mutant.prototype.patch = function ( value, path ) {
  const self = this
  path = split.apply( null, Array.prototype.slice.call(arguments, 1 ) )

  console.log('Mutant.patch', value, path )

  if ( blank( path ) ) {
    if ( 'undefined' == typeof value )
      return false

    if ( isTree( value ) && isTree( this._value ) ) {
      _.map( value, function ( subVal, key ) {
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
    if ( !this._subMutants && isTree( this._value ) ) {
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

  if ( blank( path ) ) {
    if ( this._value != value ) {
      this._value = value
      return true
    }

    return false
  } else if ( simple( path ) ) {
    var key = path[0]
    if ( !this._subMutants && isTree( this._value ) ) {
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

}
