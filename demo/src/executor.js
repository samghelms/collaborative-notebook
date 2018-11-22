/**
 * There should only ever be one executor for a given notebook.
 * This executor can be launched wherever you want, and can take
 * many forms and have any compute environment that you want.
 * 
 * Ideas: Should executors be allowed to run simultaneously if 
 * you have one cell that runs a sql query and another that does
 * something in python? What if the cells are parallel forks?
 * 
 * Maybe the paradigm should not be "notebooks" but "workstreams"
 * that can easily branch off and define upstream dependencies.
 */

var signalhub = require('signalhub')
var hub = signalhub('my-app-name', [
  'http://localhost:8080'
])

// import {uuid} from './utils'

hub.subscribe('my-channel')
  .on('data', function (message) {
    console.log('new message received', message)
  })

hub.broadcast('my-channel', {hello: 'from the executor'})

// class VerticaConnection {

// }

// class PythonShell {
//   constructor() {

//   }
// }

// class Executor {
//   constructor(appName, appUrl, channelName, possibleTypes=['python']) {
//     // this._possibleExecutorTypes = 
//     this._executors = {python: PythonShell}
//     this._channelName = channelName

//     this._hub = signalhub(appName, [
//       appUrl
//     ])

//     // announce executor to swarm
//     this._hub.subscribe(channelName).on('data', function (message) {
//       console.log('new message received', message)
//       if(message.type === 'execute') {
//         execute(message.executorId, message.command)
//       } else if (message.type === 'getInitial') {
//         this.broadcast(channelName, {hello: 'from the executor'})
//       }
//     })
//   }

//   possiblyBroadcastData(data) {

//   }
  
//   addExecutor(executorType) {
//     if (executorType of _executorClasses) {
//       const executorId = `executorType-${uuid()}`
//       this._executors[executorId] = new _executorClasses[executorType]()

//       hub.broadcast(this._channelName, {type: 'announceExecutor', 
//                                         executorId: executorId})
//     } else {
//       // TODO: add more info on the executor to this error message
//       hub.broadcast(this._channelName, {type: 'notification', 
//                                         message: 'Adding '})
//     }

//     // announce executor to all other apps in the swarm

//   }

//   execute(executorId, command) {
//     const executorResult = this._executors[executorId](command)
    
//     executorResult.on('data', () => this.possiblyBroadcastData(executorId, executorResult))
//   }

// }

// TODOS:
// Method to send information when `getInitial` is sent out to the cluster