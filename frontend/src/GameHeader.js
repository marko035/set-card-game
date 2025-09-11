import React from 'react';

function GameHeader({ roomId, players, scores, deckLength, onRequestHint, hintCooldown, currentPlayerId }) {
  
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 20px',
      backgroundColor: '#f8fafc',
      borderBottom: '1px solid #e2e8f0',
      flexWrap: 'wrap',
      gap: '16px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <h2 style={{ margin: 0, color: '#1e293b' }}>Room: {roomId}</h2>
        <div style={{
          padding: '4px 12px',
          backgroundColor: '#e2e8f0',
          borderRadius: '16px',
          fontSize: '14px',
          color: '#64748b'
        }}>
          Deck: {deckLength}/81
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onRequestHint}
          disabled={hintCooldown > 0}
          style={{
            padding: '8px 16px',
            backgroundColor: hintCooldown > 0 ? '#94a3b8' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: hintCooldown > 0 ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'background-color 0.2s'
          }}
        >
          {hintCooldown > 0 ? `Hint (${hintCooldown}s)` : 'Get Hint'}
        </button>
        
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {players.map(player => (
            <div
              key={player.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                backgroundColor: player.id === currentPlayerId ? '#dbeafe' : '#f1f5f9',
                borderRadius: '20px',
                border: player.id === currentPlayerId ? '2px solid #3b82f6' : '2px solid transparent'
              }}
            >
              <span style={{ fontSize: '14px', fontWeight: '500' }}>
                {player.name}
              </span>
              <span style={{
                fontSize: '12px',
                backgroundColor: '#64748b',
                color: 'white',
                padding: '2px 6px',
                borderRadius: '10px',
                minWidth: '20px',
                textAlign: 'center'
              }}>
                {scores[player.id] || 0}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GameHeader;
