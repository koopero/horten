'use strict'

const NS = require('./namespace')
const now = function () { return new Date().getTime() }
const EVENT_NAMES = ['delta','change','value','keys']

const EventEmitter = require('events')
    , assert = require('assert')

const split = require('./path').split
    , slice = require('./path').slice
    , wrap = require('./wrap')
    , eachKey = require('./eachKey')
    , Mutant = require('./Mutant')
    , Echo = require('./Echo')
    , isEmpty = require('./isEmpty')
    , hasKeys = require('./hasKeys')

class Cursor extends EventEmitter {
  constructor ( config ) {
    super()
    const self = this

    this[ NS.held ] = {}


    self[ NS.delta ] = new Mutant()
    self[ NS.echo ] = new Echo()
    self[ NS.hold ] = false
    self[ NS.immediate ] = null
    self[ NS.timeout ] = null

    self[ NS.listenerBound ] = {}
    eachKey( self[NS.listener], function ( listener, name ) {
      self[ NS.listenerBound ][name] = listener.bind( self )
    } )

    self[ NS.delayMax ] = 0
    self.delay = 0

    if ( hasKeys( config ) )
      self.configure( config )
  }

  configure( config ) {
    if ( !hasKeys( config ) )
      throw new Error('Invalid arguments')

    const self = this
        , keys = [
            'delay',
            'hold',
            'root',
            'path',
            'mutant',
            'delayMax',
            'listening'
          ]

    keys.forEach( ( key ) => {
      if ( 'undefined' !== typeof config[key] )
        self[key] = config[key]
    } )

    EVENT_NAMES.forEach( ( eventName ) => {
      const listenerName = 'on' + eventName.slice( 0, 1 ).toUpperCase() + eventName.slice( 1 )
      if ( config[listenerName] )
        self.on( eventName, config[listenerName] )
    })

    if ( 'value' in config )
      self.value = config['value']
    else if ( 'trigger' in config )
      self.value = now()
    else if ( 'defaultValue' in config && self.value === undefined )
      self.value = config['defaultValue']

  }

  set listening ( value ) {
    const self = this
    value = !!value

    const current = self[ NS.listening ]
        , mutant = self[ NS.mutant ]

    if ( mutant && value && !current ) {
      eachKey( self[ NS.listenerBound ], function ( listener, name ) {
        mutant.on( name, listener )
      })
    }

    if ( mutant && !value && current ) {
      eachKey( self[ NS.listenerBound ], function ( listener, name ) {
        mutant.removeListener( name, listener )
      })
    }

    self[ NS.listening ] = value
  }

  get listening () {
    return this[ NS.listening ]
  }

  set mutant( newMutant ) {
    const mutant = this[ NS.mutant ]

    if ( !Mutant.isMutant( newMutant ) ) {
      throw new Error("Mutant imposter!")
      newMutant = null
    }

    if ( newMutant != mutant ) {
      const wasListening = this.listening
      this.listening = false
      this[ NS.mutant ] = newMutant
      if ( newMutant )
        this[ NS.root ] = newMutant.root
      this.listening = wasListening
    }

  }

  get mutant() {
    if ( !this[ NS.mutant ] ) {
      this.mutant = this.root
    }
    return this[ NS.mutant ]
  }

  set path( value ) {
    value = split( value )
    this.mutant = this.root.walk( value )
    this[ NS.path ] = value
  }

  get path() {
    return this[ NS.path ] || []
  }

  set root( value ) {
    this[ NS.root ] = value
    if ( !this[ NS.mutant ] )
      this.path = this.path
  }

  get root() {
    if ( !this[ NS.root ] ) {
      this[ NS.root ] = require('./root')
    }
    return this[ NS.root ]
  }

  set delay( value ) {
    this[ NS.delayTime ] = Math.max( -1, parseInt( value ) || 0 )
  }

  get delay() {
    return this[ NS.delayTime ]
  }

  set delayMax( value ) {
    this[ NS.delayMax ] = Math.max( 0, parseInt( value ) || 0 )
  }

  get delayMax() {
    return this[ NS.delayMax ]
  }

