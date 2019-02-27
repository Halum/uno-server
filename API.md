# Table of Contents

[REST API](#rest-api)
- [Create Game](#create-game)
- [Join Game](#join-game)
- [Player Ready](#player-ready)

[Socket Events](#socket-events)
- [Game Update](#game-update)
- [Player Update](#player-update)
- [Take Card](#take-card)
- [Play Card](#play-card)


### REST API
#### Create Game
- URL: `http://localhost:3500/uno/new`
- Method: `POST`
- Success Response:
  - Code: `200`
  - Content: `{gameId: ''}`

#### Join Game
- URL: `http://localhost:3500/uno/player`
- Method: `POST`
- Payload:
```
    {
      gameId: '',
      playerName: ''
    }
```
- Success Response:
  - Code: `200`
  - Content: 
  ```
      {
        cards: [{color: '', symbol: ''}, ...], // 7 cards
        playerId: '',
        name: '',
        status: 'waiting'
      }
  ```

#### Player Ready
- URL: `http://localhost:3500/uno/player/ready`
- Method: `POST`
- Payload:
```
    {
      gameId: '',
      playerId: ''
    }
```
- Success Response:
  - Code: `200`
  - Content: 
  ```
      {
        cards: [{color: '', symbol: ''}, ...], // 7 cards
        playerId: '',
        name: '',
        status: 'ready'
      }
  ```

### Socket Events
- URL: `http://localhost:3500`
- Namespace: `<gameId>`
- How to connect: ```io(`http://localhost:3500/${gameId})```

#### Game Update
- Event: `<gameId>`
- Type: `listen`
- Response: `You are connected to <gameId>`

#### Player Update
- Event: `<playerId>`
- Type: `listen`
- Response:
```
  {
    desk: {
      deck: 93, // card remaining in deck
      discard: { // display card in desk
        color: '',
        symbol: ''
      }
    },
    cards: [{color: '', symbol: ''}, ...],
    playerId: '',
    name: '',
    status: 'playing|complete',
    turn: true|false // if this player's move
  }
```

#### Take Card
- Event: `take-card`
- Type: `emit`
- Payload: `playerId`

#### Play Card
- Event: `play-card`
- Type: `emit`
- Payload: 
```
  {
    playerId, 
    card: {color, symbol}
  }
```