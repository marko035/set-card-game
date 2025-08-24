export default function ElipseOutline({ num, color, shading }) {
  return (
    <svg
      width="60"
      height="30"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="layer1">
        <ellipse
          cx="50"
          cy="50"
          rx="90"
          ry="30"
          fill="transparent"
          stroke={color}
          strokeWidth="8"
        />
      </g>
    </svg>
  );
}