  set hold( value ) {
    value = !!value

    // console.log('Cursor.set hold', value )

    const oldValue = this[ NS.hold ]
    this[ NS.hold ] = value

    if ( !value && oldValue ) {
      this[ NS.clearTimers ]()
    } else if ( oldValue && !value ) {
      this[ NS.doTimers ]()
    }
  }

  get hold() {
    return this[ NS.hold ]
  }

  set echo( value ) {
    value = !!value

    if ( value && !this[ NS.echo ] )
      this[ NS.echo ] = new Echo()
    else if ( !value && this[ NS.echo ] )
      this[ NS.echo ] = null
  }

  get echo() {
    return !!this[ NS.echo ]
  }



  release() {
    const self = this
        , held = self[ NS.held ]

    // if ( self[ NS.releasing ] )
    //   console.warn('Reentrant release.')

    self[ NS.firstTrigger ] = 0

    var delta = this[ NS.delta ].get()

    // self[ NS.delta ].del()
    self[ NS.delta ] = new Mutant()
    self[ NS.held ] = {}
    self[ NS.clearTimers ]()
    self[ NS.releaseTime ] = now()
    self[ NS.releasing ] = true

    if ( held.keys )
      this.emit( 'keys', held.keys )

    if ( held.change )
      this.emit( 'change' )

    if ( held.value )
      this.emit( 'value', this.value )

    if ( hasKeys( delta ) && self[ NS.echo ] ) {
      delta = self[ NS.echo ].receive( delta )
    }

    if ( !isEmpty(delta) ) {
      this.emit( 'delta', delta )
    }

    self[ NS.releasing ] = false
  }

  //
  //
  //
  patch( value ) {
    const path = slice( arguments, 1 )
        , mutant = this.mutant

    if ( this[ NS.echo ] )
      this[ NS.echo ].send( wrap( value, path ) )

    return mutant.patch.apply( mutant, arguments )
  }

  merge( value ) {
    const path = slice( arguments, 1 )
        , mutant = this.mutant

    if ( this[ NS.echo ] )
      this[ NS.echo ].send( wrap( value, path ) )

    return mutant.merge.apply( mutant, arguments )
  }


  get( path ) {
    const mutant = this.mutant
    return mutant.get.apply( mutant, arguments )
  }


  set value( value ) {
    if ( this[ NS.echo ] )
      this[ NS.echo ].send( value )

    this.mutant.set( value )
  }

  get value() {
    return this.mutant.get()
  }

  pull() {
    this[ NS.listenerBound ]['delta']( this.value )
  }

  trigger() {
    this.value = now()
  }
}

Cursor.prototype[ NS.doTimers ] = function ( forceDelay ) {
  const self = this
      , delay = self[ NS.delayTime ]
      , time = now()

  if ( self[ NS.hold ] )
    return false

  self[ NS.clearTimers ]()
  const release = self.release.bind( self )

  self[ NS.firstTrigger ] = self[ NS.firstTrigger ] || time

  const triggerAge = time - self[ NS.firstTrigger ]

  if ( self.delayMax && self.delayMax < triggerAge ) {
    release()
  } else if ( delayIsTimeout( delay ) ) {
    self[ NS.timeout ] = setTimeout( release, delay )
  } else if ( delayIsImmediate( delay ) && forceDelay ) {
    self[ NS.immediate ] = setImmediate( release )
  } else {
    release()
  }
}

Cursor.prototype[ NS.clearTimers ] = function() {
  if ( this[ NS.immediate ] ) {
    clearImmediate( this[ NS.immediate ] )
    this[ NS.immediate ] = null
  }

  if ( this[ NS.timeout ] ) {
    clearTimeout( this[ NS.timeout ] )
    this[ NS.timeout ] = null
  }
}


//
// Listeners upon Mutant
//

Cursor.prototype[ NS.listener ] = {}

Cursor.prototype[ NS.listener ].delta = function ( delta ) {
  // console.log('Cursor delta listener', delta )
  this[ NS.delta ].patch( delta )
  this[ NS.held ].change = true
  this[ NS.held ].value  = true
  this[ NS.doTimers ]()
}

Cursor.prototype[ NS.listener ].keys = function ( keys ) {
  // console.log('Cursor keys listener', keys )
  this[ NS.held ].keys      = keys
  this[ NS.doTimers ]()
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
