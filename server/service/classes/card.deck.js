
class Cards {
  constructor() {
    this.suits = ['red', 'blue', 'green', 'yellow'];
    this.types = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
                  '2+', 'skip', 'reverse'];
    this.wildTypes = ['wild', '4+'];
    this.deck = [];
    this.discardPile = [];

    this.generate();
    this.shuffle();
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

  shuffle() {
    let cards = this.deck;
    this.deck = [];

    for(let i of Array(cards.length)) {
      const pos = this.getRandomInt(cards.length);
      
      this.deck.push(...cards.splice(pos,1));
    }
  }

  getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  getForPlayer() {
    let playerCards = [...this.deck.splice(0, 7)];

    return playerCards;
  }

  begin() {
    this.discardPile.push(this.deck.pop());
  }

  give(player) {
    player.addCard(this.deck.pop());
  }

  get state() {
    return {
      desk: {
        deck: this.deck.length,
        discard: this.discardPile[ this.discardPile.length - 1 ]
      }
    }
  }
};

module.exports = Cards;