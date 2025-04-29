import { useState } from "react";

// Main component remains largely the same structurally
function AssignMaterial({
  parts,
  mats,
  setPartMat, // This state update logic remains the same
  setCurrentStatus,
  showNotification,
}) {
  // State now tracks the clicked *part*
  const [numClicks, setNumClicks] = useState(0);
  const [clickedPartName, setClickedPartName] = useState(null); // Renamed for clarity

  // handleClick now operates on part items
  function handleClick({ item }) {
    // item will be a part object
    if (clickedPartName === item.PartName) {
      setNumClicks((prev) => prev + 1);
      if (numClicks === 1) {
        setClickedPartName(null); // Collapse on double click
        setNumClicks(0);
      }
    } else {
      setNumClicks(1);
      setClickedPartName(item.PartName); // Expand this part
    }
  }

  return (
    <div className="module-body">
      <h1>Assign Material</h1>
      {/* Pass parts as the primary list to display */}
      <DisplayPartInfo
        parts={parts} // Pass parts as the main list
        mats={mats} // Pass materials for the dropdown
        clickedPartName={clickedPartName}
        handleClick={handleClick}
        setPartMat={setPartMat}
        showNotification={showNotification}
        setCurrentStatus={setCurrentStatus}
      />
    </div>
  );
}

// Renamed to reflect it displays Part info primarily
function DisplayPartInfo({
  parts, // Now iterates over parts
  mats,
  clickedPartName,
  handleClick,
  setPartMat,
  showNotification,
  setCurrentStatus,
}) {
  return (
    <div className="partInfoContainer">
      {/* Map over parts instead of mats */}
      {parts.map((part, index) => (
        <PartInfoComplete
          key={part.PartName} // Use a unique key
          clickedPartName={clickedPartName}
          item={part} // Pass the part item
          handleClick={handleClick}
          mats={mats} // Pass materials down for the dropdown
          setPartMat={setPartMat}
          partIndex={index} // Pass the index of the part
          showNotification={showNotification}
          setCurrentStatus={setCurrentStatus}
          parts={parts} // Pass parts down for status message
        />
      ))}
    </div>
  );
}

// Renamed: Represents the clickable part header
function PartInfo({ children, handleClick, item }) {
  // item is a part
  return (
    // Use item.PartName for comparison or identification if needed later
    <div role="button" onClick={() => handleClick({ item })}>
      {children}
    </div>
  );
}

// Renamed: Contains the material selection dropdown for a part
function PartDetails({
  partIndex, // Index of the part being modified
  mats, // List of available materials
  parts, // List of parts (needed for status message)
  setPartMat,
  showNotification,
  setCurrentStatus,
}) {
  const handleChange = (event) => {
    const selectedMatIndex = parseInt(event.target.value, 10); // Index of the selected material

    // Check if a valid material is selected (not the default "Select...")
    if (isNaN(selectedMatIndex)) {
      // Optionally handle the case where "Select..." is chosen again
      // Maybe reset the material for this part? Or just do nothing.
      // For now, we'll just prevent update if "Select..." is chosen.
      return;
    }

    showNotification("success", "Material assigned!");

    // Update status: "MaterialName is assigned to PartName"
    setCurrentStatus((prev) => [
      ...prev,
      `${mats[selectedMatIndex].MaterialName} is assigned to ${parts[partIndex].PartName}`,
    ]);

    // Update the partMat array: part at 'partIndex' gets 'selectedMatIndex' material
    setPartMat((prev) => {
      const updated = [...prev];
      updated[partIndex] = selectedMatIndex; // Correctly update the part's material index
      return updated;
    });
  };

  return (
    <div className="partDetails" style={{ height: "30px" }}>
      {/* Changed label */}
      <label>Select a Material:</label>
      {/* Dropdown now lists materials */}
      <select
        id={`material-dropdown-${partIndex}`}
        onChange={handleChange}
        defaultValue=""
      >
        {" "}
        {/* Use defaultValue for uncontrolled component */}
        <option value="">Select...</option> {/* Default empty value */}
        {mats.map((mat, index) => (
          <option key={mat.MaterialName} value={index}>
            {" "}
            {/* Value is the material index */}
            {mat.MaterialName}
          </option>
        ))}
      </select>
    </div>
  );
}

// Renamed: The complete container for one part (header + details)
function PartInfoComplete({
  clickedPartName,
  item, // This is a part object
  handleClick,
  mats, // Pass materials down
  setPartMat,
  partIndex, // Index of the current part
  showNotification,
  setCurrentStatus,
  parts, // Pass parts down
}) {
  const isClicked = clickedPartName === item.PartName;

  return (
    <div
      className={
        isClicked ? "partContainer partContainerClicked" : "partContainer"
      }
      // Keep dynamic height styling
      style={isClicked ? { height: "25%" } : { height: "10%" }}
    >
      {/* Render the PartInfo header */}
      <PartInfo handleClick={handleClick} item={item}>
        {isClicked ? "-" : "+"} {item.PartName} {/* Display Part Name */}
      </PartInfo>
      {/* Conditionally render PartDetails (material dropdown) */}
      {isClicked ? (
        <PartDetails
          partIndex={partIndex} // Pass the part's index
          mats={mats} // Pass the list of materials
          parts={parts} // Pass the list of parts
          setPartMat={setPartMat}
          showNotification={showNotification}
          setCurrentStatus={setCurrentStatus}
        />
      ) : null}
    </div>
  );
}

export default AssignMaterial;
