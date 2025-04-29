import { useState, useEffect } from "react";
import React from "react";

// Main component managing which view to show (list or editor)
function ParticleManager({ parts, particles, setParticles, showNotification }) {
  const [clicked, setClicked] = useState("");
  const [selectedPart, setSelectedPart] = useState(-1);
  const [tempParticles, setTempParticles] = useState([]);
  const [numParticlesPart, setNumParticlesPart] = useState(0);

  const handleClick = (partName, index, numParticles) => {
    setClicked(partName);
    setSelectedPart(index);
    setNumParticlesPart(numParticles);

    const existingParticles = particles[index];
    const defaultParticle = { xp: 0, zp: 0, up: 0, wp: 0, pm: 0 };

    if (existingParticles && existingParticles.length === numParticles) {
      setTempParticles(JSON.parse(JSON.stringify(existingParticles)));
    } else {
      const newTemp = Array(numParticles)
        .fill(null)
        .map(() => ({ ...defaultParticle }));
      setTempParticles(newTemp);
    }
  };

  const handleReturn = () => {
    setClicked("");
    setSelectedPart(-1);
    setTempParticles([]);
    setNumParticlesPart(0);
  };

  // Called only when 'Confirm' is clicked in the editor
  // MODIFIED: Accepts the final array as an argument
  const handleConfirm = (finalTempParticles) => {
    setParticles((prevParticles) => {
      const updatedParticles = [...prevParticles];
      while (updatedParticles.length <= selectedPart) {
        updatedParticles.push([]);
      }
      // Use the passed argument which contains the guaranteed latest data
      updatedParticles[selectedPart] = finalTempParticles;
      return updatedParticles;
    });
    handleReturn(); // Go back to the part list view
  };

  return (
    <div className="module-body">
      <h1 className="module-header">Particles</h1>
      {clicked === "" ? (
        <DisplayInfo parts={parts} handleClick={handleClick} />
      ) : (
        <ManageParticles
          item={clicked}
          tempParticles={tempParticles}
          setTempParticles={setTempParticles}
          npPart={numParticlesPart}
          handleReturn={handleReturn}
          handleConfirm={handleConfirm}
        />
      )}
    </div>
  );
}

// Component to display the list of parts
function DisplayInfo({ parts, handleClick }) {
  return (
    <div className="partInfoContainer">
      {parts.map((part, index) => (
        <div
          // Use a unique key for list items
          key={part.PartName || index} // Prefer PartName if unique, fallback to index
          className="partContainer"
          role="button"
          tabIndex={0} // Make it focusable
          onClick={() => handleClick(part.PartName, index, part.npPart)}
          onKeyDown={(e) => {
            // Allow activation with Enter/Space
            if (e.key === "Enter" || e.key === " ") {
              handleClick(part.PartName, index, part.npPart);
            }
          }}
        >
          {part.PartName}
        </div>
      ))}
    </div>
  );
}

// Component to manage (edit) particles for a single selected part
// Component to manage (edit) particles for a single selected part
function ManageParticles({
  item,
  tempParticles,
  setTempParticles, // Still needed for Next/Previous logic
  npPart,
  handleReturn,
  handleConfirm, // This prop function will now expect an argument
}) {
  const [count, setCount] = useState(0);
  const [form, setForm] = useState({ xp: 0, zp: 0, up: 0, wp: 0, pm: 0 });

  useEffect(() => {
    const currentParticle = tempParticles?.[count];
    if (currentParticle) {
      setForm({
        xp: currentParticle.xp ?? 0,
        zp: currentParticle.zp ?? 0,
        up: currentParticle.up ?? 0,
        wp: currentParticle.wp ?? 0,
        pm: currentParticle.pm ?? 0,
      });
    } else {
      setForm({ xp: 0, zp: 0, up: 0, wp: 0, pm: 0 });
    }
  }, [count, tempParticles]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value === "" ? "" : Number(value),
    }));
  };

  // Helper ONLY for Next/Previous: updates temp state before navigating
  const updateTempParticleDataForNav = (particleData) => {
    setTempParticles((prevTempParticles) => {
      const updated = [...prevTempParticles];
      if (updated[count]) {
        updated[count] = { ...particleData };
      }
      return updated;
    });
  };

  const handleNext = () => {
    updateTempParticleDataForNav(form); // Update state for consistency if user goes back
    if (count < npPart - 1) {
      setCount((prevCount) => prevCount + 1);
    }
  };

  const handlePrevious = () => {
    updateTempParticleDataForNav(form); // Update state for consistency
    setCount((prevCount) => Math.max(prevCount - 1, 0));
  };

  // Confirm all changes for this part
  const confirmAndExit = () => {
    // 1. Create the final version of the tempParticles array incorporating the current form data
    const finalTempParticles = tempParticles.map((particle, index) => {
      if (index === count) {
        // Use the current form data for the particle being confirmed
        return { ...form };
      }
      // Keep other particles as they are
      return particle;
    });

    // 2. Call the handleConfirm prop from the parent, passing the FINAL array
    handleConfirm(finalTempParticles);
  };

  const fieldLabels = {
    xp: "X Co-ordinate",
    zp: "Z Co-ordinate",
    up: "Velocity in X direction",
    wp: "Velocity in Z direction",
    pm: "Volume of the particle",
  };

  return (
    <>
      <p className="module-p">
        Manage particle {count + 1} of {npPart} for {item}
      </p>
      <div className="partInfoContainer module-form-grid">
        {Object.keys(fieldLabels).map((key) => (
          <React.Fragment key={key}>
            <label htmlFor={key}>{fieldLabels[key]}</label>
            <input
              id={key}
              name={key}
              onChange={handleChange}
              value={form[key]}
              placeholder={fieldLabels[key]}
              aria-label={fieldLabels[key]}
              type="number"
              style={{
                boxSizing: "border-box",
                height: "30px",
                borderRadius: "10px",
                paddingLeft: "5px",
              }}
            />
          </React.Fragment>
        ))}
      </div>

      <div style={{ marginTop: "20px" }}>
        <button className="module-button-red" onClick={handleReturn}>
          Cancel
        </button>
        <button
          className="module-button"
          onClick={handlePrevious}
          disabled={count === 0}
        >
          Previous
        </button>
        {count < npPart - 1 ? (
          <button className="module-button-green" onClick={handleNext}>
            Next
          </button>
        ) : (
          <button className="module-button-green" onClick={confirmAndExit}>
            Confirm
          </button>
        )}
      </div>
    </>
  );
}

export default ParticleManager;
