// GreetingPage.jsx
import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import parseDXF from "./DXFRead";
import NavBar from "./GreetingNavbar";

const GreetingPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const handleStartFromScratch = () => {
    // Navigate to editor with empty parts and particles arrays.
    navigate("/editor", { state: { parts: [], particles: [] } });
  };

  const handleUploadClick = () => {
    // Programmatically trigger the file input dialog.
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const parsedData = await parseDXF(file);
        // Navigate to editor with the parsed data (parts and particles).
        navigate("/editor", { state: parsedData });
      } catch (error) {
        console.error("Error parsing DXF:", error);
        // Optionally: provide feedback to the user regarding the error.
      }
    }
  };

  return (
    <div className="greetingsContainer">
      <NavBar></NavBar>
      <div className="greetingHeaderHolder">
        <h1 className="greetingGreeting">Welcome to CEGUI, Do you want to?</h1>
      </div>
      <div className="greetingButtonHolder">
        <button className="cta1" onClick={handleStartFromScratch}>
          <div className="cta-container">
            <span>Start from Scratch</span>
            <svg width="15px" height="10px" viewBox="0 0 13 10">
              <path d="M1,5 L11,5"></path>
              <polyline points="8 1 12 5 8 9"></polyline>
            </svg>
          </div>
        </button>
        <button className="cta2" onClick={handleUploadClick}>
          <div className="cta-container">
            <span>Upload a DXF File</span>
            <svg width="15px" height="10px" viewBox="0 0 13 10">
              <path d="M1,5 L11,5"></path>
              <polyline points="8 1 12 5 8 9"></polyline>
            </svg>
          </div>
        </button>
        {/* Hidden file input */}
        <input
          type="file"
          accept=".dxf"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileUpload}
        />
      </div>
    </div>
  );
};

export default GreetingPage;
