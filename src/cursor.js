'use strict'

const _root = Symbol('_root')
    , _path = Symbol('_path')
    , _delta = Symbol('_delta')
    , _mutant = Symbol('_mutant')
    , _listening = Symbol('_listening')
    , _listeners = Symbol('_listeners')
    , _listenNames = ['delta']
    , _listenKeys = {}
    , _delayKeys = {
      delta: Symbol('send_delta'),
      change: Symbol('send_change'),
      value: Symbol('send_value'),
    }

_listenNames.forEach( ( name ) => _listenKeys[name] = Symbol( name ) )

const EventEmitter = require('events')

const split = require('./path').split
    , Mutant = require('./Mutant')

class Cursor extends EventEmitter {
  constructor () {
    super()
    const self = this

    self[_delta] = new Mutant()

    self[_listeners] = {}
    _listenNames.forEach( ( name ) => {
      const key = _listenKeys[name]
      self[_listeners][name] = self[key].bind( self )
    })
  }

  set listening ( value ) {
    value = !!value

    const current = this[_listening]
        , mutant = this.mutant

    if ( mutant && value && !current ) {
      _listenNames.forEach( ( name ) => {
        mutant.on( name, this[_listeners][name] )
      })
    }

    if ( mutant && !value && current ) {
      _listenNames.forEach( ( name ) => {
        mutant.on( name, this[_listeners][name] )
      })
    }

    this[_listening] = value
  }

  get listening () {
    return this[_listening]
  }

  set mutant( newMutant ) {
    var mutant = this.mutant

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
    return this[_mutant]
  }

  set path( value ) {
    value = split( value )
    const root = this.root
    this.mutant = root.walk( value )
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
      this[_echo].set( value )

    this.mutant.set( value )
  }

  get value() {
    return this.mutant.get()
  }

  set delay( value ) {

  }

  get delay() {

  }
}

//
//
//



//
//
//

Cursor.prototype[ _listenKeys.delta ] = function ( delta ) {
  console.log( 'delta', this )
  this[_delta].patch( delta )
  this[_delay].call( 'delta' )
}

//
//
//
Cursor.prototype[ _delayKeys.delta ] = function () {
  var delta = this[_delta].get()
  this[_delta].del()

  if ( this[_echo] )
    delta = this[_echo].filterDelta()

  if ( delta !== undefined )
    this.emit( 'delta', delta )
}

Cursor.prototype[ _delayKeys.change ] = function () {
  this.emit( 'change' )
}

Cursor.prototype[ _delayKeys.value ] = function () {
  this.emit( 'value', this.value )
}


module.exports = Cursor
