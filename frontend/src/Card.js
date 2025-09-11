import React from "react";
import Elipse from "./Elipse";
import Squiggle from "./Squiggle";
import Square from "./Square";

function Card({ card, onClick, isSelected, isHinted, smallCard }) {
  const { num, shape, color, shading } = card;

  return (
    <div
      className="card"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: isSelected 
          ? "3px solid #3b82f6" 
          : isHinted 
          ? "3px solid #f59e0b" 
          : "2px solid #d1d5db",
        borderRadius: "8px",
        cursor: "pointer",
        transition: "all 0.2s ease-in-out",
        boxShadow: isSelected 
          ? "0 4px 12px rgba(59, 130, 246, 0.3)" 
          : isHinted 
          ? "0 4px 12px rgba(245, 158, 11, 0.3)"
          : "none",
        backgroundColor: isHinted ? "#fef3c7" : "#fff",
        width: `${smallCard ? 70 : 80}%`,
        transform: isSelected ? "scale(1.05)" : isHinted ? "scale(1.02)" : "scale(1)",
      }}
      onMouseEnter={(e) => {
        if (!isSelected && !isHinted) {
          e.currentTarget.style.border = "2px solid #6b7280";
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected && !isHinted) {
          e.currentTarget.style.border = "2px solid #d1d5db";
        }
      }}
    >
      {shape === "oval" && (
        <Elipse num={num} color={color} shading={shading} shape={shape} />
      )}
      {shape === "squiggle" && (
        <Squiggle num={num} color={color} shading={shading} shape={shape} />
      )}
      {shape === "diamond" && (
        <Square num={num} color={color} shading={shading} shape={shape} />
      )}
    </div>
  );
}

export default Card;
