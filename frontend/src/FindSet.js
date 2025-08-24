export default function FindSet({ board }) {
  return (
    <button
      onClick={() => findSet(board)}
      style={{ position: "fixed", top: "10px", left: "10px" }}
    >
      Find Set
    </button>
  );
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
function findSet(board) {
  for (let i = 0; i < board.length - 2; i++) {
    for (let j = i + 1; j < board.length - 1; j++) {
      for (let k = j + 1; k < board.length; k++) {
        if (isSet(board[i], board[j], board[k])) {
          alert([
            board[i].shape,
            board[i].color,
            board[i].shading,
            board[i].num,
          ]);
        }
      }
    }
  }
  return false;
}
