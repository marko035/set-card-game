import SquareFilled from "./shapes/square/SquareFilled";
import SquareOutline from "./shapes/square/SquareOutline";
import SquareStripped from "./shapes/square/SquareStripped";

export default function Square({ num, color, shading, shape, cardIndex }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        height: "100px",
        gap: "10px",
      }}
    >
      {Array.from({ length: num }).map((_, i) => {
        if (shading === "solid") return <SquareFilled key={i} color={color} />;
        if (shading === "striped")
          return <SquareStripped key={i} color={color} cardIndex={cardIndex} />;
        if (shading === "outline")
          return <SquareOutline key={i} color={color} />;
      })}
    </div>
  );
}
