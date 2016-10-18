'use strict'

const SENDER = Symbol('SENDER')
    , LISTENER = Symbol('LISTENER')
    , LISTENER_BOUND = Symbol('LISTENER_BOUND')
    , IMMEDIATE = Symbol('IMMEDIATE')
    , TIMEOUT = Symbol('TIMEOUT')

const _root = Symbol('_root')
    , _echo = Symbol('_echo')
    , _path = Symbol('_path')
    , _delay = Symbol('_delay')
    , _delayTime = Symbol('_delayTime')
    , _delta = Symbol('_delta')
    , _mutant = Symbol('_mutant')
    , _listening = Symbol('_listening')
    , _listenNames = ['delta']
    , _listenKeys = {}


_listenNames.forEach( ( name ) => _listenKeys[name] = Symbol( name ) )

const EventEmitter = require('events')
    , assert = require('assert')

const split = require('./path').split
    , slice = require('./path').slice
    , wrap = require('./wrap')
    , eachKey = require('./eachKey')
    , Mutant = require('./Mutant')
    , Echo = require('./Echo')
    , isEmpty = require('./isEmpty')

class Cursor extends EventEmitter {
  constructor () {
    super()
    const self = this

    self[_delta] = new Mutant()
    self[_echo] = new Echo()

    self[LISTENER_BOUND] = {}
    eachKey( self[LISTENER], ( listener, name ) =>
      self[LISTENER_BOUND][name] = listener.bind( self )
    )

    //
    // These will be populated by returns
    // of setImmediate() and setTimeout,
    // respectively.
    //
    self[IMMEDIATE] = {}
    self[TIMEOUT] = {}


    self.delay = 0
  }

  set listening ( value ) {
    const self = this
    value = !!value

    const current = self[_listening]
        , mutant = self[_mutant]

    if ( mutant && value && !current ) {
      eachKey( self[LISTENER_BOUND], ( listener, name ) => {
        mutant.on( name, listener )
      })
    }

    if ( mutant && !value && current ) {
      eachKey( self[LISTENER_BOUND], ( listener, name ) => {
        mutant.off( name, listener )
      })
    }

    self[_listening] = value
  }

  get listening () {
    return this[_listening]
  }

  set mutant( newMutant ) {
    var mutant = this[_mutant]

    if ( !Mutant.isMutant( newMutant ) )
      newMutant = null

    if ( newMutant != mutant ) {
      var wasListening = this.listening
      this.listening = false
      this[_mutant] = newMutant
      this.listening = wasListening
    }

  }

  get mutant() {
    if ( !this[_mutant] ) {
      this.mutant = this.root
    }
    return this[_mutant]
  }

  set path( value ) {
    value = split( value )
    this.mutant = this.root.walk( value )
    this[_path] = value
  }

  get path() {
    return this[_path]
  }

  set root( value ) {
    this[_root] = value
  }

  get root() {
    if ( !this[_root] ) {
      this[_root] = require('./root')
    }
    return this[_root]
  }

  set value( value ) {
    if ( this[_echo] )
      this[_echo].send( value )

    this.mutant.set( value )
  }

  get value() {
    return this.mutant.get()
  }

  set delay( value ) {
    this[_delayTime] = Math.max( -1, parseInt( value ) || 0 )
  }

  get delay() {
    return this[_delayTime]
  }

  //
  //
  //
  patch( value ) {
    const path = slice( arguments, 1 )
        , mutant = this.mutant

    if ( this[ _echo ] )
      this[ _echo ].send( wrap( value, path ) )
      
    return mutant.patch.apply( mutant, arguments )
  }

  get( path ) {
    const mutant = this.mutant
    return mutant.get.apply( mutant, arguments )
  }

}

//
// Master delay function
//

Cursor.prototype[ _delay ] = function ( name ) {
  const self = this
      , sender = self[ SENDER ][ name ].bind( self )
      , delay = self[_delayTime]

  assert( sender )

  remove()
  if ( delayIsTimeout( delay ) ) {
    self[ TIMEOUT ][ name ] = setTimeout( resolve, delay )
  } else if ( delayIsImmediate( delay ) ) {
    self[ IMMEDIATE ][ name ] = setImmediate( resolve )
  } else {
    resolve()
  }

  return

  function resolve() {
    remove()
    sender()
  }

  function remove() {
    if ( self[ IMMEDIATE ][ name ] ) {
      clearImmediate( self[ IMMEDIATE ][ name ] )
      self[ IMMEDIATE ][ name ] = null
    }

    if ( self[ TIMEOUT ][ name ] ) {
      clearTimeout( self[ TIMEOUT ][ name ] )
      self[ TIMEOUT ][ name ] = null
    }
  }
}

//
//
//

Cursor.prototype[ LISTENER ] = {}

Cursor.prototype[ LISTENER ].delta = function ( delta ) {
  this[_delta].patch( delta )
  this[_delay]( 'delta' )
}

Cursor.prototype[ LISTENER ].change = function () {
  this[_delay]( 'change' )
  this[_delay]( 'value' )
}


//
//
//
Cursor.prototype[ SENDER ] = {}

Cursor.prototype[ SENDER ].delta = function () {
  var delta = this[_delta].get()
  this[_delta].del()

  if ( this[_echo] ) {
    delta = this[_echo].receive( delta )
    if ( isEmpty( delta ) )
      return
  }

  // if ( delta !== undefined )
    this.emit( 'delta', delta )
}

Cursor.prototype[ SENDER ].change = function () {
  this.emit( 'change' )
}

Cursor.prototype[ SENDER ].value = function () {
  if ( this.listenerCount('value') )
    this.emit( 'value', this.value )
}


module.exports = Cursor


//
// Utility Functions
//

function delayIsImmediate( delay ) {
  return delay > 0 && delay < 10
}

function delayIsTimeout( delay ) {
  return delay >= 10
}
