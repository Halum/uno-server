const dbStructure = {
  game: {
    id: "",
    players: [],
    currentPlayer: "",
    direction: 1,
    status: "waiting|running|complete",
    rank: []
  },
  player: {
    id: "",
    name: "",
    cards: [],
    status: "waiting|ready|playing|complete"
  }
};

module.exports = dbStructure;