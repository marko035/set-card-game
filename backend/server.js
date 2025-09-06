const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();

// Serve static files from React app
app.use(express.static(path.join(__dirname, "../frontend/build")));

// Catch-all: return React's index.html for any unknown paths
app.get("/*splat", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Game constants
const ATTRIBUTES = {
  number: [1, 2, 3],
  shape: ["oval", "squiggle", "diamond"],
  color: ["red", "green", "purple"],
  shading: ["solid", "striped", "outline"],
};

// Generate full deck (81 unique cards)
function generateDeck() {
  const deck = [];
  for (let num of ATTRIBUTES.number) {
    for (let shape of ATTRIBUTES.shape) {
      for (let color of ATTRIBUTES.color) {
        for (let shading of ATTRIBUTES.shading) {
          deck.push({ num, shape, color, shading });
        }
      }
    }
  }
  return deck;
}

// Shuffle array
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
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
  let board = deck.splice(0, 18);
  let attempts = 0;
  const maxAttempts = 5;

  while (!hasSet(board) && attempts < maxAttempts) {
    if (deck.length >= 3 && board.length < 18) {
      board.push(...deck.splice(0, 3));
    } else {
      deck.push(...board);
      board = shuffle(deck).splice(0, 18);
    }
    attempts++;
  }

  return board;
}

// In-memory game rooms
const rooms = {};

io.on("connection", (socket) => {
  socket.on("joinRoom", (roomId, playerName) => {
    console.log(playerName, "joined room:", roomId);
    socket.join(roomId);
    if (!rooms[roomId]) {
      let deck = shuffle(generateDeck());
      let board = dealInitialBoard(deck);
      rooms[roomId] = { deck, board, players: [], scores: {} };
    }
    rooms[roomId].players.push({ id: socket.id, name: playerName });
    rooms[roomId].scores[socket.id] = 0;
    io.to(roomId).emit("gameState", rooms[roomId]);
  });

  socket.on("selectCards", (roomId, selectedCards) => {
    const room = rooms[roomId];
    if (selectedCards.length !== 3) return;

    if (isSet(...selectedCards)) {
      // Remove selected cards
      room.board = room.board.filter(
        (card) =>
          !selectedCards.some((s) => JSON.stringify(s) === JSON.stringify(card))
      );

      // Deal new cards to maintain at least 12 cards if possible
      if (room.deck.length >= 3 && room.board.length < 12) {
        room.board.push(...room.deck.splice(0, 3));
      }

      // Check for sets; deal 3 more cards if none exist
      while (
        !hasSet(room.board) &&
        room.deck.length >= 3 &&
        room.board.length < 18
      ) {
        room.board.push(...room.deck.splice(0, 3));
        io.to(roomId).emit("cardsAdded", {
          message: "No sets found. Dealt 3 more cards.",
        });
      }

      // Check if game should end (no sets and deck empty)
      if (!hasSet(room.board) && room.deck.length === 0) {
        io.to(roomId).emit("gameOver", {
          message: "Game over! No sets remain and deck is empty.",
        });
      }

      room.scores[socket.id] += 1;
      io.to(roomId).emit("setFound", { finder: socket.id, selectedCards });
    } else {
      socket.emit("invalidSet");
    }
    io.to(roomId).emit("gameState", room);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    console.log(rooms[socket.id]);
    // Clean up rooms if needed
  });
});

server.listen(3001, () =>
  console.log("Backend running on http://localhost:3001")
);
