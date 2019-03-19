const randomStringGenerator = require('randomstring');
const CardDeck = require('./card.deck');

class Player {
  constructor(name, cards) {
    this.id = randomStringGenerator.generate({length: 10, capitalization: 'lowercase'});
    this.cards = cards;
    this.name = name;
    this.status = 'waiting';
    this.takenCard = null;
    this.uno = false;
  }
  
  addCard(card) {
    this.cards.push(card);
  }

  callUno() {
    if(this.cards.length <= 2) this.uno = true;
  }

  canPlay(card) {
    // as taken card be an wild card, it's color can be different from the takenCard
    if(this.takenCard) return CardDeck.isValid(card, this.takenCard);
    return this.cards.some(c => CardDeck.isValid(c, card));
  }
  }

  gameComplete() {
    this.status = 'complete';
  }

  give(deck, card) {
    const pos = this.cards.findIndex(c => CardDeck.isValid(c, card));
    
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

  isUno() {
    return this.uno;
  }

  json() {
    const playerData = {...this, playerId: this.id};
    delete playerData.id;

    return playerData;
  }

  skipCard() {
    this.takenCard = null;
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
      status: this.status,
      uno: this.uno
    };
  }

  takeCard() {
    // make the last card player took as taken card
    this.takenCard = this.cards[ this.cards.length - 1 ];
  }
};

module.exports = Player;