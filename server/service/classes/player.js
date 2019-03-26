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
    this.clearUno();
  }

  callUno(myTurn = false) {
    // player can only call UNO when his turn and has 2 cards
    // or he can call uno anytime if he has 1 card
    if((myTurn && this.cards.length === 2) || this.cards.length === 1) {
      this.uno = true;
    }
  }

  canPlay(card) {
    // as taken card be an wild card, it's color can be different from the takenCard
    if(this.takenCard) return this.isValidCard(card, this.takenCard);
    return this.cards.some(c => this.isValidCard(c, card));
  }

  clearUno() {
    if(this.cards.length >= 2) {
      this.uno = false;
    }
  }

  gameComplete() {
    this.status = 'complete';
  }

  give(deck, card) {
    const pos = this.cards.findIndex(c => this.isValidCard(c, card));
    
    this.cards.splice(pos, 1);
    deck.addToDiscard(card);
    // player playd his card, so no taken card
    this.takenCard = null;

    if(this.cards.length === 0) {
      this.gameComplete();
    }
  }

  isGameComplete() {
    return this.status === 'complete';
  }

  isReady() {
    return this.status === 'ready';
  }

  isValidCard(cardA, cardB) {
    return CardDeck.isSame(cardA, cardB) || CardDeck.isValidWild(cardA, cardB);
  }

  isValidForPenalty() {
    return this.cards.length === 1 && !this.isUno();
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