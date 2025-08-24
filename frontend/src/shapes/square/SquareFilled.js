export default function SquareFilled({ color }) {
  return (
    <svg width="60" height="30" xmlns="http://www.w3.org/2000/svg">
      <rect
        x="5"
        y="5"
        rx="1"
        ry="1"
        width="50"
        height="20"
        fill={color}
        stroke={color}
        strokeWidth="2"
      ></rect>
    </svg>
  );
}
