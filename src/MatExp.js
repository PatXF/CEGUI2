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

// --- CreateMatContainer (Modified for Fixed Height Button) ---
function CreateMatContainer({
  onAddMat,
  existingMaterialNames,
  showNotification,
}) {
  // --- Data Definitions (Unchanged) ---
  const fieldLabels = {
    /* ... same labels ... */ MaterialName: "Material Name*",
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
    /* ... same options ... */ TypMat: ["Elastic", "Plastic", "Hardening"],
    TypEOS: ["Linear", "JH1", "JH2"],
    TypHard: ["None", "JC"],
    TypDamage: ["None", "JC"],
  };
  // Initial state definition (Unchanged)
  const getInitialFormState = () => ({
    /* ... same initial state ... */ MaterialName: "",
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
    const checkConditionalNumericFields = (typeKey, typeValue, fieldKeys) => {
      if (form[typeKey] === typeValue) {
        for (const field of fieldKeys) {
          if (form[field] === "" || form[field] === null) {
            showNotification(
              "warning",
              `${fieldLabels[field]} is required for ${typeValue}.`
            );
            return false;
          }
          if (isNaN(Number(form[field]))) {
            showNotification(
              "warning",
              `${fieldLabels[field]} must be a valid number for ${typeValue}.`
            );
            return false;
          }
        }
      }
      return true;
    };
    if (
      !checkConditionalNumericFields("TypHard", "JC", [
        "JC_A",
        "JC_B",
        "JC_n",
        "JC_C",
        "JC_m",
        "JC_Tm",
        "JC_Tr",
      ])
    )
      return;
    if (
      !checkConditionalNumericFields("TypDamage", "JC", [
        "JCD_D1",
        "JCD_D2",
        "JCD_D3",
        "JCD_D4",
        "JCD_D5",
      ])
    )
      return;
    if (
      !checkConditionalNumericFields("TypEOS", "JH1", [
        "EOSJH1_K1",
        "EOSJH1_K2",
        "EOSJH1_K3",
        "EOSJH1_Pmin",
        "EOSJH1_T",
      ])
    )
      return;
    if (
      !checkConditionalNumericFields("TypEOS", "JH2", [
        "EOSJH2_K1",
        "EOSJH2_K2",
        "EOSJH2_K3",
        "EOSJH2_Pmin",
        "EOSJH2_T",
        "EOSJH2_A",
        "EOSJH2_B",
        "EOSJH2_n",
      ])
    )
      return;

    // --- Data Conversion (Unchanged) ---
    const dataToAdd = {
      /* ... same conversions ... */ ...form,
      MaterialName: form.MaterialName.trim(),
      Rhog: form.Rhog === "" ? null : Number(form.Rhog),
      Eg: form.Eg === "" ? null : Number(form.Eg),
      Nug: form.Nug === "" ? null : Number(form.Nug),
      Yg: form.Yg === "" ? null : Number(form.Yg),
      JC_A:
        form.TypHard === "JC" && form.JC_A !== ""
          ? Number(form.JC_A)
          : form.JC_A === ""
          ? null
          : form.JC_A,
      JC_B:
        form.TypHard === "JC" && form.JC_B !== ""
          ? Number(form.JC_B)
          : form.JC_B === ""
          ? null
          : form.JC_B,
      JC_n:
        form.TypHard === "JC" && form.JC_n !== ""
          ? Number(form.JC_n)
          : form.JC_n === ""
          ? null
          : form.JC_n,
      JC_C:
        form.TypHard === "JC" && form.JC_C !== ""
          ? Number(form.JC_C)
          : form.JC_C === ""
          ? null
          : form.JC_C,
      JC_m:
        form.TypHard === "JC" && form.JC_m !== ""
          ? Number(form.JC_m)
          : form.JC_m === ""
          ? null
          : form.JC_m,
      JC_Tm:
        form.TypHard === "JC" && form.JC_Tm !== ""
          ? Number(form.JC_Tm)
          : form.JC_Tm === ""
          ? null
          : form.JC_Tm,
      JC_Tr:
        form.TypHard === "JC" && form.JC_Tr !== ""
          ? Number(form.JC_Tr)
          : form.JC_Tr === ""
          ? null
          : form.JC_Tr,
      JCD_D1:
        form.TypDamage === "JC" && form.JCD_D1 !== ""
          ? Number(form.JCD_D1)
          : form.JCD_D1 === ""
          ? null
          : form.JCD_D1,
      JCD_D2:
        form.TypDamage === "JC" && form.JCD_D2 !== ""
          ? Number(form.JCD_D2)
          : form.JCD_D2 === ""
          ? null
          : form.JCD_D2,
      JCD_D3:
        form.TypDamage === "JC" && form.JCD_D3 !== ""
          ? Number(form.JCD_D3)
          : form.JCD_D3 === ""
          ? null
          : form.JCD_D3,
      JCD_D4:
        form.TypDamage === "JC" && form.JCD_D4 !== ""
          ? Number(form.JCD_D4)
          : form.JCD_D4 === ""
          ? null
          : form.JCD_D4,
      JCD_D5:
        form.TypDamage === "JC" && form.JCD_D5 !== ""
          ? Number(form.JCD_D5)
          : form.JCD_D5 === ""
          ? null
          : form.JCD_D5,
      EOSJH1_K1:
        form.TypEOS === "JH1" && form.EOSJH1_K1 !== ""
          ? Number(form.EOSJH1_K1)
          : form.EOSJH1_K1 === ""
          ? null
          : form.EOSJH1_K1,
      EOSJH1_K2:
        form.TypEOS === "JH1" && form.EOSJH1_K2 !== ""
          ? Number(form.EOSJH1_K2)
          : form.EOSJH1_K2 === ""
          ? null
          : form.EOSJH1_K2,
      EOSJH1_K3:
        form.TypEOS === "JH1" && form.EOSJH1_K3 !== ""
          ? Number(form.EOSJH1_K3)
          : form.EOSJH1_K3 === ""
          ? null
          : form.EOSJH1_K3,
      EOSJH1_Pmin:
        form.TypEOS === "JH1" && form.EOSJH1_Pmin !== ""
          ? Number(form.EOSJH1_Pmin)
          : form.EOSJH1_Pmin === ""
          ? null
          : form.EOSJH1_Pmin,
      EOSJH1_T:
        form.TypEOS === "JH1" && form.EOSJH1_T !== ""
          ? Number(form.EOSJH1_T)
          : form.EOSJH1_T === ""
          ? null
          : form.EOSJH1_T,
      EOSJH2_K1:
        form.TypEOS === "JH2" && form.EOSJH2_K1 !== ""
          ? Number(form.EOSJH2_K1)
          : form.EOSJH2_K1 === ""
          ? null
          : form.EOSJH2_K1,
      EOSJH2_K2:
        form.TypEOS === "JH2" && form.EOSJH2_K2 !== ""
          ? Number(form.EOSJH2_K2)
          : form.EOSJH2_K2 === ""
          ? null
          : form.EOSJH2_K2,
      EOSJH2_K3:
        form.TypEOS === "JH2" && form.EOSJH2_K3 !== ""
          ? Number(form.EOSJH2_K3)
          : form.EOSJH2_K3 === ""
          ? null
          : form.EOSJH2_K3,
      EOSJH2_Pmin:
        form.TypEOS === "JH2" && form.EOSJH2_Pmin !== ""
          ? Number(form.EOSJH2_Pmin)
          : form.EOSJH2_Pmin === ""
          ? null
          : form.EOSJH2_Pmin,
      EOSJH2_T:
        form.TypEOS === "JH2" && form.EOSJH2_T !== ""
          ? Number(form.EOSJH2_T)
          : form.EOSJH2_T === ""
          ? null
          : form.EOSJH2_T,
      EOSJH2_A:
        form.TypEOS === "JH2" && form.EOSJH2_A !== ""
          ? Number(form.EOSJH2_A)
          : form.EOSJH2_A === ""
          ? null
          : form.EOSJH2_A,
      EOSJH2_B:
        form.TypEOS === "JH2" && form.EOSJH2_B !== ""
          ? Number(form.EOSJH2_B)
          : form.EOSJH2_B === ""
          ? null
          : form.EOSJH2_B,
      EOSJH2_n:
        form.TypEOS === "JH2" && form.EOSJH2_n !== ""
          ? Number(form.EOSJH2_n)
          : form.EOSJH2_n === ""
          ? null
          : form.EOSJH2_n,
    };

    onAddMat(dataToAdd);
    setForm(getInitialFormState()); // Reset form
  };

  // --- Styling Section ---
  const verticalSpacing = "8px";
  const fixedHeight = "30px";

  // Style for input/select (Unchanged)
  const formElementStyle = {
    /* ... same as before ... */ display: "block",
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
    /* ... same as before ... */ ...formElementStyle,
    paddingRight: "25px",
    background:
      "white url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><path fill='none' stroke='%23333' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/></svg>\") right 8px center/8px 8px no-repeat",
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
  };

  // Style for conditional headers (Unchanged)
  const sectionHeaderStyle = {
    /* ... same as before ... */ display: "flex",
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

  // *** UPDATED Style for the submit button ***
  const submitButtonStyle = {
    height: fixedHeight, // *** FIXED HEIGHT ***
    minHeight: fixedHeight, // Ensure minimum height is also set
    boxSizing: "border-box", // Crucial: include padding/border in height calculation
    display: "flex", // Use flexbox for alignment
    alignItems: "center", // Vertically center text
    justifyContent: "center", // Horizontally center text
    width: "100%", // Occupy full width like other elements
    padding: "0 15px", // Horizontal padding (adjust as needed)
    // Let className handle colors, border-radius, font-size, etc.
    // Remove any margin/padding definitions from the className if they conflict
    border: "1px solid transparent", // Add default border to prevent size jump on hover/focus if classes add borders
    lineHeight: "normal", // Reset line-height that might interfere from classes
  };

  // --- JSX Structure ---
  return (
    <div
      className="partInfoContainer"
      style={{
        /* ... same container style ... */ display: "flex",
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

      {/* --- Conditionally Rendered Sections (Unchanged) --- */}
      {form.TypHard === "JC" && (
        <React.Fragment>
          {" "}
          <div style={sectionHeaderStyle}>
            Johnson-Cook Plasticity (JC)
          </div>{" "}
          <input
            name="JC_A"
            value={form.JC_A}
            onChange={handleChange}
            placeholder={fieldLabels.JC_A}
            type="number"
            step="any"
            style={formElementStyle}
            required
          />{" "}
          {/* ... other JC inputs */}{" "}
          <input
            name="JC_B"
            value={form.JC_B}
            onChange={handleChange}
            placeholder={fieldLabels.JC_B}
            type="number"
            step="any"
            style={formElementStyle}
            required
          />{" "}
          <input
            name="JC_n"
            value={form.JC_n}
            onChange={handleChange}
            placeholder={fieldLabels.JC_n}
            type="number"
            step="any"
            style={formElementStyle}
            required
          />{" "}
          <input
            name="JC_C"
            value={form.JC_C}
            onChange={handleChange}
            placeholder={fieldLabels.JC_C}
            type="number"
            step="any"
            style={formElementStyle}
            required
          />{" "}
          <input
            name="JC_m"
            value={form.JC_m}
            onChange={handleChange}
            placeholder={fieldLabels.JC_m}
            type="number"
            step="any"
            style={formElementStyle}
            required
          />{" "}
          <input
            name="JC_Tm"
            value={form.JC_Tm}
            onChange={handleChange}
            placeholder={fieldLabels.JC_Tm}
            type="number"
            step="any"
            style={formElementStyle}
            required
          />{" "}
          <input
            name="JC_Tr"
            value={form.JC_Tr}
            onChange={handleChange}
            placeholder={fieldLabels.JC_Tr}
            type="number"
            step="any"
            style={formElementStyle}
            required
          />{" "}
        </React.Fragment>
      )}
      {form.TypDamage === "JC" && (
        <React.Fragment>
          {" "}
          <div style={sectionHeaderStyle}>Johnson-Cook Damage (JC_D)</div>{" "}
          <input
            name="JCD_D1"
            value={form.JCD_D1}
            onChange={handleChange}
            placeholder={fieldLabels.JCD_D1}
            type="number"
            step="any"
            style={formElementStyle}
            required
          />{" "}
          {/* ... other JCD inputs */}{" "}
          <input
            name="JCD_D2"
            value={form.JCD_D2}
            onChange={handleChange}
            placeholder={fieldLabels.JCD_D2}
            type="number"
            step="any"
            style={formElementStyle}
            required
          />{" "}
          <input
            name="JCD_D3"
            value={form.JCD_D3}
            onChange={handleChange}
            placeholder={fieldLabels.JCD_D3}
            type="number"
            step="any"
            style={formElementStyle}
            required
          />{" "}
          <input
            name="JCD_D4"
            value={form.JCD_D4}
            onChange={handleChange}
            placeholder={fieldLabels.JCD_D4}
            type="number"
            step="any"
            style={formElementStyle}
            required
          />{" "}
          <input
            name="JCD_D5"
            value={form.JCD_D5}
            onChange={handleChange}
            placeholder={fieldLabels.JCD_D5}
            type="number"
            step="any"
            style={formElementStyle}
            required
          />{" "}
        </React.Fragment>
      )}
      {form.TypEOS === "JH1" && (
        <React.Fragment>
          {" "}
          <div style={sectionHeaderStyle}>
            EOS Johnson-Holmquist 1 (EOS_JH1)
          </div>{" "}
          <input
            name="EOSJH1_K1"
            value={form.EOSJH1_K1}
            onChange={handleChange}
            placeholder={fieldLabels.EOSJH1_K1}
            type="number"
            step="any"
            style={formElementStyle}
            required
          />{" "}
          {/* ... other JH1 inputs */}{" "}
          <input
            name="EOSJH1_K2"
            value={form.EOSJH1_K2}
            onChange={handleChange}
            placeholder={fieldLabels.EOSJH1_K2}
            type="number"
            step="any"
            style={formElementStyle}
            required
          />{" "}
          <input
            name="EOSJH1_K3"
            value={form.EOSJH1_K3}
            onChange={handleChange}
            placeholder={fieldLabels.EOSJH1_K3}
            type="number"
            step="any"
            style={formElementStyle}
            required
          />{" "}
          <input
            name="EOSJH1_Pmin"
            value={form.EOSJH1_Pmin}
            onChange={handleChange}
            placeholder={fieldLabels.EOSJH1_Pmin}
            type="number"
            step="any"
            style={formElementStyle}
            required
          />{" "}
          <input
            name="EOSJH1_T"
            value={form.EOSJH1_T}
            onChange={handleChange}
            placeholder={fieldLabels.EOSJH1_T}
            type="number"
            step="any"
            style={formElementStyle}
            required
          />{" "}
        </React.Fragment>
      )}
      {form.TypEOS === "JH2" && (
        <React.Fragment>
          {" "}
          <div style={sectionHeaderStyle}>
            EOS Johnson-Holmquist 2 (EOS_JH2)
          </div>{" "}
          <input
            name="EOSJH2_K1"
            value={form.EOSJH2_K1}
            onChange={handleChange}
            placeholder={fieldLabels.EOSJH2_K1}
            type="number"
            step="any"
            style={formElementStyle}
            required
          />{" "}
          {/* ... other JH2 inputs */}{" "}
          <input
            name="EOSJH2_K2"
            value={form.EOSJH2_K2}
            onChange={handleChange}
            placeholder={fieldLabels.EOSJH2_K2}
            type="number"
            step="any"
            style={formElementStyle}
            required
          />{" "}
          <input
            name="EOSJH2_K3"
            value={form.EOSJH2_K3}
            onChange={handleChange}
            placeholder={fieldLabels.EOSJH2_K3}
            type="number"
            step="any"
            style={formElementStyle}
            required
          />{" "}
          <input
            name="EOSJH2_Pmin"
            value={form.EOSJH2_Pmin}
            onChange={handleChange}
            placeholder={fieldLabels.EOSJH2_Pmin}
            type="number"
            step="any"
            style={formElementStyle}
            required
          />{" "}
          <input
            name="EOSJH2_T"
            value={form.EOSJH2_T}
            onChange={handleChange}
            placeholder={fieldLabels.EOSJH2_T}
            type="number"
            step="any"
            style={formElementStyle}
            required
          />{" "}
          <input
            name="EOSJH2_A"
            value={form.EOSJH2_A}
            onChange={handleChange}
            placeholder={fieldLabels.EOSJH2_A}
            type="number"
            step="any"
            style={formElementStyle}
            required
          />{" "}
          <input
            name="EOSJH2_B"
            value={form.EOSJH2_B}
            onChange={handleChange}
            placeholder={fieldLabels.EOSJH2_B}
            type="number"
            step="any"
            style={formElementStyle}
            required
          />{" "}
          <input
            name="EOSJH2_n"
            value={form.EOSJH2_n}
            onChange={handleChange}
            placeholder={fieldLabels.EOSJH2_n}
            type="number"
            step="any"
            style={formElementStyle}
            required
          />{" "}
        </React.Fragment>
      )}

      {/* --- Submission Button --- */}
      <button
        onClick={handleSubmit}
        className="module-button-green" // Keep className for base styles (color, etc.)
        style={submitButtonStyle} // *** Apply the UPDATED fixed height style ***
      >
        Add Material
      </button>
    </div>
  );
}

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
