import { useState, useEffect } from "react";

function PartManager({
  parts,
  setParts,
  setCurrentStatus,
  hoveredGroup,
  setHoveredGroup,
  showNotification,
  particles,
  setParticles,
  iPartMat,
  setPartMat,
}) {
  // the top should have a create part option
  // the module below this should contain the following
  // PartName
  // Note that we do not create part ID rather the array index acts as the part ID
  // npPart
  // TypPart
  // First the simple thing we handle create part that takes in these inputs
  // Completed✅
  // Allowing the user to edit the parts that they imported.
  const [createClicked, setCreateClicked] = useState(false);
  const [deleteClicked, setDeleteClicked] = useState(false);
  const [editClicked, setEditClicked] = useState(false);
  const [numClicks, setNumClicks] = useState(0);
  const [clicked, setClicked] = useState("");
  const [clickedEditPart, setClickedEditPart] = useState("");

  const handleCreate = () => setCreateClicked(!createClicked);
  function handleEdit(item) {
    setEditClicked(!editClicked);
    setClickedEditPart(item);
  }

  const handleDelete = () => setDeleteClicked(!deleteClicked);

  function handleClick({ item, group }) {
    if (clicked === item.PartName) {
      setNumClicks((prev) => prev + 1);
      if (numClicks === 1) {
        setClicked(null);
        setNumClicks(0);
        setHoveredGroup(-1);
      }
    } else {
      setNumClicks(1);
      setClicked(item.PartName);
      setHoveredGroup(group);
    }
  }

  function handleCancel() {
    setCreateClicked(false);
    setDeleteClicked(false);
    setEditClicked(false);
  }

  const addPart = (newPart) => {
    setParts([...parts, newPart]);
    setCreateClicked(false); // Hide form after submission
  };

  // Trying to handle create part and delete part such that,
  // when create part is clicked we dont see anything related to delete
  // and vice versa
  // idea is if create is clicked only cancel and form are displayed
  // if delete is clicked only cancel and parts with a x displayed
  // else delete and create with info displayed
  let content;

  if (createClicked) {
    content = (
      <>
        <button onClick={handleCancel} className="module-button-red">
          Cancel
        </button>
        <CreatePartContainer
          onAddPart={addPart}
          setCurrentStatus={setCurrentStatus}
          showNotification={showNotification}
          parts={parts}
        />
      </>
    );
  } else if (deleteClicked) {
    content = (
      <>
        <button onClick={handleCancel} className="module-button-red">
          Cancel
        </button>
        <DeletePartContainer
          setParts={setParts}
          parts={parts}
          setCurrentStatus={setCurrentStatus}
          showNotification={showNotification}
          particles={particles}
          setParticles={setParticles}
          iPartMat={iPartMat}
          setPartMat={setPartMat}
        ></DeletePartContainer>
      </>
    );
  } else if (editClicked) {
    content = (
      <>
        <EditPartContainer
          clickedEdit={clickedEditPart}
          parts={parts}
          setParts={setParts}
          handleCancel={handleCancel}
          showNotification={showNotification}
          setCurrentStatus={setCurrentStatus}
        ></EditPartContainer>
      </>
    );
  } else {
    content = (
      <>
        <button onClick={handleCreate} className="module-button">
          Create Part
        </button>
        {parts.length > 0 ? (
          <>
            <button onClick={handleDelete} className="module-button-red">
              Delete Part
            </button>
          </>
        ) : (
          <> </>
        )}
        <DisplayInfo
          parts={parts}
          clicked={clicked}
          handleClick={handleClick}
          hoveredGroup={hoveredGroup}
          setHoveredGroup={setHoveredGroup}
          handleEdit={handleEdit}
        ></DisplayInfo>
      </>
    );
  }

  return (
    <div className="module-body">
      <h1 className="module-header">Parts</h1>
      {content}
    </div>
  );
}

