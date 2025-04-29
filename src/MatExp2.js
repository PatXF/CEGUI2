import React, { useState } from "react";

// --- MaterialManager Component (Keep Unchanged) ---
function MaterialManager({ mats, setMats, showNotification }) {
  // ... (rest of MaterialManager code remains the same) ...
  const [createClicked, setCreateClicked] = useState(false);
  const [deleteClicked, setDeleteClicked] = useState(false);
  const [numClicks, setNumClicks] = useState(0);
  const [clicked, setClicked] = useState("");

  const handleCreate = () => {
    setCreateClicked(true);
    setDeleteClicked(false);
    setClicked(null);
    setNumClicks(0);
  };

  const handleDelete = () => {
    setDeleteClicked(true);
    setCreateClicked(false);
    setClicked(null);
    setNumClicks(0);
  };

  function handleClick({ item }) {
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
    // Keep validation from previous steps
    if (mats.some((mat) => mat.MaterialName === newMat.MaterialName)) {
      showNotification(
        "warning",
        `Material with name "${newMat.MaterialName}" already exists. Please use a unique name.`
      );
      return;
    }
    if (!newMat.MaterialName.trim()) {
      showNotification("warning", "Material Name cannot be empty.");
      return;
    }
    // Add other validation checks as needed here before adding

    setMats([...mats, newMat]);
    setCreateClicked(false);
    showNotification(
      "success",
      `Material "${newMat.MaterialName}" created successfully.`
    );
  };

  let content;

  if (createClicked) {
    content = (
      <>
        <button onClick={handleCancel} className="module-button-red">
          Cancel
        </button>
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
        />
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

// --- CreateMatContainer (Refactored Conditional Sections) ---
function CreateMatContainer({
  onAddMat,
  existingMaterialNames,
  showNotification,
}) {
  // --- Data Definitions (Unchanged) ---
  const fieldLabels = {
    MaterialName: "Material Name*",
    Rhog: "Density (Rhog)",
    Eg: "Elastic Modulus (Eg)",
    Nug: "Poisson's Ratio (Nug)",
    Yg: "Yield Strength (Yg)",
    TypMat: "Material Type",
    TypEOS: "Equation of State Type",
    TypHard: "Hardening Type",
    TypDamage: "Damage Model Type",
    JC_A: "JC A (Yield Stress)*",
    JC_B: "JC B (Hardening Coeff)*",
    JC_n: "JC n (Hardening Exp)*",
    JC_C: "JC C (Strain Rate Coeff)*",
    JC_m: "JC m (Thermal Softening Exp)*",
    JC_Tm: "JC Tm (Melt Temp)*",
    JC_Tr: "JC Tr (Ref Temp)*",
    JCD_D1: "JC D1*",
    JCD_D2: "JC D2*",
    JCD_D3: "JC D3*",
    JCD_D4: "JC D4*",
    JCD_D5: "JC D5*",
    EOSJH1_K1: "JH1 K1 (Bulk Modulus)*",
    EOSJH1_K2: "JH1 K2*",
    EOSJH1_K3: "JH1 K3*",
    EOSJH1_Pmin: "JH1 Pmin (Min Pressure)*",
    EOSJH1_T: "JH1 T (Tensile Strength)*",
    EOSJH2_K1: "JH2 K1*",
    EOSJH2_K2: "JH2 K2*",
    EOSJH2_K3: "JH2 K3*",
    EOSJH2_Pmin: "JH2 Pmin*",
    EOSJH2_T: "JH2 T*",
    EOSJH2_A: "JH2 A (Intact Strength)*",
    EOSJH2_B: "JH2 B (Fracture Strength)*",
    EOSJH2_n: "JH2 n (Strength Hardening)*",
  };
  const dropdownOptions = {
    TypMat: ["Elastic", "Plastic", "Hardening"],
    TypEOS: ["Linear", "JH1", "JH2"],
    TypHard: ["None", "JC"],
    TypDamage: ["None", "JC"],
  };
  // Initial state definition (Unchanged)
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
    JC_A: "",
    JC_B: "",
    JC_n: "",
    JC_C: "",
    JC_m: "",
    JC_Tm: "",
    JC_Tr: "",
    JCD_D1: "",
    JCD_D2: "",
    JCD_D3: "",
    JCD_D4: "",
    JCD_D5: "",
    EOSJH1_K1: "",
    EOSJH1_K2: "",
    EOSJH1_K3: "",
    EOSJH1_Pmin: "",
    EOSJH1_T: "",
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

  // Handle input changes (Unchanged)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // --- Data Structure for Conditional Sections ---
  const conditionalSections = [
    {
      triggerField: "TypHard",
      triggerValue: "JC",
      title: "Johnson-Cook Plasticity (JC)",
      fields: ["JC_A", "JC_B", "JC_n", "JC_C", "JC_m", "JC_Tm", "JC_Tr"],
    },
    {
      triggerField: "TypDamage",
      triggerValue: "JC",
      title: "Johnson-Cook Damage (JC_D)",
      fields: ["JCD_D1", "JCD_D2", "JCD_D3", "JCD_D4", "JCD_D5"],
    },
    {
      triggerField: "TypEOS",
      triggerValue: "JH1",
      title: "EOS Johnson-Holmquist 1 (EOS_JH1)",
      fields: [
        "EOSJH1_K1",
        "EOSJH1_K2",
        "EOSJH1_K3",
        "EOSJH1_Pmin",
        "EOSJH1_T",
      ],
    },
    {
      triggerField: "TypEOS",
      triggerValue: "JH2",
      title: "EOS Johnson-Holmquist 2 (EOS_JH2)",
      fields: [
        "EOSJH2_K1",
        "EOSJH2_K2",
        "EOSJH2_K3",
        "EOSJH2_Pmin",
        "EOSJH2_T",
        "EOSJH2_A",
        "EOSJH2_B",
        "EOSJH2_n",
      ],
    },
  ];

  // Handle form submission (Unchanged)
  const handleSubmit = () => {
    // --- Validation (Unchanged) ---
    if (!form.MaterialName.trim()) {
      showNotification(
        "warning",
        `${fieldLabels.MaterialName} cannot be empty.`
      );
      return;
    }
    if (existingMaterialNames.includes(form.MaterialName.trim())) {
      showNotification(
        "warning",
        `MaterialName '${form.MaterialName.trim()}' already exists.`
      );
      return;
    }
    const numericFieldsBasic = ["Rhog", "Eg", "Nug", "Yg"];
    for (const field of numericFieldsBasic) {
      if (
        form[field] !== "" &&
        form[field] !== null &&
        isNaN(Number(form[field]))
      ) {
        showNotification(
          "warning",
          `${fieldLabels[field]} must be a valid number if provided.`
        );
        return;
      }
    }
    // --- Refactored Conditional Validation ---
    for (const section of conditionalSections) {
      if (form[section.triggerField] === section.triggerValue) {
        for (const fieldKey of section.fields) {
          if (form[fieldKey] === "" || form[fieldKey] === null) {
            showNotification(
              "warning",
              `${fieldLabels[fieldKey]} is required for ${section.triggerValue}.`
            );
            return; // Return false if any required field is empty
          }
          if (isNaN(Number(form[fieldKey]))) {
            showNotification(
              "warning",
              `${fieldLabels[fieldKey]} must be a valid number for ${section.triggerValue}.`
            );
            return; // Return false if any required field is not a number
          }
        }
      }
    }
    // --- Data Conversion (Unchanged) ---
    const dataToAdd = {
      ...form,
      MaterialName: form.MaterialName.trim(),
      Rhog: form.Rhog === "" ? null : Number(form.Rhog),
      Eg: form.Eg === "" ? null : Number(form.Eg),
      Nug: form.Nug === "" ? null : Number(form.Nug),
      Yg: form.Yg === "" ? null : Number(form.Yg),
      // Convert conditional fields only if their condition is met
      ...(form.TypHard === "JC" && {
        JC_A: form.JC_A !== "" ? Number(form.JC_A) : null,
        JC_B: form.JC_B !== "" ? Number(form.JC_B) : null,
        JC_n: form.JC_n !== "" ? Number(form.JC_n) : null,
        JC_C: form.JC_C !== "" ? Number(form.JC_C) : null,
        JC_m: form.JC_m !== "" ? Number(form.JC_m) : null,
        JC_Tm: form.JC_Tm !== "" ? Number(form.JC_Tm) : null,
        JC_Tr: form.JC_Tr !== "" ? Number(form.JC_Tr) : null,
      }),
      ...(form.TypDamage === "JC" && {
        JCD_D1: form.JCD_D1 !== "" ? Number(form.JCD_D1) : null,
        JCD_D2: form.JCD_D2 !== "" ? Number(form.JCD_D2) : null,
        JCD_D3: form.JCD_D3 !== "" ? Number(form.JCD_D3) : null,
        JCD_D4: form.JCD_D4 !== "" ? Number(form.JCD_D4) : null,
        JCD_D5: form.JCD_D5 !== "" ? Number(form.JCD_D5) : null,
      }),
      ...(form.TypEOS === "JH1" && {
        EOSJH1_K1: form.EOSJH1_K1 !== "" ? Number(form.EOSJH1_K1) : null,
        EOSJH1_K2: form.EOSJH1_K2 !== "" ? Number(form.EOSJH1_K2) : null,
        EOSJH1_K3: form.EOSJH1_K3 !== "" ? Number(form.EOSJH1_K3) : null,
        EOSJH1_Pmin: form.EOSJH1_Pmin !== "" ? Number(form.EOSJH1_Pmin) : null,
        EOSJH1_T: form.EOSJH1_T !== "" ? Number(form.EOSJH1_T) : null,
      }),
      ...(form.TypEOS === "JH2" && {
        EOSJH2_K1: form.EOSJH2_K1 !== "" ? Number(form.EOSJH2_K1) : null,
        EOSJH2_K2: form.EOSJH2_K2 !== "" ? Number(form.EOSJH2_K2) : null,
        EOSJH2_K3: form.EOSJH2_K3 !== "" ? Number(form.EOSJH2_K3) : null,
        EOSJH2_Pmin: form.EOSJH2_Pmin !== "" ? Number(form.EOSJH2_Pmin) : null,
        EOSJH2_T: form.EOSJH2_T !== "" ? Number(form.EOSJH2_T) : null,
        EOSJH2_A: form.EOSJH2_A !== "" ? Number(form.EOSJH2_A) : null,
        EOSJH2_B: form.EOSJH2_B !== "" ? Number(form.EOSJH2_B) : null,
        EOSJH2_n: form.EOSJH2_n !== "" ? Number(form.EOSJH2_n) : null,
      }),
    };

    // Clean up any conditional fields that shouldn't be there if their trigger isn't active
    // This avoids sending e.g. JC_A=null if TypHard is not 'JC'
    Object.keys(dataToAdd).forEach((key) => {
      const section = conditionalSections.find((s) => s.fields.includes(key));
      if (section && form[section.triggerField] !== section.triggerValue) {
        // If the key belongs to a conditional section whose trigger is *not* active
        // set it to null (or remove it, depending on backend expectations)
        dataToAdd[key] = null;
        // Alternatively: delete dataToAdd[key];
      } else if (
        section &&
        form[section.triggerField] === section.triggerValue &&
        dataToAdd[key] === ""
      ) {
        // If the trigger *is* active but the field was left empty (should have been caught by validation, but belts and suspenders)
        dataToAdd[key] = null;
      }
    });

    onAddMat(dataToAdd);
    setForm(getInitialFormState()); // Reset form
  };

  // --- Styling Section (Unchanged) ---
  const verticalSpacing = "8px";
  const fixedHeight = "30px";

  // Style for input/select (Unchanged)
  const formElementStyle = {
    display: "block",
    boxSizing: "border-box",
    height: fixedHeight,
    width: "100%",
    padding: "0 8px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "0.9em",
    lineHeight: fixedHeight,
    backgroundColor: "white",
  };
  const selectStyleOverride = {
    ...formElementStyle,
    paddingRight: "25px",
    background:
      "white url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><path fill='none' stroke='%23333' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/></svg>\") right 8px center/8px 8px no-repeat",
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
  };

  // Style for conditional headers (Unchanged)
  const sectionHeaderStyle = {
    display: "flex",
    alignItems: "center",
    boxSizing: "border-box",
    height: fixedHeight,
    width: "100%",
    fontWeight: "bold",
    fontSize: "0.95em",
    paddingLeft: "8px",
    borderBottom: "1px solid #eee",
    backgroundColor: "#f8f8f8",
    borderRadius: "8px",
  };

  // Style for the submit button (Unchanged)
  const submitButtonStyle = {
    height: fixedHeight,
    minHeight: fixedHeight,
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    padding: "0 15px",
    border: "1px solid transparent",
    lineHeight: "normal",
  };

  // --- JSX Structure ---
  return (
    <div
      className="partInfoContainer"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: verticalSpacing,
        padding: "15px",
        border: "1px solid #eee",
        borderRadius: "5px",
        marginTop: "10px",
        overflowY: "auto",
        maxHeight: "calc(100vh - 250px)",
        scrollbarGutter: "stable",
      }}
    >
      {/* --- Basic Material Properties (Unchanged) --- */}
      <input
        name="MaterialName"
        value={form.MaterialName}
        onChange={handleChange}
        placeholder={fieldLabels.MaterialName}
        style={formElementStyle}
        required
      />
      <input
        name="Rhog"
        value={form.Rhog}
        onChange={handleChange}
        placeholder={fieldLabels.Rhog}
        type="number"
        step="any"
        style={formElementStyle}
      />
      <input
        name="Eg"
        value={form.Eg}
        onChange={handleChange}
        placeholder={fieldLabels.Eg}
        type="number"
        step="any"
        style={formElementStyle}
      />
      <input
        name="Nug"
        value={form.Nug}
        onChange={handleChange}
        placeholder={fieldLabels.Nug}
        type="number"
        step="any"
        style={formElementStyle}
      />
      <input
        name="Yg"
        value={form.Yg}
        onChange={handleChange}
        placeholder={fieldLabels.Yg}
        type="number"
        step="any"
        style={formElementStyle}
      />
      <select
        name="TypMat"
        value={form.TypMat}
        onChange={handleChange}
        style={selectStyleOverride}
      >
        {" "}
        <option value="">Select {fieldLabels.TypMat}</option>{" "}
        {dropdownOptions.TypMat.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}{" "}
      </select>
      <select
        name="TypEOS"
        value={form.TypEOS}
        onChange={handleChange}
        style={selectStyleOverride}
      >
        {" "}
        <option value="">Select {fieldLabels.TypEOS}</option>{" "}
        {dropdownOptions.TypEOS.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}{" "}
      </select>
      <select
        name="TypHard"
        value={form.TypHard}
        onChange={handleChange}
        style={selectStyleOverride}
      >
        {" "}
        <option value="">Select {fieldLabels.TypHard}</option>{" "}
        {dropdownOptions.TypHard.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}{" "}
      </select>
      <select
        name="TypDamage"
        value={form.TypDamage}
        onChange={handleChange}
        style={selectStyleOverride}
      >
        {" "}
        <option value="">Select {fieldLabels.TypDamage}</option>{" "}
        {dropdownOptions.TypDamage.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}{" "}
      </select>

      {/* --- REFACTORED Conditionally Rendered Sections --- */}
      {conditionalSections.map((section) => {
        // Check if the condition for this section is met
        if (form[section.triggerField] === section.triggerValue) {
          return (
            // Use React.Fragment to group elements without adding extra DOM nodes
            <React.Fragment key={section.title}>
              {/* Render the section header */}
              <div style={sectionHeaderStyle}>{section.title}</div>
              {/* Map over the fields defined for this section */}
              {section.fields.map((fieldName) => (
                <input
                  key={fieldName} // Use fieldName as key for the input
                  name={fieldName}
                  value={form[fieldName]}
                  onChange={handleChange}
                  placeholder={fieldLabels[fieldName]} // Get label from fieldLabels map
                  type="number"
                  step="any"
                  style={formElementStyle}
                  required // All conditional fields were required in the original code
                />
              ))}
            </React.Fragment>
          );
        }
        // If the condition is not met, render nothing for this section
        return null;
      })}

      {/* --- Submission Button (Unchanged) --- */}
      <button
        onClick={handleSubmit}
        className="module-button-green" // Keep className for base styles
        style={submitButtonStyle} // Apply fixed height style
      >
        Add Material
      </button>
    </div>
  );
}

// --- DeleteMatContainer (Unchanged) ---
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

// --- Revised MatDetails (Refactored Conditional Sections) ---
function MatDetails({ item }) {
  // --- Field Labels (needed for display) ---
  // Note: Could be passed as prop if shared heavily, but defining here is fine.
  const fieldLabels = {
    Rhog: "Density",
    Eg: "Young's Modulus",
    Nug: "Poisson's Ratio",
    Yg: "Yield Stress",
    TypMat: "Material Type",
    TypEOS: "State Equation",
    TypHard: "Hardening",
    TypDamage: "Damage",
    JC_A: "JC A",
    JC_B: "JC B",
    JC_n: "JC n",
    JC_C: "JC C",
    JC_m: "JC m",
    JC_Tm: "JC Tm",
    JC_Tr: "JC Tr",
    JCD_D1: "JC D1",
    JCD_D2: "JC D2",
    JCD_D3: "JC D3",
    JCD_D4: "JC D4",
    JCD_D5: "JC D5",
    EOSJH1_K1: "JH1 K1",
    EOSJH1_K2: "JH1 K2",
    EOSJH1_K3: "JH1 K3",
    EOSJH1_Pmin: "JH1 Pmin",
    EOSJH1_T: "JH1 T",
    EOSJH2_K1: "JH2 K1",
    EOSJH2_K2: "JH2 K2",
    EOSJH2_K3: "JH2 K3",
    EOSJH2_Pmin: "JH2 Pmin",
    EOSJH2_T: "JH2 T",
    EOSJH2_A: "JH2 A",
    EOSJH2_B: "JH2 B",
    EOSJH2_n: "JH2 n",
  };

  // --- Data Structure for Conditional Sections (Same as in CreateMatContainer) ---
  const conditionalSections = [
    {
      triggerField: "TypHard",
      triggerValue: "JC",
      title: "JC Parameters", // Simplified title for display
      fields: ["JC_A", "JC_B", "JC_n", "JC_C", "JC_m", "JC_Tm", "JC_Tr"],
    },
    {
      triggerField: "TypDamage",
      triggerValue: "JC",
      title: "JC Damage Parameters",
      fields: ["JCD_D1", "JCD_D2", "JCD_D3", "JCD_D4", "JCD_D5"],
    },
    {
      triggerField: "TypEOS",
      triggerValue: "JH1",
      title: "EOS JH1 Parameters",
      fields: [
        "EOSJH1_K1",
        "EOSJH1_K2",
        "EOSJH1_K3",
        "EOSJH1_Pmin",
        "EOSJH1_T",
      ],
    },
    {
      triggerField: "TypEOS",
      triggerValue: "JH2",
      title: "EOS JH2 Parameters",
      fields: [
        "EOSJH2_K1",
        "EOSJH2_K2",
        "EOSJH2_K3",
        "EOSJH2_Pmin",
        "EOSJH2_T",
        "EOSJH2_A",
        "EOSJH2_B",
        "EOSJH2_n",
      ],
    },
  ];

  // Helper function to render a label and disabled input pair (Unchanged)
  const renderDetailField = (label, value) => {
    const displayValue =
      value !== null && value !== undefined && value !== "" ? value : "-";
    if (value === null || value === undefined || value === "") return null;

    return (
      <React.Fragment key={label}>
        {" "}
        {/* Use label as key for fragment */}
        <label style={{ justifyContent: "center", paddingRight: "5px" }}>
          {label}:
        </label>
        <input disabled value={displayValue} />
      </React.Fragment>
    );
  };

  // --- Styles (Unchanged) ---
  const detailGridStyle = {
    display: "grid",
    gridTemplateColumns: "auto 1fr",
    gap: "2px 8px",
    alignItems: "center",
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
      {/* Basic Properties (Unchanged) */}
      <div style={detailGridStyle}>
        {renderDetailField(fieldLabels.Rhog, item.Rhog)}
        {renderDetailField(fieldLabels.Eg, item.Eg)}
        {renderDetailField(fieldLabels.Nug, item.Nug)}
        {renderDetailField(fieldLabels.Yg, item.Yg)}
        {renderDetailField(fieldLabels.TypMat, item.TypMat)}
        {renderDetailField(fieldLabels.TypEOS, item.TypEOS)}
        {renderDetailField(fieldLabels.TypHard, item.TypHard)}
        {renderDetailField(fieldLabels.TypDamage, item.TypDamage)}
      </div>
      {/* --- REFACTORED Conditionally Displayed Sections --- */}
      {conditionalSections.map((section) => {
        // Check if the condition for this section is met based on the item prop
        if (item[section.triggerField] === section.triggerValue) {
          // Filter out fields that don't have a value in the item to avoid rendering empty sections
          const fieldsToRender = section.fields
            .map((fieldName) => ({
              fieldName,
              value: item[fieldName],
            }))
            .filter(
              (field) =>
                field.value !== null &&
                field.value !== undefined &&
                field.value !== ""
            );

          // Only render the section if there are actual fields with values to display
          if (fieldsToRender.length > 0) {
            return (
              <React.Fragment key={section.title}>
                <div style={sectionHeaderStyle}>{section.title}</div>
                <div style={detailGridStyle}>
                  {fieldsToRender.map((field) =>
                    renderDetailField(fieldLabels[field.fieldName], field.value)
                  )}
                </div>
              </React.Fragment>
            );
          }
        }
        // If the condition is not met or no fields have values, render nothing
        return null;
      })}
    </div>
  );
}

// --- MatInfoComplete (Unchanged) ---
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
