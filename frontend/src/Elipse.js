import ElipseShape from "./shapes/elipse/ElipseShape";

export default function Elipse({ num, color, shading }) {
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
        <ElipseShape color={color} shading={shading} />
      ))}
    </div>
  );
}
