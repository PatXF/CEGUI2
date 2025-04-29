import React, { useState } from "react"; // Import React if using Fragment <> </>

// --- MaterialManager Component (Unchanged from your original, except maybe handleCreate/handleDelete logic) ---
function MaterialManager({ mats, setMats, showNotification }) {
  const [createClicked, setCreateClicked] = useState(false);
  const [deleteClicked, setDeleteClicked] = useState(false);
  const [numClicks, setNumClicks] = useState(0);
  const [clicked, setClicked] = useState("");

  // Slightly improved logic to ensure only one view (create/delete) is active
  const handleCreate = () => {
    setCreateClicked(true);
    setDeleteClicked(false); // Close delete view if open
    setClicked(null); // Reset selection
    setNumClicks(0);
  };

  const handleDelete = () => {
    setDeleteClicked(true);
    setCreateClicked(false); // Close create view if open
    setClicked(null); // Reset selection
    setNumClicks(0);
  };

  function handleClick({ item }) {
    // Prevent expanding items when create or delete is active
    if (createClicked || deleteClicked) return;

    if (clicked === item.MaterialName) {
      setNumClicks((prev) => prev + 1);
      if (numClicks === 1) {
        setClicked(null);
        setNumClicks(0);
      }
    } else {
      setNumClicks(1);
      setClicked(item.MaterialName);
    }
  }

  function handleCancel() {
    setCreateClicked(false);
    setDeleteClicked(false);
  }

  const addMat = (newMat) => {
    // Basic check for duplicate name before adding
    if (mats.some((mat) => mat.MaterialName === newMat.MaterialName)) {
      showNotification(
        "warning",
        `Material with name "${newMat.MaterialName}" already exists. Please use a unique name.`
      );
      return; // Prevent adding duplicate
    }
    setMats([...mats, newMat]);
    setCreateClicked(false); // Hide form after submission
  };

  let content;

  if (createClicked) {
    content = (
      <>
        <button onClick={handleCancel} className="module-button-red">
          Cancel
        </button>
        {/* Pass existing names for validation */}
        <CreateMatContainer
          onAddMat={addMat}
          existingMaterialNames={mats.map((m) => m.MaterialName)}
          showNotification={showNotification}
        />
      </>
    );
  } else if (deleteClicked) {
    content = (
      <>
        <button onClick={handleCancel} className="module-button-red">
          Cancel
        </button>
        <DeleteMatContainer
          setMats={setMats}
          mats={mats}
          showNotification={showNotification}
        ></DeleteMatContainer>
      </>
    );
  } else {
    content = (
      <>
        <button onClick={handleCreate} className="module-button">
          Create Material
        </button>
        {mats.length > 0 ? (
          <button onClick={handleDelete} className="module-button-red">
            Delete Material
          </button>
        ) : (
          <> </>
        )}
        <DisplayInfo
          mats={mats}
          clicked={clicked}
          handleClick={handleClick}
        ></DisplayInfo>
      </>
    );
  }

  return (
    <div className="module-body">
      <h1 className="module-header">Materials</h1>
      {content}
    </div>
  );
}

