// --- START OF FILE JobManager.js ---

import React, { useState, useCallback } from "react"; // Removed useEffect

// --- RunningJobDisplay Component (No Changes Needed) ---
function RunningJobDisplay({ jobInfo, onAbort }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Determine status text and color
  let statusText = "Unknown"; // Default
  let statusColor = "#888"; // Default grey
  let isFinished = false;
  let showAbort = false;

  if (jobInfo) {
    // Add check for jobInfo existence
    switch (jobInfo.status) {
      case "submitting":
        statusText = "Submitting";
        statusColor = "#0072ff"; // Blue
        break;
      case "running":
        statusText = "Running";
        statusColor = "#0072ff"; // Blue
        showAbort = true; // Only show abort for running jobs
        break;
      case "completed":
        statusText = "Completed";
        statusColor = "#a0c878"; // Green
        isFinished = true;
        break;
      case "error":
        statusText = "Error";
        statusColor = "#ec5228"; // Red
        isFinished = true;
        break;
      case "aborted":
        statusText = "Aborted";
        statusColor = "#ef9651"; // Orange
        isFinished = true;
        break;
      default:
        statusText = jobInfo.status || "Unknown"; // Display status if available
        break;
    }
  }

  // Handle potential undefined jobInfo gracefully
  if (!jobInfo) {
    return (
      <div className="partContainer jm-running-job-item">
        <div className="jm-running-job-item__header">
          <span>...</span>
          <span
            style={{
              marginLeft: "auto",
              color: statusColor,
              fontWeight: "bold",
            }}
          >
            Loading...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`partContainer jm-running-job-item ${
        isCollapsed ? "" : "partContainerClicked"
      }`}
    >
      <div
        className="jm-running-job-item__header"
        role="button"
        onClick={toggleCollapse}
      >
        <span>
          {isCollapsed ? "+" : "-"} {jobInfo.id || "Job"}
        </span>
        <span
          style={{ marginLeft: "auto", color: statusColor, fontWeight: "bold" }}
        >
          {statusText}
        </span>
      </div>
      {!isCollapsed && (
        <div className="jm-running-job-item__details">
          <div className="jm-progress-container">
            <div className="jm-progress-bar__background">
              <div
                className="jm-progress-bar__foreground"
                style={{
                  width: `${jobInfo.progress || 0}%`,
                  backgroundColor: statusColor,
                }}
              ></div>
            </div>
            <span className="jm-progress-bar__text">
              {jobInfo.progress || 0}%
            </span>
          </div>
          <div className="jm-running-job-item__time">
            <span>Elapsed Time: {formatTime(jobInfo.elapsedTime || 0)}</span>
          </div>
          {jobInfo.message && (
            <div className="jm-running-job-item__status-msg">
              {/* Display error/completion/abort messages */}
              {jobInfo.message}
            </div>
          )}
          {/* Show abort button only if job is running */}
          {showAbort && (
            <div className="jm-running-job-item__controls">
              <button
                className="module-button-red"
                onClick={() => onAbort(jobInfo.id)}
                disabled={isFinished} // Should always be false if showAbort is true
              >
                Abort
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function JobManager({
  // Props needed for display and defining jobs
  jobs,
  setJobs,
  showNotification,
  // Props passed down from parent for running state and actions
  runningJobs, // Read-only state from parent
  onSubmitJob, // Handler function from parent
  onAbortJob, // Handler function from parent
  // Context props (potentially needed by sub-components like CreateJob)
  // NOTE: These are NOT needed for the core submit/abort actions anymore
  folderPath,
  setCurrentStatus,
  parts,
  mats,
  iPartMat,
  boundary,
  particles,
}) {
  const [createClicked, setCreateClicked] = useState(false);
  const [deleteClicked, setDeleteClicked] = useState(false);
  const [numClicks, setNumClicks] = useState(0);
  const [clicked, setClicked] = useState(""); // For expanding defined job details

  // REMOVED: useEffect for Electron listeners

  // --- Local UI Handlers ---
  function handleClick({ item }) {
    // Existing logic for expanding defined jobs
    if (clicked === item.JobName) {
      setNumClicks((prev) => prev + 1);
      if (numClicks === 1) {
        setClicked(null);
        setNumClicks(0);
      }
    } else {
      setNumClicks(1);
      setClicked(item.JobName);
    }
  }

  function handleCancel() {
    setCreateClicked(false);
    setDeleteClicked(false);
    setClicked("");
  }

  function handleCreate() {
    setCreateClicked(!createClicked);
  }

  function handleDelete() {
    setDeleteClicked(!deleteClicked);
  }

  // REMOVED: checkValidity() - This should be handled by the parent before calling onSubmitJob

  // --- Wrapper function to call the parent's submit handler ---
  // Renamed to avoid confusion with prop name
  const triggerSubmitJob = useCallback(
    (jobParams) => {
      // Basic check: Ensure job definition exists locally before calling parent
      const jobToSubmit = jobs.find((j) => j.JobName === jobParams.JobName);
      if (!jobToSubmit) {
        showNotification(
          "error",
          `Job definition for ${jobParams.JobName} not found locally.` // More specific error
        );
        return;
      }
      // Call the handler passed from the parent
      // Parent handler (handleSubmitJobParent) is responsible for:
      // - Checking folderPath
      // - Running checkJobValidity (using parent state)
      // - Constructing payload
      // - Calling electronAPI.submitJob
      // - Updating runningJobs state ('submitting', cleanup on failure)
      onSubmitJob(jobParams.JobName);
    },
    [jobs, onSubmitJob, showNotification]
  ); // Dependencies: local jobs list, parent handler, utility

  // --- Wrapper function to call the parent's abort handler ---
  // Renamed to avoid confusion with prop name
  // Using useCallback to ensure stability if passed down
  const triggerAbortJob = useCallback(
    (jobId) => {
      // Call the handler passed from the parent
      // Parent handler (handleAbortJobParent) is responsible for:
      // - Checking if job is actually running (using parent state)
      // - Calling electronAPI.abortJob
      // - Handling results/errors
      onAbortJob(jobId);
    },
    [onAbortJob]
  ); // Dependency: parent handler

  // --- Rendering Logic ---
  let content;

  if (createClicked) {
    // CreateJobContainer likely doesn't need changes related to runningJobs/submission
    content = (
      <CreateJobContainer
        handleCancel={handleCancel}
        setJobs={setJobs} // Still manages the defined jobs list
        showNotification={showNotification}
        existingJobNames={jobs.map((j) => j.JobName)}
      />
    );
  } else if (deleteClicked) {
    // DeleteJobContainer needs the runningJobs prop to prevent deletion
    content = (
      <DeleteJobContainer
        jobs={jobs}
        setJobs={setJobs} // Still manages the defined jobs list
        handleCancel={handleCancel}
        runningJobs={runningJobs} // Use prop from parent
        showNotification={showNotification}
      />
    );
  } else {
    // Main display logic
    const runningJobIds = Object.keys(runningJobs || {}); // Handle potential initial null/undefined
    const hasRunningOrSubmittingJobs = runningJobIds.some(
      (jobId) =>
        runningJobs[jobId]?.status === "running" ||
        runningJobs[jobId]?.status === "submitting"
    );

    content = (
      <>
        <h1 className="module-header">Job</h1>
        <button className="module-button" onClick={handleCreate}>
          Create Job
        </button>
        {jobs.length > 0 ? (
          <button
            className="module-button-red"
            onClick={handleDelete}
            disabled={hasRunningOrSubmittingJobs} // Use updated check
          >
            Delete Job {hasRunningOrSubmittingJobs ? "(Busy)" : ""}
          </button>
        ) : null}

        {/* Display Running/Recent Jobs using runningJobs prop */}
        {runningJobIds.length > 0 && (
          <div className="jm-running-jobs-section">
            <h2 className="jm-section-subheader">Running / Recent Jobs</h2>
            {runningJobIds.map((jobId) => (
              <RunningJobDisplay
                key={jobId}
                jobInfo={runningJobs[jobId]} // Pass job info from prop
                onAbort={triggerAbortJob} // Pass the wrapper abort handler
              />
            ))}
          </div>
        )}

        {/* Display Defined Jobs */}
        <div className="jobInfoContainer">
          <h2 className="jm-section-subheader">Defined Jobs</h2>
          {jobs.length === 0 && !createClicked && !deleteClicked && (
            <p>No jobs defined yet. Click "Create Job".</p>
          )}
          {/* Pass the wrapper submit handler down */}
          <DisplayInfo
            jobs={jobs}
            clicked={clicked}
            handleClick={handleClick}
            handleSubmitJob={triggerSubmitJob} // Pass the wrapper submit handler
            runningJobs={runningJobs} // Pass running jobs state for display logic
          />
        </div>
      </>
    );
  }

  return <div className="module-body-job">{content}</div>;
}

// --- CreateJobContainer Component (No Changes Needed for this refactor) ---
// It only deals with defining new jobs, not running them.
function CreateJobContainer({
  handleCancel,
  setJobs,
  showNotification,
  existingJobNames,
}) {
  const params = {
    JobName: "",
    i_axisym: -1,
    i_kernel: -1,
    i_neighbour: -1,
    i_intaraction: -1,
    i_Kcorrection: -1,
    i_Mcorrection: -1,
    i_hOpt: -1,
    i_XSPHOpt: -1,
    i_ArtStressOpt: -1,
    i_timeInt: -1,
    ivar_dt: -1,
    alpha1: -1,
    alpha2: -1,
    eps: -1,
    h: -1,
    dt: -1,
    tmax: -1,
    iout: -1,
  };
  const [form, setForm] = useState(params);

  function handleCreate() {
    const trimmedName = form.JobName.trim();
    if (typeof trimmedName !== "string" || trimmedName === "") {
      showNotification("warning", "The job name cannot be empty!");
      return;
    }
    if (
      existingJobNames.some(
        (name) => name.toLowerCase() === trimmedName.toLowerCase()
      )
    ) {
      showNotification("error", `Job name "${trimmedName}" already exists!`);
      return;
    }
    // Ensure numeric values are stored correctly if needed by backend
    const jobData = Object.entries(form).reduce((acc, [key, value]) => {
      if (key !== "JobName" && value !== -1 && !isNaN(value) && value !== "") {
        // Attempt conversion based on type inferred from initial params or input type
        const initialValue = params[key];
        if (
          typeof initialValue === "number" &&
          Number.isInteger(initialValue)
        ) {
          acc[key] = parseInt(value, 10);
        } else if (typeof initialValue === "number") {
          acc[key] = parseFloat(value);
        } else {
          acc[key] = value; // Keep as string if unsure or initial was string
        }
      } else if (key === "JobName") {
        acc[key] = value; // Keep job name as is
      } else {
        acc[key] = -1; // Keep default -1 or original non-numeric value
      }
      return acc;
    }, {});

    setJobs((prevJobs) => [...prevJobs, { ...jobData, JobName: trimmedName }]);
    handleCancel();
  }

  return (
    <>
      <h1 className="module-header">Job Params</h1>
      <button className="module-button-green" onClick={handleCreate}>
        Create
      </button>
      <button className="module-button-red" onClick={handleCancel}>
        Cancel
      </button>
      <div className="partInfoContainer">
        {" "}
        {/* Changed class for consistency */}
        <div className="job-create-container">
          <label>Job Name</label>
          <input
            value={form.JobName}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, JobName: e.target.value }))
            }
          ></input>
        </div>
        <div className="job-create-container">
          <label>2D Formulation</label>
          <select
            value={form.i_axisym}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, i_axisym: e.target.value }))
            }
          >
            <option value={-1}></option>
            <option value={0}>Plane Strain</option>
            <option value={1}>Axisymmetric</option>
          </select>
        </div>
        <div className="job-create-container">
          <label>Kernel Type</label>
          <select
            value={form.i_kernel}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, i_kernel: e.target.value }))
            }
          >
            <option value={-1}></option>
            <option value={0}>Gaussian</option>
            <option value={1}>Cubic</option>
          </select>
        </div>
        <div className="job-create-container">
          <label>Neighbour</label>
          <select
            value={form.i_neighbour}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, i_neighbour: e.target.value }))
            }
          >
            <option value={-1}></option>
            <option value={1}>2h</option>
            <option value={2}>Nearest</option>
          </select>
        </div>
        <div className="job-create-container">
          <label>Interaction</label>
          <select
            value={form.i_intaraction}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, i_intaraction: e.target.value }))
            }
          >
            <option value={-1}></option>
            <option value={1}>Through Kernel</option>
            <option value={2}>Pin-Ball</option>
          </select>
        </div>
        <div className="job-create-container">
          <label>Kernel Correction</label>
          <select
            value={form.i_Kcorrection}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, i_Kcorrection: e.target.value }))
            }
          >
            <option value={-1}></option>
            <option value={0}>No</option>
            <option value={1}>CSPH</option>
            <option value={2}>MLS</option>
          </select>
        </div>
        <div className="job-create-container">
          <label>Momentum Correction</label>
          <input
            type="number"
            value={form.i_Mcorrection === -1 ? "" : form.i_Mcorrection}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                i_Mcorrection:
                  e.target.value === "" ? -1 : parseFloat(e.target.value),
              }))
            }
          ></input>
        </div>
        <div className="job-create-container">
          <label>Smoothing Option</label>
          <select
            value={form.i_hOpt}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, i_hOpt: e.target.value }))
            }
          >
            <option value={-1}></option>
            <option value={0}>Constant</option>
            <option value={1}>Variable</option>
          </select>
        </div>
        <div className="job-create-container">
          <label>XSPH option</label>
          <select
            value={form.i_XSPHOpt}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, i_XSPHOpt: e.target.value }))
            }
          >
            <option value={-1}></option>
            <option value={0}>No</option>
            <option value={1}>Yes</option>
          </select>
        </div>
        <div className="job-create-container">
          <label>Artificial Stress</label>
          <select
            value={form.i_ArtStressOpt}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, i_ArtStressOpt: e.target.value }))
            }
          >
            <option value={-1}></option>
            <option value={0}>No</option>
            <option value={1}>Yes</option>
          </select>
        </div>
        <div className="job-create-container">
          <label>Time Integration Algorithm</label>
          <input
            type="number"
            value={form.i_timeInt === -1 ? "" : form.i_timeInt}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                i_timeInt:
                  e.target.value === "" ? -1 : parseFloat(e.target.value),
              }))
            }
          ></input>
        </div>
        <div className="job-create-container">
          <label>Time Step Option</label>
          <select
            value={form.ivar_dt}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, ivar_dt: e.target.value }))
            }
          >
            <option value={-1}></option>
            <option value={0}>Constant</option>
            <option value={1}>Variable</option>
          </select>
        </div>
        <div className="job-create-container">
          <label>Alpha 1</label>
          <input
            type="number"
            step="any"
            value={form.alpha1 === -1 ? "" : form.alpha1}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                alpha1: e.target.value === "" ? -1 : parseFloat(e.target.value),
              }))
            }
          ></input>
        </div>
        <div className="job-create-container">
          <label>Alpha 2</label>
          <input
            type="number"
            step="any"
            value={form.alpha2 === -1 ? "" : form.alpha2}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                alpha2: e.target.value === "" ? -1 : parseFloat(e.target.value),
              }))
            }
          ></input>
        </div>
        <div className="job-create-container">
          <label>Epsilon XSPH</label>
          <input
            type="number"
            step="any"
            value={form.eps === -1 ? "" : form.eps}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                eps: e.target.value === "" ? -1 : parseFloat(e.target.value),
              }))
            }
          ></input>
        </div>
        <div className="job-create-container">
          <label>Smoothing Length</label>
          <input
            type="number"
            step="any"
            value={form.h === -1 ? "" : form.h}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                h: e.target.value === "" ? -1 : parseFloat(e.target.value),
              }))
            }
          ></input>
        </div>
        <div className="job-create-container">
          <label>Time Step</label>
          <input
            type="number"
            step="any"
            value={form.dt === -1 ? "" : form.dt}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                dt: e.target.value === "" ? -1 : parseFloat(e.target.value),
              }))
            }
          ></input>
        </div>
        <div className="job-create-container">
          <label>Total Time</label>
          <input
            type="number"
            step="any"
            value={form.tmax === -1 ? "" : form.tmax}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                tmax: e.target.value === "" ? -1 : parseFloat(e.target.value),
              }))
            }
          ></input>
        </div>
        <div className="job-create-container">
          <label>Output step</label>
          <input
            type="number"
            value={form.iout === -1 ? "" : form.iout}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                iout: e.target.value === "" ? -1 : parseInt(e.target.value, 10),
              }))
            }
          ></input>
        </div>
      </div>
    </>
  );
}

