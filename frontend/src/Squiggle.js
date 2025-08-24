import SquiggleFilled from "./shapes/squiggle/SquiggleFilled";
import SquiggleOutline from "./shapes/squiggle/SquiggleOutline";
import SquiggleStripped from "./shapes/squiggle/SquiggleStripped";

export default function Squiggle({ num, color, shading, shape, cardIndex }) {
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
        if (shading === "solid")
          return <SquiggleFilled key={i} color={color} />;
        if (shading === "striped")
          return (
            <SquiggleStripped key={i} color={color} cardIndex={cardIndex} />
          );
        if (shading === "outline")
          return <SquiggleOutline key={i} color={color} />;
      })}
    </div>
  );
}
