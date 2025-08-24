export default function SquareStripped({ color, cardIndex }) {
  return (
    <svg width="60" height="30" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern
          id={`squareStrippes${cardIndex}`}
          patternUnits="userSpaceOnUse"
          width="3"
          height="10"
          patternTransform="rotate(45)"
        >
          <rect x="0" y="0" width="1" height="10" fill={color} />
          <rect x="5" y="0" width="2" height="10" fill="white" />
        </pattern>
      </defs>
      <rect
        x="5"
        y="5"
        rx="1"
        ry="1"
        width="50"
        height="20"
        fill={`url(#squareStrippes${cardIndex})`}
        stroke={color}
        strokeWidth="2"
      ></rect>
    </svg>
  );
}
