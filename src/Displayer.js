import { useState, useRef, useEffect, useCallback } from "react";
import "./displayer.css";
import Point from "./Point";

const initialOriginStyle = {
  width: "10px",
  height: "10px",
  backgroundColor: "#FFF2F2",
  borderRadius: "100%",
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "transition",
  margin: "0%",
  padding: "0%",
  zIndex: "0",
};

export default function Displayer({
  formattedParticles,
  hoveredGroup,
  setHoveredGroup,
  viewState,
  hoverMode,
  onParticleClick,
  theta, // needs to be in radians
  showNotification,
}) {
  // Dragging state
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [currPosition, setCurrPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Center and origin style
  const CenterRef = useRef(null);
  const [center, setCenter] = useState({ x: 0, y: 0 });
  const [originStyle, setOriginStyle] = useState(initialOriginStyle);
  const [viewportSize, setViewportSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Zoom state with max 5x (500% zoom)
  const [scale, setScale] = useState(1);

  // --- Dragging Handlers --- (Keep as is)
  function handleMouseDown(e) {
    if (viewState === "Translate") {
      setIsDragging(true);
      setStartPosition({ x: e.clientX, y: e.clientY });
      setCurrPosition({ x: e.clientX, y: e.clientY });
    }
  }

  function handleMouseMove(e) {
    if (isDragging && viewState === "Translate") {
      const deltaX = e.clientX - startPosition.x;
      const deltaY = e.clientY - startPosition.y;
      setCurrPosition({ x: e.clientX, y: e.clientY });
      setOriginStyle((prevStyle) => ({
        ...prevStyle,
        top: `${center.y + deltaY}px`,
        left: `${center.x + deltaX}px`,
      }));
    }
  }

  function handleMouseUp(e) {
    if (isDragging && viewState === "Translate") {
      setIsDragging(false);
      const deltaX = e.clientX - startPosition.x;
      const deltaY = e.clientY - startPosition.y;
      setCenter((prevCenter) => ({
        x: prevCenter.x + deltaX,
        y: prevCenter.y + deltaY,
      }));
      setStartPosition({ x: 0, y: 0 });
      setCurrPosition({ x: 0, y: 0 });
    }
    if (isDragging) {
      setIsDragging(false);
    }
  }

  // --- Viewport and Center Setup --- (Keep as is)
  function handleResize() {
    setViewportSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }

  useEffect(() => {
    handleResize();
    if (CenterRef.current) {
      const rect = CenterRef.current.getBoundingClientRect();
      const X = rect.left + rect.width / 2;
      const Y = rect.top + rect.height / 2;
      setCenter({ x: X, y: Y });
    }
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [setCenter]);

  useEffect(() => {
    if (CenterRef.current) {
      const rect = CenterRef.current.getBoundingClientRect();
      const X = rect.left + rect.width / 2;
      const Y = rect.top + rect.height / 2;
      setCenter({ x: X, y: Y });
    }
  }, [viewportSize, setCenter]);

  useEffect(() => {
    setOriginStyle((prevStyle) => ({
      ...prevStyle,
      top: `${center.y}px`,
      left: `${center.x}px`,
    }));
  }, [center]);

  const dragOffsetX = isDragging ? currPosition.x - startPosition.x : 0;
  const dragOffsetY = isDragging ? currPosition.y - startPosition.y : 0;

  // --- Zoom Handler --- Only attach when viewState is "Zoom"
  const handleWheelZoom = useCallback((e) => {
    e.preventDefault();
    const zoomIntensity = 0.1;
    setScale((prevScale) => {
      let newScale =
        e.deltaY < 0
          ? prevScale * (1 + zoomIntensity)
          : prevScale / (1 + zoomIntensity);
      newScale = Math.max(0.1, Math.min(5, newScale));
      return newScale;
    });
  }, []);

  useEffect(() => {
    const container = CenterRef.current;
    if (!container || viewState !== "Zoom") return;

    container.addEventListener("wheel", handleWheelZoom, { passive: false });
    return () => container.removeEventListener("wheel", handleWheelZoom);
  }, [viewState, handleWheelZoom]);

  useEffect(() => {
    // Check if resetTrigger has incremented (ignore initial value 0)
    if (viewState === "Reset") {
      setIsDragging(false);
      setStartPosition({ x: 0, y: 0 });
      setCurrPosition({ x: 0, y: 0 });

      setScale(1);

      // 3. Reset center position to initial viewport center
      if (CenterRef.current) {
        const rect = CenterRef.current.getBoundingClientRect();
        const initialX = rect.left + rect.width / 2;
        const initialY = rect.top + rect.height / 2;
        setCenter({ x: initialX, y: initialY });
      }
    }
  }, [viewState]);

  return (
    <div
      className="displayer"
      ref={CenterRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        cursor:
          viewState === "Translate" && isDragging
            ? "grabbing"
            : viewState === "Translate"
            ? "grab"
            : hoverMode === "Point"
            ? "pointer"
            : "default",
      }}
    >
      <div className="Paint">
        <div style={originStyle}></div>
        {/* Iterate over formattedParticles */}
        {formattedParticles.map((particle, flatIndex) => {
          // Multiply coordinates by the current zoom scale
          let x = particle.xp * scale;
          let y = particle.zp * scale;

          const cosTheta = Math.cos(theta);
          const sinTheta = Math.sin(theta);
          const rotatedX = x * cosTheta - y * sinTheta;
          const rotatedY = x * sinTheta + y * cosTheta;
          x = rotatedX;
          y = rotatedY;

          return (
            <Point
              key={flatIndex}
              flatIndex={flatIndex}
              center={center}
              dragOffsetX={dragOffsetX}
              dragOffsetY={dragOffsetY}
              x={x}
              y={y}
              idPart={particle.idPart}
              hoveredGroup={hoveredGroup}
              setHoveredGroup={setHoveredGroup}
              hoverMode={hoverMode}
              onParticleClick={onParticleClick}
            />
          );
        })}
      </div>
    </div>
  );
}