// --- Revised CreateMatContainer ---
function CreateMatContainer({
  onAddMat,
  existingMaterialNames,
  showNotification,
}) {
  // Define the initial state with all parameters at the top level
  const getInitialFormState = () => ({
    MaterialName: "",
    Rhog: "",
    Eg: "",
    Nug: "",
    Yg: "",
    TypMat: "",
    TypEOS: "",
    TypHard: "",
    TypDamage: "",

    // JC Parameters (Prefixed with JC_)
    JC_A: "",
    JC_B: "",
    JC_n: "",
    JC_C: "",
    JC_m: "",
    JC_Tm: "",
    JC_Tr: "",

    // JC Damage Parameters (Prefixed with JCD_)
    JCD_D1: "",
    JCD_D2: "",
    JCD_D3: "",
    JCD_D4: "",
    JCD_D5: "",

    // EOS JH1 Parameters (Prefixed with EOSJH1_)
    EOSJH1_K1: "",
    EOSJH1_K2: "",
    EOSJH1_K3: "",
    EOSJH1_Pmin: "",
    EOSJH1_T: "",

    // EOS JH2 Parameters (Prefixed with EOSJH2_)
    // **NOTE**: Adjust these names if they overlap or need differentiation from JH1/JC
    EOSJH2_K1: "",
    EOSJH2_K2: "",
    EOSJH2_K3: "",
    EOSJH2_Pmin: "",
    EOSJH2_T: "",
    EOSJH2_A: "",
    EOSJH2_B: "",
    EOSJH2_n: "",
  });

  const [form, setForm] = useState(getInitialFormState());

  // Simple handleChange works fine for flat state
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = () => {
    // Validation for duplicate name
    if (existingMaterialNames.includes(form.MaterialName)) {
      showNotification(
        "warning",
        `MaterialName '${form.MaterialName}' already exists. Please use a unique name.`
      );
      return; // Stop submission
    }
    // Basic validation for name
    if (!form.MaterialName.trim()) {
      showNotification("warning", "Material Name cannot be empty.");
      return;
    }
    // Add more specific validation as needed here (e.g., check if numbers are valid)

    // Convert relevant fields to numbers before adding
    // Use Number() or parseFloat(); handle empty strings appropriately (e.g., convert to null or 0)
    const dataToAdd = {
      ...form,
      Rhog: form.Rhog === "" ? null : Number(form.Rhog),
      Eg: form.Eg === "" ? null : Number(form.Eg),
      Nug: form.Nug === "" ? null : Number(form.Nug),
      Yg: form.Yg === "" ? null : Number(form.Yg),

      // Convert JC params (only if TypHard is JC)
      JC_A:
        form.TypHard === "JC" && form.JC_A !== ""
          ? Number(form.JC_A)
          : form.JC_A, // Keep empty string or null if not applicable/entered
      JC_B:
        form.TypHard === "JC" && form.JC_B !== ""
          ? Number(form.JC_B)
          : form.JC_B,
      JC_n:
        form.TypHard === "JC" && form.JC_n !== ""
          ? Number(form.JC_n)
          : form.JC_n,
      JC_C:
        form.TypHard === "JC" && form.JC_C !== ""
          ? Number(form.JC_C)
          : form.JC_C,
      JC_m:
        form.TypHard === "JC" && form.JC_m !== ""
          ? Number(form.JC_m)
          : form.JC_m,
      JC_Tm:
        form.TypHard === "JC" && form.JC_Tm !== ""
          ? Number(form.JC_Tm)
          : form.JC_Tm,
      JC_Tr:
        form.TypHard === "JC" && form.JC_Tr !== ""
          ? Number(form.JC_Tr)
          : form.JC_Tr,

      // Convert JC Damage params (only if TypDamage is JC)
      JCD_D1:
        form.TypDamage === "JC" && form.JCD_D1 !== ""
          ? Number(form.JCD_D1)
          : form.JCD_D1,
      JCD_D2:
        form.TypDamage === "JC" && form.JCD_D2 !== ""
          ? Number(form.JCD_D2)
          : form.JCD_D2,
      JCD_D3:
        form.TypDamage === "JC" && form.JCD_D3 !== ""
          ? Number(form.JCD_D3)
          : form.JCD_D3,
      JCD_D4:
        form.TypDamage === "JC" && form.JCD_D4 !== ""
          ? Number(form.JCD_D4)
          : form.JCD_D4,
      JCD_D5:
        form.TypDamage === "JC" && form.JCD_D5 !== ""
          ? Number(form.JCD_D5)
          : form.JCD_D5,

      // Convert EOS JH1 params (only if TypEOS is JH1)
      EOSJH1_K1:
        form.TypEOS === "JH1" && form.EOSJH1_K1 !== ""
          ? Number(form.EOSJH1_K1)
          : form.EOSJH1_K1,
      EOSJH1_K2:
        form.TypEOS === "JH1" && form.EOSJH1_K2 !== ""
          ? Number(form.EOSJH1_K2)
          : form.EOSJH1_K2,
      EOSJH1_K3:
        form.TypEOS === "JH1" && form.EOSJH1_K3 !== ""
          ? Number(form.EOSJH1_K3)
          : form.EOSJH1_K3,
      EOSJH1_Pmin:
        form.TypEOS === "JH1" && form.EOSJH1_Pmin !== ""
          ? Number(form.EOSJH1_Pmin)
          : form.EOSJH1_Pmin,
      EOSJH1_T:
        form.TypEOS === "JH1" && form.EOSJH1_T !== ""
          ? Number(form.EOSJH1_T)
          : form.EOSJH1_T,

      // Convert EOS JH2 params (only if TypEOS is JH2)
      EOSJH2_K1:
        form.TypEOS === "JH2" && form.EOSJH2_K1 !== ""
          ? Number(form.EOSJH2_K1)
          : form.EOSJH2_K1,
      EOSJH2_K2:
        form.TypEOS === "JH2" && form.EOSJH2_K2 !== ""
          ? Number(form.EOSJH2_K2)
          : form.EOSJH2_K2,
      EOSJH2_K3:
        form.TypEOS === "JH2" && form.EOSJH2_K3 !== ""
          ? Number(form.EOSJH2_K3)
          : form.EOSJH2_K3,
      EOSJH2_Pmin:
        form.TypEOS === "JH2" && form.EOSJH2_Pmin !== ""
          ? Number(form.EOSJH2_Pmin)
          : form.EOSJH2_Pmin,
      EOSJH2_T:
        form.TypEOS === "JH2" && form.EOSJH2_T !== ""
          ? Number(form.EOSJH2_T)
          : form.EOSJH2_T,
      EOSJH2_A:
        form.TypEOS === "JH2" && form.EOSJH2_A !== ""
          ? Number(form.EOSJH2_A)
          : form.EOSJH2_A,
      EOSJH2_B:
        form.TypEOS === "JH2" && form.EOSJH2_B !== ""
          ? Number(form.EOSJH2_B)
          : form.EOSJH2_B,
      EOSJH2_n:
        form.TypEOS === "JH2" && form.EOSJH2_n !== ""
          ? Number(form.EOSJH2_n)
          : form.EOSJH2_n,
    };

    onAddMat(dataToAdd);

    // Reset the form to initial state (clears all fields)
    setForm(getInitialFormState());
  };

  const inputStyle = {
    boxSizing: "border-box",
    height: "30px",
    borderRadius: "10px",
    paddingLeft: "5px",
    width: "100%", // Ensure inputs take full width
    marginBottom: "8px", // Add some spacing below inputs
  };
  const selectStyle = {
    boxSizing: "border-box",
    height: "35px",
    borderRadius: "10px",
    paddingLeft: "5px",
    width: "100%",
    marginBottom: "8px",
  };
  const sectionHeaderStyle = {
    marginTop: "15px",
    marginBottom: "5px",
    fontWeight: "bold",
    fontSize: "0.9em",
    borderBottom: "1px solid #ccc",
    paddingBottom: "3px",
  };

  const dropdownOptions = {
    TypMat: ["Elastic", "Plastic", "Hardening"],
    TypEOS: ["Linear", "JH1", "JH2"], // Make sure these values match checks below
    TypHard: ["None", "JC"], // Make sure these values match checks below
    TypDamage: ["None", "JC"], // Make sure these values match checks below
  };

  const fieldLabels = {
    MaterialName: "Material Name",
    Rhog: "Density",
    Eg: "Elastic Modulus",
    Nug: "Poisson's Ratio",
    Yg: "Yield Strength",
    TypMat: "Material Type",
    TypEOS: "Equation of State",
    TypHard: "Hardening Type",
    TypDamage: "Damage Model",
  };

  return (
    <div
      className="partInfoContainer"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "5px", // Keep small gap
        overflowY: "auto", // Allow scrolling
        maxHeight: "calc(100vh - 200px)", // Prevent excessive height
        padding: "15px", // Add padding
        border: "1px solid #eee", // Optional border
        marginTop: "10px", // Space below cancel button
        borderRadius: "5px", // Optional rounding
      }}
    >
      {/* --- Basic Info --- */}
      <input
        name="MaterialName"
        value={form.MaterialName}
        onChange={handleChange}
        placeholder={fieldLabels.MaterialName}
        aria-label={fieldLabels.MaterialName}
        style={{ ...inputStyle, marginTop: "0px" }} // No top margin needed due to padding
      />
      {["Rhog", "Eg", "Nug", "Yg"].map((key) => (
        <input
          key={key}
          name={key}
          value={form[key]}
          onChange={handleChange}
          placeholder={fieldLabels[key]}
          aria-label={fieldLabels[key]}
          type="number" // Use number type for better input handling
          step="any" // Allow decimals
          style={inputStyle}
        />
      ))}
      {Object.keys(dropdownOptions).map((key) => (
        <select
          key={key}
          name={key}
          value={form[key]}
          onChange={handleChange}
          aria-label={fieldLabels[key]}
          style={selectStyle}
        >
          <option value="">Select {fieldLabels[key]}</option>
          {dropdownOptions[key].map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ))}

      {/* --- Conditionally Rendered JC Hardening Parameters --- */}
      {form.TypHard === "JC" && (
        // Use React.Fragment to group without adding extra DOM nodes
        <React.Fragment>
          <div style={sectionHeaderStyle}>Johnson-Cook Plasticity (JC)</div>
          <input
            name="JC_A"
            value={form.JC_A}
            onChange={handleChange}
            placeholder="JC A (Yield Stress)"
            type="number"
            step="any"
            style={inputStyle}
          />
          <input
            name="JC_B"
            value={form.JC_B}
            onChange={handleChange}
            placeholder="JC B (Hardening Coeff)"
            type="number"
            step="any"
            style={inputStyle}
          />
          <input
            name="JC_n"
            value={form.JC_n}
            onChange={handleChange}
            placeholder="JC n (Hardening Exp)"
            type="number"
            step="any"
            style={inputStyle}
          />
          <input
            name="JC_C"
            value={form.JC_C}
            onChange={handleChange}
            placeholder="JC C (Strain Rate Coeff)"
            type="number"
            step="any"
            style={inputStyle}
          />
          <input
            name="JC_m"
            value={form.JC_m}
            onChange={handleChange}
            placeholder="JC m (Thermal Softening Exp)"
            type="number"
            step="any"
            style={inputStyle}
          />
          <input
            name="JC_Tm"
            value={form.JC_Tm}
            onChange={handleChange}
            placeholder="JC Tm (Melt Temp)"
            type="number"
            step="any"
            style={inputStyle}
          />
          <input
            name="JC_Tr"
            value={form.JC_Tr}
            onChange={handleChange}
            placeholder="JC Tr (Ref Temp)"
            type="number"
            step="any"
            style={inputStyle}
          />
        </React.Fragment>
      )}

      {/* --- Conditionally Rendered JC Damage Parameters --- */}
      {form.TypDamage === "JC" && (
        <React.Fragment>
          <div style={sectionHeaderStyle}>Johnson-Cook Damage (JC_D)</div>
          <input
            name="JCD_D1"
            value={form.JCD_D1}
            onChange={handleChange}
            placeholder="JC D1"
            type="number"
            step="any"
            style={inputStyle}
          />
          <input
            name="JCD_D2"
            value={form.JCD_D2}
            onChange={handleChange}
            placeholder="JC D2"
            type="number"
            step="any"
            style={inputStyle}
          />
          <input
            name="JCD_D3"
            value={form.JCD_D3}
            onChange={handleChange}
            placeholder="JC D3"
            type="number"
            step="any"
            style={inputStyle}
          />
          <input
            name="JCD_D4"
            value={form.JCD_D4}
            onChange={handleChange}
            placeholder="JC D4"
            type="number"
            step="any"
            style={inputStyle}
          />
          <input
            name="JCD_D5"
            value={form.JCD_D5}
            onChange={handleChange}
            placeholder="JC D5"
            type="number"
            step="any"
            style={inputStyle}
          />
        </React.Fragment>
      )}

      {/* --- Conditionally Rendered EOS JH1 Parameters --- */}
      {form.TypEOS === "JH1" && (
        <React.Fragment>
          <div style={sectionHeaderStyle}>
            EOS Johnson-Holmquist 1 (EOS_JH1)
          </div>
          <input
            name="EOSJH1_K1"
            value={form.EOSJH1_K1}
            onChange={handleChange}
            placeholder="JH1 K1 (Bulk Modulus)"
            type="number"
            step="any"
            style={inputStyle}
          />
          <input
            name="EOSJH1_K2"
            value={form.EOSJH1_K2}
            onChange={handleChange}
            placeholder="JH1 K2"
            type="number"
            step="any"
            style={inputStyle}
          />
          <input
            name="EOSJH1_K3"
            value={form.EOSJH1_K3}
            onChange={handleChange}
            placeholder="JH1 K3"
            type="number"
            step="any"
            style={inputStyle}
          />
          <input
            name="EOSJH1_Pmin"
            value={form.EOSJH1_Pmin}
            onChange={handleChange}
            placeholder="JH1 Pmin (Min Pressure)"
            type="number"
            step="any"
            style={inputStyle}
          />
          <input
            name="EOSJH1_T"
            value={form.EOSJH1_T}
            onChange={handleChange}
            placeholder="JH1 T (Tensile Strength)"
            type="number"
            step="any"
            style={inputStyle}
          />
        </React.Fragment>
      )}

      {/* --- Conditionally Rendered EOS JH2 Parameters --- */}
      {form.TypEOS === "JH2" && (
        <React.Fragment>
          <div style={sectionHeaderStyle}>
            EOS Johnson-Holmquist 2 (EOS_JH2)
          </div>
          <input
            name="EOSJH2_K1"
            value={form.EOSJH2_K1}
            onChange={handleChange}
            placeholder="JH2 K1"
            type="number"
            step="any"
            style={inputStyle}
          />
          <input
            name="EOSJH2_K2"
            value={form.EOSJH2_K2}
            onChange={handleChange}
            placeholder="JH2 K2"
            type="number"
            step="any"
            style={inputStyle}
          />
          <input
            name="EOSJH2_K3"
            value={form.EOSJH2_K3}
            onChange={handleChange}
            placeholder="JH2 K3"
            type="number"
            step="any"
            style={inputStyle}
          />
          <input
            name="EOSJH2_Pmin"
            value={form.EOSJH2_Pmin}
            onChange={handleChange}
            placeholder="JH2 Pmin"
            type="number"
            step="any"
            style={inputStyle}
          />
          <input
            name="EOSJH2_T"
            value={form.EOSJH2_T}
            onChange={handleChange}
            placeholder="JH2 T"
            type="number"
            step="any"
            style={inputStyle}
          />
          <input
            name="EOSJH2_A"
            value={form.EOSJH2_A}
            onChange={handleChange}
            placeholder="JH2 A (Intact Strength)"
            type="number"
            step="any"
            style={inputStyle}
          />
          <input
            name="EOSJH2_B"
            value={form.EOSJH2_B}
            onChange={handleChange}
            placeholder="JH2 B (Fracture Strength)"
            type="number"
            step="any"
            style={inputStyle}
          />
          <input
            name="EOSJH2_n"
            value={form.EOSJH2_n}
            onChange={handleChange}
            placeholder="JH2 n (Strength Hardening)"
            type="number"
            step="any"
            style={inputStyle}
          />
        </React.Fragment>
      )}

      <button
        onClick={handleSubmit}
        className="module-button-green"
        style={{ marginTop: "15px" }}
      >
        Add Material
      </button>
    </div>
  );
}

