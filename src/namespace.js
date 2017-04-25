'use strict'

const NS = ( global.H && global.H.NS ) || exports
module.exports = NS

NS.SEP = '/'

const keys = [
  'clearTimers',
  'delay',
  'delayMax',
  'delayTime',
  'delta',
  'dirty',
  'doTimers',
  'echo',
  'emit',
  'firstTrigger',
  'hold',
  'held',
  'immediate',
  'initial',
  'isMutant',
  'key',
  'listener',
  'listening',
  'listenerBound',
  'mutant',
  'mutate',
  'mutating',
  'mutation',
  'onSubMutate',
  'parent',
  'path',
  'patchingSub',
  'rebuild',
  'releaseTime',
  'releasing',
  'root',
  'sender',
  'splitResult',
  'stale',
  'subs',
  'timeout',
  'value',
  'void',

]

const _Symbol = require('es6-symbol')

keys.forEach( ( key ) =>
  NS[key] = NS[key] || _Symbol( key )
)
