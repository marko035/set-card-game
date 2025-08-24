export default function SquiggleStripped({ color, cardIndex }) {
  return (
    <svg
      width="60"
      height="30"
      viewBox="0 0 250 120"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <pattern
          id={`squiggleStrippes${cardIndex}`}
          patternUnits="userSpaceOnUse"
          width="10"
          height="10"
          patternTransform="rotate(45)"
        >
          <rect x="0" y="0" width="2" height="10" fill={color} />
          <rect x="5" y="0" width="2" height="10" fill="white" />
        </pattern>
      </defs>
      <path
        d="
          M 20,60
          C 40,10 100,10 130,40
          C 160,70 210,70 230,30
          C 210,100 150,100 120,70
          C 90,40 40,40 20,60
          Z"
        fill={`url(#squiggleStrippes${cardIndex})`}
        stroke={color}
        strokeWidth="8"
      />
    </svg>
  );
}
