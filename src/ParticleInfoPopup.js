import React from "react";
import "./ParticleInfoPopup.css"; // Make sure this CSS file exists and is styled

export default function ParticleInfoPopup({
  particleInfo,
  onClose,
  onAddBoundaryCondition,
  onRemoveBoundaryCondition,
  particleBoundaryConditions, // The array tracking BC status
}) {
  // --- Input Validation ---
  if (
    !particleInfo ||
    typeof particleInfo.flatIndex !== "number" ||
    typeof particleInfo.particle !== "object" ||
    particleInfo.particle === null ||
    !Array.isArray(particleBoundaryConditions) // Check if tracker array is valid
  ) {
    console.warn("ParticleInfoPopup received invalid data or missing props:", {
      particleInfo,
      particleBoundaryConditions,
    });
    return null; // Don't render if data is missing or malformed
  }

  // --- Destructure Data ---
  const { flatIndex, particle } = particleInfo;
  const { idPart, xp, zp, mass, id } = particle;

  // --- Check Boundary Condition Status ---
  // Ensure flatIndex is within the bounds of the tracker array
  const hasBoundaryCondition =
    flatIndex >= 0 &&
    flatIndex < particleBoundaryConditions.length &&
    particleBoundaryConditions[flatIndex] === 1;

  // --- Event Handlers ---
  const handleAddClick = () => {
    onAddBoundaryCondition(particleInfo);
  };

  const handleRemoveClick = () => {
    onRemoveBoundaryCondition(particleInfo);
  };

  // --- Rendering ---
  return (
    <div className="particle-info-popup">
      <div className="popup-content">
        <h3>Particle Information</h3>

        <p>
          <strong>Particle Index (Flat):</strong> {flatIndex}
        </p>
        <p>
          <strong>Part / Group (idPart):</strong> {idPart}
        </p>
        {id !== undefined && (
          <p>
            <strong>Original ID:</strong> {id}
          </p>
        )}
        <p>
          <strong>Position (xp, zp):</strong> ({xp?.toFixed(3) ?? "N/A"},{" "}
          {zp?.toFixed(3) ?? "N/A"})
        </p>
        {mass !== undefined && (
          <p>
            <strong>Mass:</strong> {mass}
          </p>
        )}
        {/* Indicate BC Status */}
        <p>
          <strong>Boundary Condition:</strong>{" "}
          {hasBoundaryCondition ? "Applied" : "None"}
        </p>

        {/* Add more fields here as needed */}

        {/* --- Conditional Button Rendering --- */}
        <div className="popup-buttons">
          <button onClick={onClose} className="popup-button back-button">
            Back
          </button>
          {/* Check 'hasBoundaryCondition' to decide which button to show */}
          {hasBoundaryCondition ? (
            // If BC exists, show the "Remove" button
            <button
              onClick={handleRemoveClick} // Call the remove handler
              className="popup-button remove-bc-button" // Use a specific class for styling if needed
            >
              Remove Boundary Condition
            </button>
          ) : (
            // If no BC exists, show the "Add" button
            <button
              onClick={handleAddClick} // Call the add handler
              className="popup-button add-bc-button"
            >
              Add Boundary Condition
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
