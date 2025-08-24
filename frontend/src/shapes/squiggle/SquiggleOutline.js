export default function SquiggleOutline({ color }) {
  return (
    <svg
      width="60"
      height="30"
      viewBox="0 0 250 120"
      preserveAspectRatio="xMidYMid meet"
    >
      <path
        d="
      M 20,60
      C 40,10 100,10 130,40
      C 160,70 210,70 230,30
      C 210,100 150,100 120,70
      C 90,40 40,40 20,60
      Z"
        fill="none"
        stroke={color}
        strokeWidth="8"
      />
    </svg>
  );
}