// --- DeleteMatContainer (Added simple confirmation) ---
function DeleteMatContainer({ mats, setMats, showNotification }) {
  const deleteMat = (matName) => {
    setMats((prevMats) =>
      prevMats.filter((mat) => mat.MaterialName !== matName)
    );
    showNotification("success", `${matName} deleted successfully!`);
  };
  return (
    <div className="partInfoContainer">
      {mats.length > 0 ? (
        mats.map(
          (
            mat // Use MaterialName for key if unique
          ) => (
            <div
              // Use index as key only if MaterialName might not be unique, otherwise MaterialName is better
              key={mat.MaterialName}
              className="partContainer partContainer-delete" // Add a class for potential styling
              role="button"
              onClick={() => deleteMat(mat.MaterialName)}
              style={{
                cursor: "pointer",
                border: "1px dashed red",
                marginBottom: "5px",
                padding: "5px 8px",
              }} // Example style
            >
              {mat.MaterialName} (Click to delete)
            </div>
          )
        )
      ) : (
        <p>No materials to delete.</p>
      )}
    </div>
  );
}

// --- DisplayInfo (Unchanged) ---
function DisplayInfo({ mats, clicked, handleClick }) {
  return (
    <div className="partInfoContainer">
      {mats.map(
        (
          mat // Use MaterialName for key if unique
        ) => (
          <MatInfoComplete
            key={mat.MaterialName}
            clicked={clicked}
            item={mat}
            handleClick={handleClick}
          ></MatInfoComplete>
        )
      )}
    </div>
  );
}

