const randomStringGenerator = require('randomstring');

class Player {
  constructor(name, cards) {
    this.id = randomStringGenerator.generate({length: 10, capitalization: 'lowercase'});
    this.name = name;
    this.cards = cards;
    this.status = 'waiting';
  }
  
  addCard(card) {
    this.cards.push(card);
  }

  canPlay(card) {
    return this.cards.some(c => c.color === card.color && c.symbol === card.symbol);
  }

  give(deck, card) {
    const pos = this.cards.findIndex(c => c.color === card.color && c.symbol === card.symbol);
    
    this.cards.splice(pos, 1);
    deck.addToDiscard(card);
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
      name: this.name,
      cardCount: this.cards.length,
      playing: currentPlayerId === this.id
    };
  }
};

module.exports = Player;