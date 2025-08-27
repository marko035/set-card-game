import SquareShape from "./shapes/square/SquareShape";

export default function Square({ num, color, shading }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      {Array.from({ length: num }).map((_, i) => (
        <SquareShape color={color} shading={shading} />
      ))}
    </div>
  );
}
