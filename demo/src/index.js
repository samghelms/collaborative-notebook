import React from 'react'
import ReactDOM from 'react-dom';
import {render} from 'react-dom'

import BreadLoaf from '../../src/breadloaf'
import '../../src/bread.css'
import './demo.css'
import Automerge from 'automerge'

import {handleDrag} from './utils'

const uuidv1 = require('uuid/v1');
var signalhub = require('signalhub')

const Slice = ({beginDrag, fork, close, view, updateView}) => (
  <div className="slice">
    <div className="slice-header" onMouseDown={beginDrag}>
      <div style={{flexGrow: 1}}>drag to move this</div>

      <button onClick={fork}>fork</button>
      <button onClick={close}>&times;</button>
    </div>
    <div style={{ display: 'flex', overflow: 'hidden' }}>
      <textarea 
        style={{ width: '50%', minWidth: '50%', border: 0, padding: 10, 
        fontFamily: 'Menlo, monospace', outline: 0 }}
        value={view.text || ''} 
        onInput={e => updateView({ text: e.target.value}) } />
      <div 
        width={400}
        height={225}
        style={{ width: 400, height: 225, borderLeft: '1px solid #ddd' }}
        >{view.text}</div>
    </div>
  </div>
)

const getChanges = (oldNotebook, trigger, view, kwargs) => {
  const newNotebook = Automerge.change(oldNotebook, nb => {
    if (!nb.layout) {
      nb.layout = []
    }

    switch (trigger) {
      case 'append':
        let {rowId} = kwargs
        nb.layout.push({
          rowId: rowId,
          items: [ view ]
        })
        return

      case 'close':
        let {rowi, coli} = kwargs
        if (nb.layout[rowi].items.length > 1) {
          nb.layout[rowi].items.splice(coli, 1)
        } else {
          nb.layout.splice(rowi, 1)
        }
        return

      case 'update':
        // var newRows = this.cloneLayout()
        let {rowi: rowiUpdate, coli: coliUpdate, d} = kwargs
        nb.layout[rowiUpdate].items[coliUpdate] = {...view, ...d}
        return

      case 'prepend':
        let {rowId_prepend} = kwargs
        nb.layout.unshift({
          rowId: rowId_prepend,
          items: [ view ]
        })
        return

      case 'drag':
        let {e, pos, thing, anchor, i, j, rowId: rowIdDrag} = kwargs
        handleDrag(e, anchor, nb.layout, pos, i, j, rowIdDrag)
        return 

      case 'insert':
        let {rowi: rowiInsert, rowIdInsert} = kwargs
        nb.layout.splice(rowiInsert, 0, { rowId: rowIdInsert, items: [ view ] })
        return

      case 'insert-item':
        let {rowi: rowiInsertItem, coli: coliInsertItem} = kwargs
        nb.layout[rowiInsertItem].items.splice(coliInsertItem, 0, view)
        return

      case 'fork':
        let {rowi: rowiFork, coli: coliFork} = kwargs
        nb.layout[rowiFork].items.splice(coliFork, 0,  view)
        return

      default:
        console.log(`${trigger} not supported`)
        return

    }
  })
  return Automerge.getChanges(oldNotebook, newNotebook)
}

const getInitialNB = () => {
  const notebook = Automerge.init()
  // const notebook_init = Automerge.change(notebook, 'Initialize card list', nb => {
  //   nb.layout = []
  // })
  return notebook
}

// const updateNotebook = (state, changes) => {
//   const newNotebook = Automerge.applyChanges(state.notebook, changes)
//   return {notebook: newNotebook}
// }

const messageHandler = (message, self) => {
  if(message.type && message.uuid) {
    if(message.type === 'updateLayout' && message.uuid !== self.uuid) {
      // console.log('update layout recieved')
      // self.setState({layout: message.layout})
      const changes = message.changes
      if (changes) {
        const newNotebook = Automerge.applyChanges(self.state.notebook, changes)
        self.setState({notebook: newNotebook})
      }
    } else if (message.type === 'getInitial') {
      if (message.uuid !== self.uuid) {
        const nb = getInitialNB()
        const initialChange = Automerge.getChanges(nb, self.state.notebook)
        self.hub.broadcast(self.props.channelName, {type: 'updateLayout', 
                                          uuid: self.uuid, 
                                          changes: initialChange
                                      })
      }
    }
  }
}

class Notebook extends React.Component {

  uuid = uuidv1()
  state = {caret: null, focused: null, notebook: getInitialNB()}
  
  componentDidMount() {
    this.hub = signalhub(this.props.appName, [
      this.props.signalServer
    ])
    self = this
    this.hub.subscribe(this.props.channelName)
      .on('data', (message) => messageHandler(message, self))
    
    this.hub.broadcast(this.props.channelName, {type: 'getInitial', uuid: this.uuid})

  }

	render() {
    return <div>
    	<div className="header">
      		<h1>Collaborative Notebook Demo</h1>
      </div>
    
    	<BreadLoaf 
    		ref={e => this.loaf = e} 
        layout={this.state.notebook.layout ? this.state.notebook.layout: []}
        Automerge={Automerge}
    		updateLayout={(data, trigger, view, kwargs) => {

          const changes = getChanges(this.state.notebook, trigger, view, kwargs)

          const newNotebook = Automerge.applyChanges(this.state.notebook, changes)
          this.setState({notebook: newNotebook})

          this.hub.broadcast(this.props.channelName, {type: 'updateLayout', 
                                            uuid: this.uuid,
                                            changes: changes
                                          })
    		}}
    		element={
    			<Slice {...this.props} />
    		}
    		footer={
				<div className="fake-row row-1" onClick={e => this.loaf.append({})}>
					<span>
						<div className="bread-col">
							<div className="fake-slice">+</div>
						</div>
					</span>
				</div>
    		}
    	/>
    </div>
  }
}

render(
  <Notebook channelName='demo-nb' appName='collaborative-notebook-demo' signalServer='https://signalhub.jannisr.de/'/>,
  document.getElementById('demo')
)