function CreatePartContainer({
  onAddPart,
  setCurrentStatus,
  showNotification,
  parts,
}) {
  const [form, setForm] = useState({
    PartName: "",
    npPart: 0,
    TypPart: "",
    Pmg: 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = () => {
    if (!form.PartName || !form.npPart || !form.TypPart) {
      showNotification("warning", "All required fields must be filled!");
      return;
    }

    const trimmedPartName = form.PartName.trim();
    if (!trimmedPartName) {
      showNotification("warning", "Part Name cannot be empty or just spaces!");
      return;
    }

    const isDuplicate = parts.some(
      (existingPart) => existingPart.PartName === trimmedPartName
    );

    if (isDuplicate) {
      showNotification(
        "error",
        `Part with name "${trimmedPartName}" already exists!`
      );
      return;
    }

    setCurrentStatus((currStat) => [
      ...currStat,
      `${trimmedPartName} created with ${form.npPart} number of particles and ${form.TypPart} type`,
    ]);

    onAddPart({
      ...form,
      PartName: trimmedPartName,
      npPart: Number(form.npPart),
    });

    showNotification(
      "success",
      `${trimmedPartName} created with ${form.npPart} number of particles and ${form.TypPart} type`
    );

    setForm({ PartName: "", npPart: "", TypPart: "" });
  };

  return (
    <div
      className="partInfoContainer"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        overflow: "hidden",
      }}
    >
      <label>Part Name</label>
      <input
        name="PartName"
        value={form.PartName}
        onChange={handleChange}
        placeholder="Part Name"
        aria-label="Part Name"
        style={{
          boxSizing: "border-box",
          height: "30px",
          borderRadius: "10px",
          paddingLeft: "5px",
        }}
      />
      <label>Number of Particles</label>
      <input
        name="npPart"
        value={form.npPart}
        type="number"
        onChange={handleChange}
        placeholder="Number of Particles"
        aria-label="Number of Particles"
        style={{
          boxSizing: "border-box",
          height: "30px",
          borderRadius: "10px",
          paddingLeft: "5px",
        }}
      />
      <label>Part Type</label>
      <input
        name="TypPart"
        value={form.TypPart}
        onChange={handleChange}
        placeholder="Type"
        aria-label="Type"
        style={{
          boxSizing: "border-box",
          height: "30px",
          borderRadius: "10px",
          paddingLeft: "5px",
        }}
      />
      {form.TypPart === "rigid" ? (
        <>
          <label>Part Mass</label>
          <input
            name="Pmg"
            value={form.Pmg}
            type="number"
            onChange={handleChange}
            placeholder="Mass"
            aria-label="Mass"
            style={{
              boxSizing: "border-box",
              height: "30px",
              borderRadius: "10px",
              paddingLeft: "5px",
            }}
          />
        </>
      ) : (
        <></>
      )}
      <button onClick={handleSubmit} className="module-button-green">
        Add Part
      </button>
    </div>
  );
}

function DeletePartContainer({
  parts,
  setParts,
  setCurrentStatus,
  showNotification,
  particles,
  setParticles,
  iPartMat,
  setPartMat,
}) {
  // Rename partID to partNameToDelete for clarity
  const deletePart = (partNameToDelete, partIndexToDelete) => {
    showNotification("success", `${partNameToDelete} deleted!`);
    setCurrentStatus((currStat) => [
      ...currStat,
      `${partNameToDelete} deleted`,
    ]);

    setParts((prevParts) =>
      prevParts.filter((part) => part.PartName !== partNameToDelete)
    );

    setParticles((prevParticles) =>
      prevParticles.filter((particle, index) => index !== partIndexToDelete)
    );

    setPartMat((prevPartMat) =>
      prevPartMat.filter((partmat, index) => index !== partIndexToDelete)
    );
  };

  return (
    <div className="partInfoContainer">
      {parts.map((part, index) => (
        <div
          key={part.PartName}
          className="partContainer"
          role="button"
          tabIndex={0}
          onClick={() => deletePart(part.PartName, index)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              deletePart(part.PartName, index);
            }
          }}
          style={{
            cursor: "pointer",
            border: "1px dashed red",
            marginBottom: "5px",
            padding: "5px 8px",
          }}
        >
          {part.PartName} (Click to delete)
        </div>
      ))}
    </div>
  );
}

