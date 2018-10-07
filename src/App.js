import React, {Component} from 'react'
import './App.css'

import Peer from 'peerjs'

const peerKey = 'tussiposket'

let peer = null
let connection = null

class App extends Component {
  state = {
    peerType: null,
    peerId: '',
    isReady: false,
    message: '',
    messages: []
  }

  host = () => {
    peer = new Peer(null, {key: peerKey})

    peer.on('open', id => this.setState({peerId: id, peerType: 'host'}))
    peer.on('connection', conn => {
      connection = conn

      this.setupOnData(connection)
    })
  }

  join = () => {
    peer = new Peer(null, {key: peerKey})

    this.setState({peerType: 'client'})

    connection = peer.connect(this.state.peerId, {reliable: true})
    connection.on('open', () => this.setupOnData(connection))
    connection.on('error', e => console.log('ERRORE', e))
  }

  setupOnData = connection => {
    this.setState({isReady: true})

    connection.on('data', (data) => {
      this.setState({
        messages: [data].concat(this.state.messages)
      })
    })
  }

  send = (message) => {
    this.setState({
        messages: [{
          message,
          type: 'own'
        }].concat(this.state.messages),
      }, () => connection.send({message: message, type: 'friend'})
    )
  }

  typo = e => {
    this.setState({message: e.target.value}, () => {
      if (/\s/.test(this.state.message)) {
        this.send(this.state.message)

        this.setState({message: ''})
      }
    })
  }

  render() {
    const {peerType, isReady, peerId, messages, message} = this.state

    return (
      <div className="App">
        <header className="App-header">
          {isReady && <input type="text" value={message} onChange={this.typo}
                             style={{position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', height: 50}}/>}

          {isReady &&
          <div style={{
            width: '100%',
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 100,
            right: 0,
            overflow: 'scroll',
            display: 'flex',
            flexDirection: 'column-reverse'
          }}>
            {messages.map(m => <div
              style={{
                width: '50%',
                marginLeft: '25%',
                textAlign: m.type === 'friend' ? 'left' : 'right'
              }}>{m.message}</div>)}
          </div>
          }

          {!peerType && (
            <div>
              <button onClick={this.host}>Host</button>

              or else
              <input type="text" value={peerId} onChange={e => this.setState({peerId: e.target.value})}/>
              <button onClick={this.join}>Join</button>
            </div>
          )}

          {peerType && <div style={{position: 'absolute', top: 5, right: 5, fontSize: 12}}>{peerId}</div>}
        </header>
      </div>
    )
  }
}

export default App
