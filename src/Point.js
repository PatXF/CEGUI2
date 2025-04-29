// Point.js
import { useState, useEffect } from "react";

export default function Point({
  flatIndex, // Receive flatIndex
  center,
  dragOffsetX,
  dragOffsetY,
  x = 0,
  y = 0,
  idPart, // Use idPart instead of group
  hoveredGroup,
  setHoveredGroup,
  hoverMode,
  onParticleClick, // Receive the click handler
  // viewState, // Optional
}) {
  const [isPointHovered, setIsPointHovered] = useState(false);

  const handleMouseEnter = () => {
    if (hoverMode === "Group") {
      setHoveredGroup(idPart); // Use idPart here
      setIsPointHovered(false); // Ensure point hover is off
    } else if (hoverMode === "Point") {
      setIsPointHovered(true);
      // Optional: setHoveredGroup(-1); // Turn off group hover if entering a point
    }
  };

  const handleMouseLeave = () => {
    if (hoverMode === "Group") {
      // Only reset if the currently hovered group is THIS point's group
      // This prevents flickering if moving between points of the same group
      if (hoveredGroup === idPart) {
        setHoveredGroup(-1);
      }
    } else if (hoverMode === "Point") {
      setIsPointHovered(false);
    }
  };

  // *** NEW: Click Handler ***
  const handleClick = (event) => {
    // Prevent click from propagating further if needed (e.g., to Displayer's mousedown)
    event.stopPropagation();
    if (hoverMode === "Point") {
      // Call the handler passed from EditorPage with the flatIndex
      onParticleClick(flatIndex);
    }
  };

  // Determine highlight based on hoverMode
  const isHover =
    (hoverMode === "Group" && hoveredGroup === idPart) || // Use idPart
    (hoverMode === "Point" && isPointHovered);

  // Base style properties
  const baseStyle = {
    height: "10px",
    width: "10px",
    borderRadius: "100%",
    zIndex: isHover ? 11 : 10, // Bring hovered point slightly forward
    position: "absolute",
    transition: "background-color 0.1s ease, transform 0.1s ease", // Added transform transition
    // Add slight scale on hover for better feedback
    transform: isHover && hoverMode === "Point" ? "scale(1.5)" : "scale(1.0)",
  };

  // State for dynamic style
  const [style, setStyle] = useState({
    ...baseStyle,
    top: `${center.y - y}px`,
    left: `${center.x + x}px`,
    backgroundColor: isHover ? "hsl(0, 100%, 70%)" : "red", // Adjusted hover color slightly
  });

  // Effect to update position and background color
  useEffect(() => {
    setStyle((prevStyle) => ({
      ...prevStyle,
      top: `${center.y + dragOffsetY - y}px`,
      left: `${center.x + dragOffsetX + x}px`,
      backgroundColor: isHover ? "hsl(0, 100%, 70%)" : "red",
      zIndex: isHover ? 11 : 10,
      transform: isHover && hoverMode === "Point" ? "scale(1.5)" : "scale(1.0)",
    }));
  }, [center, dragOffsetX, dragOffsetY, x, y, isHover, hoverMode]); // Added hoverMode dependency for transform

  return (
    <div
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick} // Add the onClick listener
    ></div>
  );
}
