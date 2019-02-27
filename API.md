# Table of Contents

[REST API]()
- [Create Game]()
- [Join Game]()
- [Player Ready]()

[Socket Events]()
- [Game Update]()
- [Player Update]()
- [Take Card]()
- [Play Card]()


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

#### Game Update
- Event: ``
- Type: `listen`
- Response:

#### Player Update
- Event: ``
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