export default function ElipseFilled({ color }) {
  return (
    <svg
      width="60"
      height="30"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse
        cx="50"
        cy="50"
        rx="90"
        ry="40"
        fill={color}
        stroke={color}
        strokeWidth="8"
      />
    </svg>
  );
}
