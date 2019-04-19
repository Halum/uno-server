const shuffle = require('shuffle-array');

class CardDeck {
  constructor() {
    this.suits = ['red', 'blue', 'green', 'yellow'];
    this.types = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
                  '2+', 'skip', 'reverse'];
    this.wildTypes = ['wild', '4+'];
    this.penaltyCards = ['2+', '4+'];
    this.skipCards = ['skip'];
    this.deck = [];
    this.discardPile = [];
    this.stack = [];

    this.generate();
    this.shuffle();
  }

  addToDiscard(card) {
    this.discardPile.push(card);
  }

  addToStack(card) {
    this.stack.push(card);
  }

  begin() {
    // remember that 'wild' is valid for first round, may want to update later
    const validCardPos = this.deck.findIndex(card => !this.wildTypes.includes(card.symbol));
    this.discardPile.push(...this.deck.splice(validCardPos, 1));
  }

  canPlay(card, progressiveUno = false) {
    const deskCard = this.discardPile[ this.discardPile.length - 1 ];
    
    if(this.stack.length) {
      // there are 2+/4+ cards in the stack, so player must play the same symbol
      // also only for progressiveUno, player can stack penalty cards
      return deskCard.symbol === card.symbol && progressiveUno;
    }

    return (card.color === deskCard.color || card.symbol === deskCard.symbol || this.wildTypes.includes(card.symbol));
  }

  cardCountForStack() {
    return this.stack.reduce((acc, card) => acc + parseInt(card.symbol), 0);
  }

  clearStack() {
    this.stack = [];
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

  getPlayResult(card, totalPlayer) {
    const result = {
      increament: this.skipCards.includes(card.symbol) ? 2 : 1,
      direction: card.symbol === 'reverse' ? -1 : 1,
      nexPlayerTake: this.penaltyCards.includes(card.symbol) ? parseInt(card.symbol) : 0
    };
    // special case, when total player 2, reverse should skip opponent
    if(totalPlayer === 2 && card.symbol === 'reverse') {
      result.increament = 2;
    }

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
    if(this.deck.length) {
      player.addCard(this.deck.pop());
    } else {
      console.error('There is no card in deck');
    }
    // the deck must have at least 4 cards so when a 4+ is played, then it doesn't crash
    if(this.deck.length < 5) this.recycleCards();
  }

  recycleCards() {
    // move all cards from discard pile to deck excepts for the last one
    // because the last one needs to keep displayed
    this.deck = this.discardPile;
    this.discardPile = [this.deck.pop()]
    // discard pile might have colored wild card, need to filter them and make proper changes
    this.deck = this.deck.map(card => {
      if(this.wildTypes.includes(card.symbol)) card.color = 'any';
      return card;
    });
    shuffle(this.deck);
  }

  shuffle() {
    shuffle(this.deck);
  }

  static isSame(cardA, cardB) {
    return cardA.color === cardB.color && cardA.symbol === cardB.symbol;
  }

  static isValidWild(cardA, cardB) {
    return cardA.symbol === cardB.symbol && ['wild', '4+'].includes(cardA.symbol)
  }
};

module.exports = CardDeck;