// --- DisplayInfo Component ---
// Passes props down, including the new handleSubmitJob wrapper
function DisplayInfo({
  jobs,
  clicked,
  handleClick,
  handleSubmitJob, // This is now triggerSubmitJob from JobManager
  runningJobs,
}) {
  return (
    <>
      {jobs.map((job) => (
        <JobInfoComplete
          key={job.JobName}
          clicked={clicked}
          item={job}
          handleClick={handleClick}
          handleSubmitJob={handleSubmitJob} // Pass down the trigger function
          // Determine status based on runningJobs prop
          isRunning={runningJobs[job.JobName]?.status === "running"}
          isSubmitting={runningJobs[job.JobName]?.status === "submitting"}
        />
      ))}
    </>
  );
}

// --- JobInfo Component (No Changes Needed) ---
function JobInfo({ children, handleClick, item }) {
  return (
    <div role="button" onClick={() => handleClick({ item })}>
      {children}
    </div>
  );
}

// --- JobDetails Component ---
// Receives the triggerSubmitJob function via handleSubmitJob prop
function JobDetails({ item, handleSubmitJob, isRunning, isSubmitting }) {
  // Helper functions remain the same
  const displayValue = (value) =>
    value === -1 || value === null || value === undefined ? "" : String(value);
  const displaySelectValue = (value, optionsMap) => {
    const stringValue = String(value);
    return (
      optionsMap[stringValue] ||
      (displayValue(value) ? `Unknown (${value})` : "")
    );
  };
  const axisymMap = { 0: "Plane Strain", 1: "Axisymmetric" };
  const kernelMap = { 0: "Gaussian", 1: "Cubic" };
  const neighbourMap = { 1: "2h", 2: "Nearest" };
  const interactionMap = { 1: "Through Kernel", 2: "Pin-Ball" };
  const kCorrectionMap = { 0: "No", 1: "CSPH", 2: "MLS" };
  const yesNoMap = { 0: "No", 1: "Yes" };
  const constVarMap = { 0: "Constant", 1: "Variable" };

  return (
    <div className="partDetails">
      <label>2D formulation:</label>
      <input
        disabled
        placeholder={displaySelectValue(item.i_axisym, axisymMap)}
      ></input>
      <label>Kernel Type:</label>
      <input
        disabled
        placeholder={displaySelectValue(item.i_kernel, kernelMap)}
      ></input>
      <label>Neighbour:</label>
      <input
        disabled
        placeholder={displaySelectValue(item.i_neighbour, neighbourMap)}
      ></input>
      <label>Interaction:</label>
      <input
        disabled
        placeholder={displaySelectValue(item.i_intaraction, interactionMap)}
      ></input>
      <label>Kernel Correction:</label>
      <input
        disabled
        placeholder={displaySelectValue(item.i_Kcorrection, kCorrectionMap)}
      ></input>
      <label>Momentum Correction:</label>
      <input disabled placeholder={displayValue(item.i_Mcorrection)}></input>
      <label>Smoothing Length Option:</label>
      <input
        disabled
        placeholder={displaySelectValue(item.i_hOpt, constVarMap)}
      ></input>
      <label>XSPH Option:</label>
      <input
        disabled
        placeholder={displaySelectValue(item.i_XSPHOpt, yesNoMap)}
      ></input>
      <label>Artificial Stress:</label>
      <input
        disabled
        placeholder={displaySelectValue(item.i_ArtStressOpt, yesNoMap)}
      ></input>
      <label>Time Integration Algorithm:</label>
      <input disabled placeholder={displayValue(item.i_timeInt)}></input>
      <label>Time Step Option:</label>
      <input
        disabled
        placeholder={displaySelectValue(item.ivar_dt, constVarMap)}
      ></input>
      <label>Alpha 1:</label>
      <input disabled placeholder={displayValue(item.alpha1)}></input>
      <label>Alpha 2:</label>
      <input disabled placeholder={displayValue(item.alpha2)}></input>
      <label>Epsilon XSPH:</label>
      <input disabled placeholder={displayValue(item.eps)}></input>
      <label>Smoothing Length:</label>
      <input disabled placeholder={displayValue(item.h)}></input>
      <label>Time Step:</label>
      <input disabled placeholder={displayValue(item.dt)}></input>
      <label>Total Time:</label>
      <input disabled placeholder={displayValue(item.tmax)}></input>
      <label>Output Step:</label>
      <input disabled placeholder={displayValue(item.iout)}></input>
      <div className="editButtonHolder">
        {/* Button now calls the triggerSubmitJob function passed down */}
        <button
          onClick={() => handleSubmitJob(item)} // Calls triggerSubmitJob(item)
          className="module-button-green"
          disabled={isRunning || isSubmitting}
        >
          {isRunning ? "Running..." : isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </div>
    </div>
  );
}

// --- JobInfoComplete Component ---
// Passes props down correctly
function JobInfoComplete({
  clicked,
  item,
  handleClick,
  handleSubmitJob, // Receives triggerSubmitJob
  isRunning,
  isSubmitting,
}) {
  return (
    <div
      className={
        clicked === item.JobName
          ? "partContainer partContainerClicked"
          : "partContainer"
      }
    >
      <JobInfo handleClick={handleClick} item={item}>
        {clicked === item.JobName ? "-" : "+"} {item.JobName}{" "}
        {/* Display status based on props */}
        {isRunning ? "(Running)" : isSubmitting ? "(Submitting)" : ""}
      </JobInfo>
      {clicked === item.JobName ? (
        <JobDetails
          item={item}
          handleSubmitJob={handleSubmitJob} // Pass down triggerSubmitJob
          isRunning={isRunning}
          isSubmitting={isSubmitting}
        />
      ) : null}
    </div>
  );
}

// --- DeleteJobContainer Component ---
// Uses runningJobs prop correctly (No Changes Needed here)
function DeleteJobContainer({
  jobs,
  setJobs,
  handleCancel,
  runningJobs, // Prop from parent
  showNotification,
}) {
  const deleteJob = (jobName) => {
    // Check against the runningJobs prop
    if (
      runningJobs && // Check if runningJobs exists
      runningJobs[jobName] &&
      (runningJobs[jobName].status === "running" ||
        runningJobs[jobName].status === "submitting")
    ) {
      showNotification(
        "error",
        `Cannot delete job "${jobName}" because it is currently running or submitting.`
      );
      return;
    }
    setJobs((prevJobs) => prevJobs.filter((job) => job.JobName !== jobName));
    showNotification("info", `Job "${jobName}" deleted.`);
  };

  const nonRunningJobs = jobs.filter(
    (job) =>
      !(
        runningJobs && // Check if runningJobs exists
        runningJobs[job.JobName] &&
        (runningJobs[job.JobName].status === "running" ||
          runningJobs[job.JobName].status === "submitting")
      )
  );
  const runningJobNames = jobs
    .filter(
      (job) =>
        runningJobs && // Check if runningJobs exists
        runningJobs[job.JobName] &&
        (runningJobs[job.JobName].status === "running" ||
          runningJobs[job.JobName].status === "submitting")
    )
    .map((j) => j.JobName);

  return (
    <>
      <h1 className="module-header">Delete Job</h1>
      <button onClick={handleCancel} className="module-button-red">
        Cancel
      </button>
      {runningJobNames.length > 0 && (
        <p style={{ color: "orange", marginTop: "10px" }}>
          Cannot delete running/submitting jobs: {runningJobNames.join(", ")}
        </p>
      )}
      <div className="jobInfoContainer">
        {nonRunningJobs.length === 0 &&
          runningJobNames.length === 0 &&
          jobs.length > 0 && (
            <p>All defined jobs are currently running or submitting.</p>
          )}
        {nonRunningJobs.length === 0 && jobs.length === 0 && (
          <p>No jobs defined to delete.</p>
        )}
        {nonRunningJobs.map((job) => (
          <div
            key={job.JobName}
            className="partContainer jm-delete-item"
            role="button"
            onClick={() => deleteJob(job.JobName)}
            title={`Click to delete ${job.JobName}`}
          >
            {job.JobName}{" "}
            <span style={{ color: "red", marginLeft: "10px" }}>
              (Click to Delete)
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
