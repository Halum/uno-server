const randomStringGenerator = require('randomstring');

class Player {
  constructor(name, cards) {
    this.id = randomStringGenerator.generate({length: 10, capitalization: 'lowercase'});
    this.name = name;
    this.cards = cards;
    this.status = 'waiting';
  }

  statusReady() {
    this.status = 'ready';

    return this;
  }

  statusPlaying() {
    this.status = 'playing';

    return Promise.resolve(this);
  }

  isReady() {
    return this.status === 'ready';
  }

  addCard(card) {
    this.cards.push(card);
  }
};

module.exports = Player;