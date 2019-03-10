const shuffle = require('shuffle-array');

class CardDeck {
  constructor() {
    this.suits = ['red', 'blue', 'green', 'yellow'];
    this.types = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
                  '2+', 'skip', 'reverse'];
    this.wildTypes = ['wild', '4+'];
    this.penaltyCards = ['2+', '4+'];
    this.skipCards = ['skip', ...this.penaltyCards];
    this.deck = [];
    this.discardPile = [];

    this.generate();
    this.shuffle();
  }

  addToDiscard(card) {
    this.discardPile.push(card);
  }

  begin() {
    // remember that 'wild' is valid for first round, may want to update later
    const validCardPos = this.deck.findIndex(card => !this.wildTypes.includes(card.symbol));
    this.discardPile.push(...this.deck.splice(validCardPos, 1));
  }

  canPlay(card) {
    const deskCard = this.discardPile[ this.discardPile.length - 1 ];
    // what if desk has any wild cards
    return (card.color === deskCard.color || card.symbol === deskCard.symbol || this.wildTypes.includes(card.symbol));
  }

  createCard(color, symbol) {
    return {color, symbol};
  }

  generate() {
    for(let suit of this.suits) {
      for(let type of this.types) {
        this.deck.push(this.createCard(suit, type));
        if(type !== '0') this.deck.push(this.createCard(suit, type));
      }
    }

    for(let type of this.wildTypes) {
      for(let i of Array(4)) {
        this.deck.push(this.createCard('any', type));
      }
    }
  }

  getPlayResult(card) {
    const result = {
      increament: this.skipCards.includes(card.symbol) ? 2 : 1,
      direction: card.symbol === 'reverse' ? -1 : 1,
      nexPlayerTake: this.penaltyCards.includes(card.symbol) ? parseInt(card.symbol) : 0
    };

    return result;
  }

  getForPlayer() {
    let playerCards = [...this.deck.splice(0, 7)];

    return playerCards;
  }

  getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  get state() {
    return {
      deck: this.deck.length,
      discard: this.discardPile[ this.discardPile.length - 1 ]
    }
  }

  give(player) {
    player.addCard(this.deck.pop());
    // this if deck is empty then get cards from discardPie
    if(this.deck.length === 0) this.recycleCards();
  }

  recycleCards() {
    // move all cards from discard pile to deck excepts for the last one
    // because the last one needs to keep displayed
    this.deck = this.discardPile.splice(-1);
    shuffle(this.deck);
  }

  shuffle() {
    shuffle(this.deck);
  }
};

module.exports = CardDeck;