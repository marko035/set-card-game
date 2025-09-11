// Game constants
const ATTRIBUTES = {
  number: [1, 2, 3],
  shape: ["oval", "squiggle", "diamond"],
  color: ["red", "green", "purple"],
  shading: ["solid", "striped", "outline"],
};

// Generate full deck (81 unique cards) with stable IDs
function generateDeck() {
  const deck = [];
  let id = 0;
  for (let num of ATTRIBUTES.number) {
    for (let shape of ATTRIBUTES.shape) {
      for (let color of ATTRIBUTES.color) {
        for (let shading of ATTRIBUTES.shading) {
          deck.push({ id, num, shape, color, shading });
          id++;
        }
      }
    }
  }
  return deck.splice(0,12);
}

// Shuffle array using Fisher-Yates algorithm
function shuffle(array) {
  const shuffled = [...array]; // Don't mutate original array
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Check if three cards form a set
function isSet(card1, card2, card3) {
  const attrs = ["num", "shape", "color", "shading"];
  for (let attr of attrs) {
    const values = [card1[attr], card2[attr], card3[attr]];
    const unique = new Set(values);
    if (unique.size !== 1 && unique.size !== 3) return false;
  }
  return true;
}

// Check if board contains at least one set
function hasSet(board) {
  for (let i = 0; i < board.length - 2; i++) {
    for (let j = i + 1; j < board.length - 1; j++) {
      for (let k = j + 1; k < board.length; k++) {
        if (isSet(board[i], board[j], board[k])) {
          return true;
        }
      }
    }
  }
  return false;
}

// Ensure initial board has a set
function dealInitialBoard(deck) {
  const workingDeck = [...deck]; // Don't mutate original deck
  let board = workingDeck.splice(0, 12);
  let attempts = 0;
  const maxAttempts = 5;

  while (!hasSet(board) && attempts < maxAttempts) {
    if (workingDeck.length >= 3 && board.length < 18) {
      board.push(...workingDeck.splice(0, 3));
    } else {
      // Reshuffle and try again
      const reshuffled = shuffle([...deck]);
      workingDeck.splice(0, workingDeck.length, ...reshuffled);
      board = workingDeck.splice(0, 12);
    }
    attempts++;
  }

  return { board, remainingDeck: workingDeck };
}

// Find all possible sets on the board (useful for debugging/hints)
function findAllSets(board) {
  const sets = [];
  for (let i = 0; i < board.length - 2; i++) {
    for (let j = i + 1; j < board.length - 1; j++) {
      for (let k = j + 1; k < board.length; k++) {
        if (isSet(board[i], board[j], board[k])) {
          sets.push([board[i], board[j], board[k]]);
        }
      }
    }
  }
  return sets;
}

// Calculate game statistics
function getGameStats(room) {
  const totalCardsDealt = 81 - room.deck.length;
  const setsFound = Object.values(room.scores).reduce((sum, score) => sum + score, 0);
  const possibleSets = findAllSets(room.board).length;
  
  return {
    totalCardsDealt,
    setsFound,
    possibleSets,
    cardsOnBoard: room.board.length,
    cardsInDeck: room.deck.length,
    playersCount: room.players.length
  };
}

module.exports = {
  ATTRIBUTES,
  generateDeck,
  shuffle,
  isSet,
  hasSet,
  dealInitialBoard,
  findAllSets,
  getGameStats
};
