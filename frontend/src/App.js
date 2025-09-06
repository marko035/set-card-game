import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import Card from "./Card"; // We'll create this
import FindSet from "./FindSet";

// const socket = io("http://192.168.0.27:3001");
const socket = io("https://set-card-game.onrender.com");

function App() {
  const [roomId, setRoomId] = useState("defaultRoom"); // Or prompt user
  const [playerName, setPlayerName] = useState("Player1"); // Or input
  const [gameState, setGameState] = useState({ board: [], scores: {} });
  const [selected, setSelected] = useState([]);
  const [isJoined, setIsJoined] = useState(false);

  // useEffect(() => {
  //   socket.emit("joinRoom", roomId, playerName);

  //   socket.on("gameState", (state) => setGameState(state));
  //   socket.on("setFound", ({ finder, selectedCards }) => {
  //     alert(`Set found by ${finder}!`);
  //     setSelected([]);
  //   });
  //   socket.on("invalidSet", () => {
  //     alert("Not a set!");
  //     setSelected([]);
  //   });

  //   return () => {
  //     socket.off("gameState");
  //     socket.off("setFound");
  //     socket.off("invalidSet");
  //   };
  // }, [roomId, playerName]);

  const handleCardClick = (card) => {
    if (selected.includes(card)) {
      setSelected(selected.filter((c) => c !== card));
    } else if (selected.length < 3) {
      setSelected([...selected, card]);
    }
    if (selected.length === 2) {
      // Auto-submit when 3 selected
      socket.emit("selectCards", roomId, [...selected, card]);
    }
  };

  const joinRoom = () => {
    socket.emit("joinRoom", roomId, playerName);
    socket.on("gameState", (state) => setGameState(state));
    socket.on("setFound", ({ finder, selectedCards }) => {
      // alert(`Set found by ${finder}!`);
      setSelected([]);
    });
    socket.on("invalidSet", () => {
      alert("Not a set!");
      setSelected([]);
    });

    setIsJoined(true);
  };

  if (!isJoined) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          width: "300px",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h1>Join Game</h1>
        <input
          type="text"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="Room ID"
        />
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Your Name"
        />
        <button onClick={() => joinRoom()}>Join Game</button>
      </div>
    );
  }

  return (
    <div
      style={{
        margin: "20px",
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "column",
      }}
    >
      {/* <h1>Room: {roomId}</h1> */}
      <div
        style={{
          display: "grid",
          gap: "10px",
          placeItems: "center",
          marginTop: "20px",
        }}
        className="container"
      >
        {gameState.board.map((card, index) => (
          <Card
            key={index}
            card={card}
            onClick={() => handleCardClick(card)}
            isSelected={selected.includes(card)}
            cardIndex={index}
          />
        ))}
      </div>
      <div style={{ margin: "20px" }}>
        <p>Deck: {gameState?.deck?.length}/81</p>
        <div
          style={{
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          {Object.entries(gameState.scores).map(([playerId, score]) => (
            <p key={playerId}>
              {
                gameState?.players.find((player) => player.id === playerId)
                  ?.name
              }
              : {score}
            </p>
          ))}
        </div>
      </div>
      {/* <FindSet board={gameState.board} /> */}
    </div>
  );
}

export default App;