// --- MatInfo (Unchanged) ---
function MatInfo({ children, handleClick, item }) {
  return (
    <div role="button" onClick={() => handleClick({ item })}>
      {children}
    </div>
  );
}

// --- Revised MatDetails ---
function MatDetails({ item }) {
  // Helper function to render a label and disabled input pair
  // Checks if the value exists (is not null/undefined/empty string) before rendering
  const renderDetailField = (label, value) => {
    // Check for null, undefined, or empty string. Display '-' or similar if empty?
    const displayValue =
      value !== null && value !== undefined && value !== "" ? value : "-";
    if (value === null || value === undefined || value === "") return null; // Or optionally render with '-'

    return (
      // Using Fragment to avoid unnecessary divs per field
      <>
        <label style={{ justifyContent: "center", paddingRight: "5px" }}>
          {label}:
        </label>
        {/* Use value prop for disabled inputs */}
        <input disabled value={displayValue} />
      </>
    );
  };

  const detailGridStyle = {
    display: "grid",
    gridTemplateColumns: "auto 1fr", // Label takes needed space, input takes rest
    gap: "2px 8px", // Small row gap, larger column gap
    alignItems: "center", // Vertically align items in the grid row
    marginTop: "5px",
    marginBottom: "10px",
    fontSize: "0.9em",
  };
  const sectionHeaderStyle = {
    marginTop: "10px",
    marginBottom: "5px",
    fontWeight: "bold",
    fontSize: "0.9em",
    borderBottom: "1px solid #eee",
    paddingBottom: "2px",
  };

  return (
    <div className="partDetails" style={{ paddingLeft: "20px" }}>
      {" "}
      {/* Indent details */}
      {/* Basic Properties */}
      <div style={detailGridStyle}>
        {renderDetailField("Density", item.Rhog)}
        {renderDetailField("Young's Modulus", item.Eg)}
        {renderDetailField("Poisson's Ratio", item.Nug)}
        {renderDetailField("Yield Stress", item.Yg)}
        {renderDetailField("Material Type", item.TypMat)}
        {renderDetailField("State Equation", item.TypEOS)}
        {renderDetailField("Hardening", item.TypHard)}
        {renderDetailField("Damage", item.TypDamage)}
      </div>
      {/* Conditionally Display JC Parameters */}
      {item.TypHard === "JC" && (
        <>
          <div style={sectionHeaderStyle}>JC Parameters</div>
          <div style={detailGridStyle}>
            {renderDetailField("JC A", item.JC_A)}
            {renderDetailField("JC B", item.JC_B)}
            {renderDetailField("JC n", item.JC_n)}
            {renderDetailField("JC C", item.JC_C)}
            {renderDetailField("JC m", item.JC_m)}
            {renderDetailField("JC Tm", item.JC_Tm)}
            {renderDetailField("JC Tr", item.JC_Tr)}
          </div>
        </>
      )}
      {/* Conditionally Display JC Damage Parameters */}
      {item.TypDamage === "JC" && (
        <>
          <div style={sectionHeaderStyle}>JC Damage Parameters</div>
          <div style={detailGridStyle}>
            {renderDetailField("JC D1", item.JCD_D1)}
            {renderDetailField("JC D2", item.JCD_D2)}
            {renderDetailField("JC D3", item.JCD_D3)}
            {renderDetailField("JC D4", item.JCD_D4)}
            {renderDetailField("JC D5", item.JCD_D5)}
          </div>
        </>
      )}
      {/* Conditionally Display EOS JH1 Parameters */}
      {item.TypEOS === "JH1" && (
        <>
          <div style={sectionHeaderStyle}>EOS JH1 Parameters</div>
          <div style={detailGridStyle}>
            {renderDetailField("JH1 K1", item.EOSJH1_K1)}
            {renderDetailField("JH1 K2", item.EOSJH1_K2)}
            {renderDetailField("JH1 K3", item.EOSJH1_K3)}
            {renderDetailField("JH1 Pmin", item.EOSJH1_Pmin)}
            {renderDetailField("JH1 T", item.EOSJH1_T)}
          </div>
        </>
      )}
      {/* Conditionally Display EOS JH2 Parameters */}
      {item.TypEOS === "JH2" && (
        <>
          <div style={sectionHeaderStyle}>EOS JH2 Parameters</div>
          <div style={detailGridStyle}>
            {renderDetailField("JH2 K1", item.EOSJH2_K1)}
            {renderDetailField("JH2 K2", item.EOSJH2_K2)}
            {renderDetailField("JH2 K3", item.EOSJH2_K3)}
            {renderDetailField("JH2 Pmin", item.EOSJH2_Pmin)}
            {renderDetailField("JH2 T", item.EOSJH2_T)}
            {renderDetailField("JH2 A", item.EOSJH2_A)}
            {renderDetailField("JH2 B", item.EOSJH2_B)}
            {renderDetailField("JH2 n", item.EOSJH2_n)}
          </div>
        </>
      )}
    </div>
  );
}

// --- MatInfoComplete (Unchanged, using clearer icons) ---
function MatInfoComplete({ clicked, item, handleClick }) {
  return (
    <div
      className={
        clicked === item.MaterialName
          ? "partContainer partContainerClicked" // Make sure these classes exist in your CSS
          : "partContainer"
      }
    >
      <MatInfo handleClick={handleClick} item={item}>
        {/* Use [+] and [-] for visual cue */}
        {clicked === item.MaterialName ? "[-] " : "[+] "} {item.MaterialName}
      </MatInfo>
      {clicked === item.MaterialName ? (
        <MatDetails item={item}></MatDetails>
      ) : null}
    </div>
  );
}

export default MaterialManager;
