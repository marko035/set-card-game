import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import Card from "./Card";
import FindSet from "./FindSet";
import Toast from "./Toast";
import GameHeader from "./GameHeader";

const API_URL = process.env.REACT_APP_API_URL || "http://192:168.0.27:3001";
const socket = io(API_URL, { transports: ["websocket"] }, {
      reconnection: true,
      reconnectionAttempts: 5,     // Try 5 times before giving up
      reconnectionDelay: 1000,     // Wait 1 second before retrying
      transports: ['websocket'],   // Force WebSocket over polling
    });

function App() {
  const [roomId, setRoomId] = useState("defaultRoom"); // Or prompt user
  const [playerName, setPlayerName] = useState("Player1"); // Or input
  const [gameState, setGameState] = useState({ board: [], scores: {}, players: [], deck: [] });
  const [selectedIds, setSelectedIds] = useState([]);
  const [isJoined, setIsJoined] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [hintCooldown, setHintCooldown] = useState(0);
  const [hintCards, setHintCards] = useState([]);
  const hintCooldownRef = useRef(null);

  useEffect(() => {
    const onGameState = (state) => {
      setGameState(state);
    };
    const onSetFound = ({ finder, finderName, selectedCards }) => {
      addToast(`${finderName} found a set!`, 'success');
      setSelectedIds([]);
      setHintCards([]); // Clear any hints
    };
    const onInvalidSet = () => {
      addToast("Not a set! Try again.", 'error');
      setSelectedIds([]);
    };
    const onCardsAdded = ({ message }) => {
      addToast(message, 'info');
    };
    const onPlayerLeft = ({ playerName }) => {
      addToast(`${playerName} left the room`, 'warning');
    };
    const onError = ({ message }) => {
      addToast(message || "An error occurred", 'error');
    };
    const onGameOver = ({ winner, stats }) => {
      if (winner && winner.name) {
        addToast(`🎉 ${winner.name} wins with ${winner.score} sets!`, 'success', 5000);
      } else {
        addToast("Game over!", 'info', 5000);
      }
      if (stats) {
        console.log("Game stats:", stats);
      }
    };
    
    const onHint = ({ cardIds, message }) => {
      if (message) {
        addToast(message, 'warning');
      } else if (cardIds.length > 0) {
        setHintCards(cardIds);
        addToast("Hint: Look for these cards!", 'info');
        // Clear hint after 5 seconds
        setTimeout(() => setHintCards([]), 5000);
      }
    };

    socket.on("gameState", onGameState);
    socket.on("setFound", onSetFound);
    socket.on("invalidSet", onInvalidSet);
    socket.on("cardsAdded", onCardsAdded);
    socket.on("playerLeft", onPlayerLeft);
    socket.on("error", onError);
    socket.on("gameOver", onGameOver);
    socket.on("hint", onHint);

    return () => {
      socket.off("gameState", onGameState);
      socket.off("setFound", onSetFound);
      socket.off("invalidSet", onInvalidSet);
      socket.off("cardsAdded", onCardsAdded);
      socket.off("playerLeft", onPlayerLeft);
      socket.off("error", onError);
      socket.off("gameOver", onGameOver);
      socket.off("hint", onHint);
    };
  }, []);
  
  // Toast management
  const addToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };
  
  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };
  
  // Hint cooldown management
  useEffect(() => {
    if (hintCooldown > 0) {
      hintCooldownRef.current = setTimeout(() => {
        setHintCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (hintCooldownRef.current) {
        clearTimeout(hintCooldownRef.current);
      }
    };
  }, [hintCooldown]);
  
  const requestHint = () => {
    if (hintCooldown > 0) return;
    socket.emit("requestHint", roomId);
    setHintCooldown(10); // 10 second cooldown
  };

  const handleCardClick = (card) => {
    if (!card || typeof card.id !== "number") return;
    const alreadySelected = selectedIds.includes(card.id);
    const next = alreadySelected
      ? selectedIds.filter((id) => id !== card.id)
      : selectedIds.length < 3
      ? [...selectedIds, card.id]
      : selectedIds;
    setSelectedIds(next);

    if (next.length === 3 && !alreadySelected) {
      // Auto-submit when 3 selected
      socket.emit("selectCards", roomId, next);
    }
  };

  const joinRoom = () => {
    if (!roomId.trim() || !playerName.trim()) {
      addToast("Please enter both room ID and player name", 'error');
      return;
    }
    socket.emit("joinRoom", roomId.trim(), playerName.trim());
    setIsJoined(true);
    addToast(`Joined room ${roomId}`, 'success');
  };

  if (!isJoined) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          width: '100%',
          maxWidth: '400px'
        }}>
          <h1 style={{
            textAlign: 'center',
            marginBottom: '30px',
            color: '#1e293b',
            fontSize: '28px'
          }}>Join Set Game</h1>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#374151'
              }}>Room ID</label>
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter room ID"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
            
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#374151'
              }}>Your Name</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
            
            <button
              onClick={joinRoom}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
            >
              Join Game
            </button>
          </div>
        </div>
        
        {/* Toast notifications */}
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <GameHeader
        roomId={roomId}
        players={gameState.players || []}
        scores={gameState.scores || {}}
        deckLength={gameState.deck?.length || 0}
        onRequestHint={requestHint}
        hintCooldown={hintCooldown}
        currentPlayerId={socket.id}
      />
      
      <div style={{
        flex: 1,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div
          style={{
            display: "grid",
            gap: "12px",
            placeItems: "center",
            gridTemplateColumns: `repeat(${gameState?.board?.length > 12 ? 4 : 3}, 1fr)`,
            maxWidth: '1200px',
            width: '100%'
          }}
          className="container"
        >
          {gameState.board.map((card, index) => (
            <Card
              key={card.id ?? index}
              card={card}
              onClick={() => handleCardClick(card)}
              isSelected={selectedIds.includes(card.id)}
              isHinted={hintCards.includes(card.id)}
              cardIndex={index}
            />
          ))}
        </div>
        
        {gameState.board.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#64748b'
          }}>
            <h3>No cards on the board</h3>
            <p>Waiting for the game to start...</p>
          </div>
        )}
      </div>
      
      {/* Toast notifications */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

export default App;
