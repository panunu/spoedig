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
    lastMessage: '',
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

  send = (message, period = false) => {
    if (!message) {
      return
    }

    this.setState({
        messages: [{
          message,
          type: 'own',
          period
        }].concat(this.state.messages),
      }, () => connection.send({message: message, type: 'friend', period})
    )
  }

  onEnter = e => {
    if (e.key === 'Enter') {
      this.send(this.state.message, true)

      this.setState({lastMessage: '', message: ''})
    }
  }

  typo = e => {
    this.setState({message: e.target.value}, () => {
      if (/\s/.test(this.state.message)) {
        this.send(this.state.message)

        this.setState({lastMessage: this.state.message, message: ''})
      }
    })
  }

  render() {
    const {peerType, isReady, peerId, messages, message, lastMessage} = this.state

    return (
      <div className="App">
        <header className="App-header">
          {isReady && <input type="text" value={message} onChange={this.typo} placeholder={lastMessage} onKeyPress={this.onEnter}
                             style={{position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', height: 50, textAlign: 'center', fontSize: 16}}/>}

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
                textAlign: m.type === 'friend' ? 'left' : 'right',
                textDecoration: m.period ? 'underline' : 'none'
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
