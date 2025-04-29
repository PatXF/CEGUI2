import { useState } from "react";

export default function Button({
  children,
  width = "auto",
  radius = 5,
  border = 0,
  bgColor = "#3C3D37",
  color = "white",
  handler,
  className = "",
  current,
  selected,
}) {
  const [hovered, setHovered] = useState(false);

  const buttonStyle = {
    fontFamily: "Arial",
    width,
    borderRadius: `${radius}px`,
    border: `${border}px`,
    backgroundColor: bgColor,
    filter:
      hovered || (current ? current === selected : false)
        ? "brightness(1.3)"
        : "brightness(1)",
    cursor: "pointer",
    color,
    transition: "filter 0.3s ease",
    padding: "2.5px",
  };

  return (
    <button
      style={buttonStyle}
      className={className}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handler}
    >
      {children}
    </button>
  );
}
