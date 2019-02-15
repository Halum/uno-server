
class Cards {
  constructor() {
    this.suits = ['red', 'blue', 'green', 'yellow'];
    this.types = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
                  '2+', 'skip', 'reverse'];
    this.wildTypes = ['wild', '4+'];
    this.deck = [];
    this.discardPile = [];

    this.generate();
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

  getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  getForPlayer() {
    let playerCards = [];

    for(let i of Array(7)) {
      const pos = this.getRandomInt(this.deck.length);

      playerCards.push(this.deck[pos]);
      this.deck.splice(pos, 1);
    }

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