function DisplayInfo({
  parts,
  clicked,
  handleClick,
  hoveredGroup,
  setHoveredGroup,
  handleEdit,
}) {
  return (
    <div className="partInfoContainer">
      {parts.map((part, index) => (
        <PartInfoComplete
          clicked={clicked}
          item={part}
          group={index}
          handleClick={handleClick}
          hoveredGroup={hoveredGroup}
          setHoveredGroup={setHoveredGroup}
          handleEdit={handleEdit}
        ></PartInfoComplete>
      ))}
    </div>
  );
}

function PartInfo({ children, handleClick, item, group }) {
  return (
    <div role="button" onClick={() => handleClick({ item, group })}>
      {children}
    </div>
  );
}

function PartDetails({ item, handleEdit }) {
  return (
    <div className="partDetails">
      <label>Number of Particles: </label>
      <input disabled placeholder={item.npPart}></input>
      <label>Part Type: </label>
      <input disabled placeholder={item.TypPart}></input>
      {item.TypPart === "rigid" ? (
        <>
          <label>Part Mass: </label>
          <input disabled placeholder={item.Pmg}></input>
        </>
      ) : (
        <></>
      )}
      <div className="editButtonHolder">
        <button
          onClick={() => handleEdit(item.PartName)}
          className="module-button-green"
        >
          Edit Part
        </button>
      </div>
    </div>
  );
}

function PartInfoComplete({ clicked, item, handleClick, group, handleEdit }) {
  return (
    <div
      className={
        clicked === item.PartName
          ? "partContainer partContainerClicked"
          : "partContainer"
      }
    >
      <PartInfo handleClick={handleClick} item={item} group={group}>
        {clicked === item.PartName ? "-" : "+"} {item.PartName}
      </PartInfo>
      {clicked === item.PartName ? (
        <PartDetails item={item} handleEdit={handleEdit}></PartDetails>
      ) : null}
    </div>
  );
}

function EditPartContainer({
  clickedEdit,
  setParts,
  parts,
  handleCancel,
  showNotification,
}) {
  // Find the index of the part that matches clickedEdit
  const partIndex = parts.findIndex((part) => part.PartName === clickedEdit);

  // Initialize state with part details if found
  const [form, setForm] = useState(
    partIndex !== -1
      ? { ...parts[partIndex], TypPart: parts[partIndex].TypPart.toLowerCase() }
      : { PartName: "", npPart: "", TypPart: "rigid" }
  );

  // Ensure form updates when clickedEdit changes
  useEffect(() => {
    if (partIndex !== -1) {
      setForm({
        ...parts[partIndex],
        TypPart: parts[partIndex].TypPart.toLowerCase(),
      });
    }
  }, [clickedEdit, parts, partIndex]);

  // Handle input changes and store TypPart in lowercase
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "TypPart" ? value.toLowerCase() : value,
    }));
  };

  // Handle form submission and update parts using index
  const handleSubmit = () => {
    if (partIndex !== -1) {
      showNotification("success", `Edited ${parts[partIndex].PartName}`);
      setParts((prevParts) =>
        prevParts.map((part, index) =>
          index === partIndex ? { ...form, npPart: Number(form.npPart) } : part
        )
      );
      handleCancel();
    }
  };

  return (
    <>
      <button onClick={handleCancel} className="module-button-red">
        Cancel
      </button>
      <button onClick={handleSubmit} className="module-button-green">
        Submit
      </button>
      <div className="partInfoContainer">
        {partIndex !== -1 && (
          <div className="partDetails">
            <label htmlFor="PartName">Part Name:</label>
            <input
              id="PartName"
              name="PartName"
              value={form.PartName}
              onChange={handleChange}
            />

            <label htmlFor="npPart">Number of Particles:</label>
            <input
              id="npPart"
              name="npPart"
              value={form.npPart}
              onChange={handleChange}
            />

            <label htmlFor="TypPart">Part Type:</label>
            <select
              id="TypPart"
              name="TypPart"
              value={form.TypPart}
              onChange={handleChange}
            >
              <option value="">Select</option>
              <option value="rigid">Rigid</option>
              <option value="deformable">Deformable</option>
            </select>

            {form.TypPart === "rigid" ? (
              <>
                <label htmlFor="Pmg">Part Mass:</label>
                <input
                  type="number"
                  id="Pmg"
                  name="Pmg"
                  value={form.Pmg}
                  onChange={handleChange}
                />
              </>
            ) : (
              <></>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default PartManager;
