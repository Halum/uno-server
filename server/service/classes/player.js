const randomStringGenerator = require('randomstring');
const CardDeck = require('./card.deck');

class Player {
  constructor(name, cards) {
    this.id = randomStringGenerator.generate({length: 10, capitalization: 'lowercase'});
    this.name = name;
    this.cards = cards;
    this.status = 'waiting';
    this.takenCard = null;
  }
  
  addCard(card) {
    this.cards.push(card);
  }

  canPlay(card) {
    if(this.takenCard) return CardDeck.isSame(card, this.takenCard);
    return this.cards.some(c => (c.color === card.color && c.symbol === card.symbol) || (c.symbol === card.symbol && ['wild', '4+'].includes(card.symbol)));
  }

  gameComplete() {
    this.status = 'complete';
  }

  give(deck, card) {
    const pos = this.cards.findIndex(c => (c.color === card.color && c.symbol === card.symbol) || (c.symbol === card.symbol && ['wild', '4+'].includes(card.symbol)));
    
    this.cards.splice(pos, 1);
    deck.addToDiscard(card);
    // player playd his card, so no taken card
    this.takenCard = null;
  }

  isGameComplete() {
    return this.cards.length === 0;
  }

  isReady() {
    return this.status === 'ready';
  }

  json() {
    const playerData = {...this, playerId: this.id};
    delete playerData.id;

    return playerData;
  }

  statusPlaying() {
    this.status = 'playing';

    return Promise.resolve(this);
  }

  statusReady() {
    this.status = 'ready';

    return this;
  }

  summary(currentPlayerId) {
    return {
      playerName: this.name,
      cardCount: this.cards.length,
      playing: currentPlayerId === this.id,
      status: this.status
    };
  }

  tookCard() {
    // make the last card player took as taken card
    this.takenCard = this.cards[ this.cards.length - 1 ];
  }
};

module.exports = Player;