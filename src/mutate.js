module.exports = mutate
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
    , Mutant = require('./Mutant')
    , assign = Object.assign || require('object-assign')

function mutate( value, path, options ) {
  const self = this
  var result = {}

  result.path = self.path || 'FUUUUUU'
  //
  // Process options
  //
  options = options || {}
  options.hard = !!options.hard
  options.needDelta = true
  options.needKeys = options.needKeys || !!listenerCount( self, 'keys' )
  options.needKeys = true
  //
  // Set state
  //
  // console.trace('mutating', self.path, path, value )
  self[ NS.mutating ] = true

  //
  // Preprocess value
  //
  if ( Mutant.isMutant( value ) )
    value = value.get()

  const currentValue = self[ NS.value ]

  result.wasDefined = self.isDefined()

  if ( !blank( path ) ) {
    goDeeper()
  } else if ( options['unset'] ) {
    setVoid()
  } else if ( hasKeys( value ) ) {
    if ( options.hard || !hasKeys( currentValue ) ) {
      setHard()
    } else {
      setSoft()
    }
  } else if ( options.hard || value !== undefined ){
    setPrimitive()
  }

  if ( isEmpty( result.delta ) ) {
    delete result.delta
  } else {
    result['changed'] = true
  }


  if ( options['needKeys'] ) {
    result['keys'] = self.keys() || 0
    result['keysChanged'] = !compareKeys( result['keysBefore'], result['keys'] )
  }

  result['changed'] = !!result['changed']


  Object.freeze( result )

  self[ NS.mutating ] = false
  // console.log('mutated', result )

  self[ NS.emit ]( result, [] )

  if ( self.parent && !self.parent[ NS.mutating ] ) {
    self.parent[ NS.onSubMutate ]( result, [ self.key ], options )
  }



  return result


  function goDeeper() {
    if ( options.needKeys )
      result.keysBefore = self.keys()

    const key = path[0]
        , sub = self.subMutant( key )

    self[ NS.patchingSub ] = sub
    var subResult = sub[ NS.mutate ]( value, path.slice( 1 ), options )
    self[ NS.patchingSub ] = null

    if ( !isEmpty( subResult.delta ) )
      result.delta = wrap( subResult.delta, key )

    // console.log('deeper', key, subResult)


    if ( subResult.changed ) {
      result.changed = true
      self[ NS.stale ] = true
      self[ NS.void ] = false
    } else if ( subResult.unset ) {
      result.changed = true
      self[ NS.stale ] = true
    }
  }

  function setVoid() {
    // console.log('setVoid', self.path )

    eachKey( self[ NS.subs ], function ( sub, key ) {
      if ( !sub[ NS.void ] ) {
        sub.unset()
        result.unset = true
      }
    })

    if ( !self[ NS.void ] ) {
      self[ NS.void ] = true
      result.changed = true
      result.unset = true
    }
    self[ NS.value ] = undefined
    self[ NS.stale ] = false
  }

  function setPrimitive() {
    // console.log('setPrimitive', value )
    if ( 'undefined' == typeof value ) {
      self[ NS.void ] = true
      result.unset = true
    } else if ( value !== self[ NS.value ] ) {
      self[ NS.value ] = value
      result.delta = value
      self[ NS.void ] = false
    }

    self[ NS.stale ] = false
  }

  function setHard() {
    if ( options.needKeys )
      result.keysBefore = self.keys()

    eachKey( value, function ( subVal, key ) {
      var sub = self.subMutant( key, subVal )
    } )

    eachKey( self[ NS.subs ], function ( sub, key ) {
      var valToSub = value[key]

      self[ NS.patchingSub ] = sub
      var subResult = sub[ NS.mutate ]( valToSub, [], assign( {}, options, { hard: true } ) )
      self[ NS.patchingSub ] = null

      if ( !isEmpty( subResult.delta ) || options['allDelta'] ) {
        result.delta = result.delta || {}
        result.delta[key] = subResult.delta
      }
    } )

    self[ NS.void ] = false

    if ( value !== self[ NS.value ] ) {
      self[ NS.value ] = value
      result.delta = value
    }
  }

  function setSoft() {
    if ( options.needKeys )
      result.keysBefore = self.keys()

    eachKey( value, function ( subVal, key ) {
      var sub = self.subMutant( key, subVal )
      self[ NS.patchingSub ] = sub
      var subResult = sub[ NS.mutate ]( subVal, [], options )
      self[ NS.patchingSub ] = null

      if ( !isEmpty( subResult.delta ) ) {
        result.delta = result.delta || {}
        result.delta[key] = subResult.delta
        self[ NS.stale ] = true
      }

      if ( subResult.changed )
        self[ NS.stale ] = true
    } )

    if ( self[ NS.stale ] )
      self[ NS.void ] = false
  }
}

// true if same
function compareKeys( a, b ) {
  if ( !a && !b ) return true

  a = a || []
  if ( a.length != b.length ) return false

  let spacer = '|'
  return a.join( spacer ) == b.join( spacer )
}

function getKeys( value ) {
  if ( hasKeys( value ) ) {
    let result = eachKey( this[ NS.subs ], ( sub, key ) => sub.isDefined() && key )
    result = result.filter( v => v != false )
    result.sort()
    return result
  } 
}