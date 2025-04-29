import Button from "./Button";

export default function File({
  parts,
  mats,
  iPartMat,
  particles,
  setParts,
  setMats,
  setIPartMat,
  setParticles,
  setFileClicked,
  setCurrNav,
  setCurrentStatus,
  setFolderPath,
  boundary,
}) {
  const handleSelectFolder = async () => {
    const selectedPath = await window.electronAPI.selectFolder();
    if (selectedPath) {
      setFolderPath(selectedPath);
      setCurrentStatus((currStat) => [
        ...currStat,
        `The output directory is set to ${selectedPath}`,
      ]);
    }
  };
  // Save all data into one master JSON file (inside a folder)
  const handleSaveFile = async () => {
    try {
      const result = await window.electronAPI.saveJsonFile({
        parts,
        mats,
        iPartMat,
        particles,
        boundary,
      });
      if (result) {
        console.log("Master JSON file saved successfully in folder:", result);
      } else {
        console.log("Save operation was canceled");
      }
    } catch (error) {
      console.error("Error saving master JSON file:", error);
    }
    setFileClicked(false);
  };

  // "New" will save the current data then clear all data states.
  const handleNewFile = async () => {
    try {
      const result = await window.electronAPI.saveJsonFile({
        parts,
        mats,
        iPartMat,
        particles,
        boundary,
      });
      if (result) {
        console.log("New file saved successfully. Clearing current data.");
        // Reset all states to empty arrays
        setParts([]);
        setMats([]);
        setIPartMat([]);
        setParticles([]);
      } else {
        console.log("Save operation was canceled");
      }
    } catch (error) {
      console.error("Error saving new file:", error);
    }
    setFileClicked(false);
    setCurrNav("Part");
  };

  // Open a master JSON file and initialize the state values.
  const handleOpenFile = async () => {
    try {
      const data = await window.electronAPI.openJsonFile();
      if (data) {
        console.log("Master JSON file loaded successfully:", data);
        // Initialize each piece of state from the loaded data.
        // Defaults are set to empty arrays.
        setParts(data.parts || []);
        setMats(data.mats || []);
        setIPartMat(data.iPartMat || []);
        setParticles(data.particles || []);
      } else {
        console.log("No file selected or invalid JSON.");
      }
    } catch (error) {
      console.error("Error opening file:", error);
    }
    setFileClicked(false);
  };

  return (
    <div className="fileClass">
      <Button className="FileButton" handler={handleSelectFolder} width="140px">
        Set Directory
      </Button>
      <Button className="FileButton" handler={handleNewFile} width="140px">
        New
      </Button>
      <Button className="FileButton" handler={handleSaveFile} width="140px">
        Save
      </Button>
      <Button className="FileButton" handler={handleOpenFile} width="140px">
        Open
      </Button>
    </div>
  );
}
