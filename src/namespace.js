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
  'releaseTime',
  'releasing',
  'root',
  'sender',
  'splitResult',
  'subs',
  'timeout',
  'value',
]

keys.forEach( ( key ) =>
  NS[key] = NS[key] || Symbol( key )
)
