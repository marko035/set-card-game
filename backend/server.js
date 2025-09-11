const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const { 
  generateDeck, 
  shuffle, 
  isSet, 
  hasSet, 
  dealInitialBoard,
  getGameStats,
  findAllSets 
} = require("./gameLogic");

const app = express();
const isProd = process.env.NODE_ENV === "production";
const PORT = process.env.PORT || 3001;

// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Serve static files from React app only in production
if (isProd) {
  const staticPath = path.join(__dirname, "../frontend/build");
  app.use(express.static(staticPath));
  
  // Catch-all: return React's index.html for any unknown paths
  app.get("*", (req, res) => {
    const indexPath = path.join(staticPath, "index.html");
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error("Error serving index.html:", err);
        res.status(500).send("Error loading application");
      }
    });
  });
}

const server = http.createServer(app);
const io = new Server(server, { 
  cors: { 
    origin: isProd ? process.env.ALLOWED_ORIGINS?.split(',') || ["https://yourdomain.com"] : ["http://localhost:3000"]
  } 
});


// In-memory game rooms
const rooms = {};

// Rate limiting for set selections (per socket)
const selectionCooldowns = new Map();
const SELECTION_COOLDOWN_MS = 1000; // 1 second between selections

// Input validation helpers
function isValidRoomId(roomId) {
  return typeof roomId === 'string' && roomId.length > 0 && roomId.length <= 50;
}

function isValidPlayerName(playerName) {
  return typeof playerName === 'string' && playerName.trim().length > 0 && playerName.length <= 20;
}

function isValidCardSelection(selectedCards, board) {
  if (!Array.isArray(selectedCards) || selectedCards.length !== 3) return false;
  
  const boardIds = new Set(board.map(c => c.id));
  return selectedCards.every(cardId => 
    typeof cardId === 'number' && boardIds.has(cardId)
  );
}

// Check if socket is in cooldown
function isInCooldown(socketId) {
  const lastSelection = selectionCooldowns.get(socketId);
  if (!lastSelection) return false;
  
  if (Date.now() - lastSelection < SELECTION_COOLDOWN_MS) {
    return true;
  }
  
  selectionCooldowns.delete(socketId);
  return false;
}

// Set cooldown for socket
function setCooldown(socketId) {
  selectionCooldowns.set(socketId, Date.now());
}

