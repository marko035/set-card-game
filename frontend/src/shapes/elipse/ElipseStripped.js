export default function ElipseStripped({ color, cardIndex }) {
  return (
    <svg
      width="60"
      height="30"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id={`elipseStrippes${cardIndex}`}
          patternUnits="userSpaceOnUse"
          width="10"
          height="10"
          patternTransform="rotate(45)"
        >
          <rect x="0" y="0" width="2" height="10" fill={color} />
          <rect x="5" y="0" width="2" height="10" fill="white" />
        </pattern>
      </defs>
      <ellipse
        cx="50"
        cy="50"
        rx="90"
        ry="30"
        fill={`url(#elipseStrippes${cardIndex})`}
        stroke={color}
        strokeWidth="8"
      />
    </svg>
  );
}
