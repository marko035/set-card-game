import SquiggleShape from "./shapes/squiggle/SquiggleShape";

export default function Squiggle({ num, color, shading }) {
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
        <SquiggleShape key={i} color={color} shading={shading} />
      ))}
    </div>
  );
}
