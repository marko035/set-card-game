import React from "react";
import Elipse from "./Elipse";
import Squiggle from "./Squiggle";
import Square from "./Square";

function Card({ card, onClick, isSelected, cardIndex }) {
  const { num, shape, color, shading } = card;

  return (
    <div
      className="card"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: isSelected ? "2px solid #3b82f6" : "2px solid #d1d5db",
        borderRadius: "8px",
        cursor: "pointer",
        transition: "all 0.2s ease-in-out",
        boxShadow: isSelected ? "0 4px 6px rgba(0, 0, 0, 0.1)" : "none",
        backgroundColor: "#fff",
      }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.border = "2px solid #6b7280";
      }}
      onMouseLeave={(e) => {
        if (!isSelected) e.currentTarget.style.border = "2px solid #d1d5db";
      }}
    >
      {shape === "oval" && (
        <Elipse
          num={num}
          color={color}
          shading={shading}
          shape={shape}
          cardIndex={cardIndex}
        />
      )}
      {shape === "squiggle" && (
        <Squiggle
          num={num}
          color={color}
          shading={shading}
          shape={shape}
          cardIndex={cardIndex}
        />
      )}
      {shape === "diamond" && (
        <Square
          num={num}
          color={color}
          shading={shading}
          shape={shape}
          cardIndex={cardIndex}
        />
      )}
    </div>
  );
}

export default Card;