io.on("connection", (socket) => {
  socket.on("joinRoom", (roomId, playerName) => {
    // Input validation
    if (!isValidRoomId(roomId) || !isValidPlayerName(playerName)) {
      socket.emit("error", { message: "Invalid room ID or player name" });
      return;
    }
    
    const sanitizedName = playerName.trim();
    console.log(`${sanitizedName} joined room: ${roomId}`);
    
    socket.join(roomId);
    
    if (!rooms[roomId]) {
      const shuffledDeck = shuffle(generateDeck());
      const { board, remainingDeck } = dealInitialBoard(shuffledDeck);
      rooms[roomId] = { 
        deck: remainingDeck, 
        board, 
        players: [], 
        scores: {},
        lastActivity: Date.now()
      };
    }
    
    // Check if player already exists in room
    const existingPlayer = rooms[roomId].players.find(p => p.id === socket.id);
    if (!existingPlayer) {
      rooms[roomId].players.push({ id: socket.id, name: sanitizedName });
      rooms[roomId].scores[socket.id] = 0;
    }
    
    rooms[roomId].lastActivity = Date.now();
    io.to(roomId).emit("gameState", rooms[roomId]);
  });

  socket.on("selectCards", (roomId, selectedCards) => {
    // Input validation and rate limiting
    if (!isValidRoomId(roomId)) {
      socket.emit("error", { message: "Invalid room ID" });
      return;
    }
    
    const room = rooms[roomId];
    if (!room) {
      socket.emit("error", { message: "Room not found" });
      return;
    }
    
    if (isInCooldown(socket.id)) {
      socket.emit("error", { message: "Please wait before making another selection" });
      return;
    }
    
    if (!isValidCardSelection(selectedCards, room.board)) {
      socket.emit("error", { message: "Invalid card selection" });
      return;
    }
    
    // Get full card objects from board using IDs
    const selectedCardObjects = selectedCards.map(cardId => 
      room.board.find(card => card.id === cardId)
    ).filter(Boolean);
    
    if (selectedCardObjects.length !== 3) {
      socket.emit("error", { message: "Selected cards not found on board" });
      return;
    }
    
    setCooldown(socket.id);
    room.lastActivity = Date.now();

    if (isSet(...selectedCardObjects)) {
      // Remove selected cards by ID
      const selectedIds = new Set(selectedCards);
      room.board = room.board.filter(card => !selectedIds.has(card.id));

      // Deal new cards to maintain at least 12 cards if possible
      if (room.deck.length >= 3 && room.board.length < 12) {
        room.board.push(...room.deck.splice(0, 3));
      }

      // Check for sets; deal 3 more cards if none exist
      let cardsAdded = 0;
      while (
        !hasSet(room.board) &&
        room.deck.length >= 3 &&
        room.board.length < 18
      ) {
        room.board.push(...room.deck.splice(0, 3));
        cardsAdded += 3;
      }
      
      if (cardsAdded > 0) {
        io.to(roomId).emit("cardsAdded", {
          message: `No sets found. Dealt ${cardsAdded} more cards.`,
        });
      }

      // Check if game should end (no sets and deck empty)
      if (!hasSet(room.board) && room.deck.length === 0) {
        console.log("Game over for room:", roomId);
        const gameStats = getGameStats(room);
        const scoreEntries = Object.entries(room.scores);
        const winner = scoreEntries.length > 0 
          ? scoreEntries.reduce((max, current) => current[1] > max[1] ? current : max)
          : null;
          
        io.to(roomId).emit("gameOver", winner ? {
          winner: {
            name: room.players.find((player) => player.id === winner[0])?.name || "Unknown",
            score: winner[1],
          },
          stats: gameStats
        } : { winner: null, stats: gameStats });
      }

      room.scores[socket.id] = (room.scores[socket.id] || 0) + 1;
      io.to(roomId).emit("setFound", { 
        finder: socket.id, 
        finderName: room.players.find(p => p.id === socket.id)?.name || "Unknown",
        selectedCards: selectedCardObjects 
      });
    } else {
      socket.emit("invalidSet");
    }
    
    io.to(roomId).emit("gameState", room);
  });

  socket.on("requestHint", (roomId) => {
    if (!isValidRoomId(roomId)) {
      socket.emit("error", { message: "Invalid room ID" });
      return;
    }
    
    const room = rooms[roomId];
    if (!room) {
      socket.emit("error", { message: "Room not found" });
      return;
    }
    
    const sets = findAllSets(room.board);
    if (sets.length > 0) {
      // Send a random set as hint (only IDs to prevent cheating)
      const randomSet = sets[Math.floor(Math.random() * sets.length)];
      const hintIds = randomSet.map(card => card.id);
      socket.emit("hint", { cardIds: hintIds });
    } else {
      socket.emit("hint", { cardIds: [], message: "No sets found on the board" });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    
    // Clean up player from all rooms
    for (const [roomId, room] of Object.entries(rooms)) {
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        const playerName = room.players[playerIndex].name;
        room.players.splice(playerIndex, 1);
        delete room.scores[socket.id];
        
        console.log(`${playerName} left room: ${roomId}`);
        
        // Notify remaining players
        io.to(roomId).emit("playerLeft", { 
          playerId: socket.id, 
          playerName,
          remainingPlayers: room.players.length 
        });
        
        // Remove empty rooms
        if (room.players.length === 0) {
          console.log(`Deleting empty room: ${roomId}`);
          delete rooms[roomId];
        } else {
          // Update game state for remaining players
          io.to(roomId).emit("gameState", room);
        }
      }
    }
    
    // Clean up cooldown
    selectionCooldowns.delete(socket.id);
  });
});

server.listen(PORT, () =>
  console.log(`Backend running on http://localhost:${PORT} (${isProd ? 'production' : 'development'} mode)`),
);

// Cleanup empty rooms periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  const INACTIVE_ROOM_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  
  for (const [roomId, room] of Object.entries(rooms)) {
    if (room.players.length === 0 || (now - room.lastActivity) > INACTIVE_ROOM_TIMEOUT) {
      console.log(`Cleaning up inactive room: ${roomId}`);
      delete rooms[roomId];
    }
  }
}, 5 * 60 * 1000);
