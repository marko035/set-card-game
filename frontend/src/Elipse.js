import ElipseFilled from "./shapes/elipse/ElipseFilled";
import ElipseOutline from "./shapes/elipse/ElipseOutline";
import ElipseStripped from "./shapes/elipse/ElipseStripped";

export default function Elipse({ num, color, shading, shape, cardIndex }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        height: "100px",
      }}
    >
      {Array.from({ length: num }).map((_, i) => {
        if (shading === "solid") return <ElipseFilled key={i} color={color} />;
        if (shading === "striped")
          return <ElipseStripped key={i} color={color} cardIndex={cardIndex} />;
        if (shading === "outline")
          return <ElipseOutline key={i} color={color} />;
      })}
    </div>
  );
}
