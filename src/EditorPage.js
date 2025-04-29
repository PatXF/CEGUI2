import "./App.css";
// Add useCallback
import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import PartManager from "./PartManager";
import MaterialManager from "./MatExp";
import AssignMaterial from "./MaterialAssign";
import NavBar from "./NavBar";
import ParticleManager from "./ParticleManager";
import File from "./File";
import Displayer from "./Displayer";
import Status from "./Status";
import DropBox from "./Dropbox";
import JobManager from "./JobManager";
import Notification from "./ErrorManager";
import ParticleInfoPopup from "./ParticleInfoPopup";
import Results from "./ResultsManager";

function EditorPage() {
  // Data storage location
  const [folderPath, setFolderPath] = useState("");

  // --- Defined Jobs state ---
  const [jobs, setJobs] = useState([]);

  // --- Running/Completed Jobs state (MOVED UP) ---
  const [runningJobs, setRunningJobs] = useState({});

  const notificationTimerRef = useRef(null);

  const { state } = useLocation();
  const initialParts = state?.parts || [];
  const initialParticles = state?.particles || [];

  const [parts, setParts] = useState(initialParts);
  const [particles, setParticles] = useState(initialParticles); // Keep original nested structure if needed elsewhere
  const [iPartMat, setPartMat] = useState(Array(initialParts.length).fill(-1));
  const [mats, setMats] = useState([]);
  const [currentNav, setCurrNav] = useState("Part");
  const [fileClicked, setFileClicked] = useState(false);
  const [viewClicked, setViewClicked] = useState(false);
  const [currentStatus, setCurrentStatus] = useState([]);

  // theta for rotation
  const [theta, setTheta] = useState(0);

  // Zoom state with max 5x
  const [scale, setScale] = useState(1);

  // Hovering state (group index)
  const [hoveredGroup, setHoveredGroup] = useState(-1); // Used for Group hover mode

  // Viewing states
  const viewButtons = [
    "Zoom",
    "Translate",
    "Rotate",
    "Groups",
    "Points",
    "Reset",
  ];

  const [viewState, setViewState] = useState("Translate");
  const [hoverMode, setHoverMode] = useState("Group");

  // Flattened Particles for easier access and rendering
  const [formattedParticles, setFormattedParticles] = useState([]);

  // Array of 0s (no BC) or 1s (has BC), index corresponds to flatIndex
  const [particleBoundaryConditions, setParticleBoundaryConditions] = useState(
    []
  );

  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [selectedParticleInfo, setSelectedParticleInfo] = useState(null); // Stores { flatIndex, particle }

  // handling the reset feature, when clicked the entire view resets to original
  function handleViewReset() {
    setViewState("Translate");
    setHoverMode("Group");
    setScale(1);
    setTheta(0);
  }

  useEffect(() => {
    if (viewState === "Reset") {
      handleViewReset();
    }
  }, [viewState]);

  // Function to trigger notification (remains the same)
  const showNotification = useCallback((type, msg) => {
    if (notificationTimerRef.current) {
      clearTimeout(notificationTimerRef.current);
    }
    setMessageType(type);
    setMessage(msg);
    notificationTimerRef.current = setTimeout(() => {
      setMessageType(null);
      setMessage(null);
      notificationTimerRef.current = null;
    }, 5000 + 100);
  }, []); // Empty dependency array, as setters don't change

  // Cleanup timer on component unmount (remains the same)
  useEffect(() => {
    return () => {
      if (notificationTimerRef.current) {
        clearTimeout(notificationTimerRef.current);
      }
    };
  }, []);

  // Effect to flatten particles when 'particles' state changes (remains the same)
  useEffect(() => {
    if (!Array.isArray(particles)) {
      console.warn("Particles data is not an array. Cannot flatten.");
      setFormattedParticles([]);
      return;
    }

    const newFlattenedParticles = particles.flatMap(
      (partParticles, partIndex) => {
        if (!Array.isArray(partParticles)) {
          showNotification(
            "warning",
            `Particles for part ${partIndex} is not an array.`
          );
          console.warn(
            `Element at index ${partIndex} in particles is not an array.`
          );
          return [];
        }
        return partParticles.map((particle) => ({
          ...particle,
          idPart: partIndex,
        }));
      }
    );
    setFormattedParticles(newFlattenedParticles);
  }, [particles, showNotification]); // Added showNotification dependency

  // Runs whenever the formattedParticles array changes its length or reference (remains the same)
  useEffect(() => {
    console.log(
      "Formatted particles changed, resetting boundary condition tracker."
    );
    // Initialize with 0s only if length changes to avoid resetting unnecessarily
    setParticleBoundaryConditions((prev) =>
      prev.length === formattedParticles.length
        ? prev
        : new Array(formattedParticles.length).fill(0)
    );
  }, [formattedParticles]); // Dependency only on formattedParticles

  // Logging effects (can be kept or removed)
  useEffect(() => {
    console.log("Particles updated:", particles);
  }, [particles]);
  useEffect(() => {
    console.log("Parts updated:", parts);
  }, [parts]);
  useEffect(() => {
    console.log("Current View Action:", viewState);
    console.log("Current Hover Mode:", hoverMode);
  }, [viewState, hoverMode]);

  // View state handling (remains the same)
  function handleViewState(ViewType) {
    console.log("Setting View Action:", ViewType);
    setViewState(ViewType);
    if (ViewType === "Groups") setHoverMode("Group");
    else if (ViewType === "Points") setHoverMode("Point");
    setHoveredGroup(-1);
  }

  // Particle click handling (remains the same)
  const handleParticleClick = (flatIndex) => {
    if (hoverMode !== "Point") return;
    if (flatIndex >= 0 && flatIndex < formattedParticles.length) {
      const particleData = formattedParticles[flatIndex];
      setSelectedParticleInfo({ flatIndex: flatIndex, particle: particleData });
      setIsPopupVisible(true);
    } else {
      console.warn("Invalid flatIndex received:", flatIndex);
    }
  };

  const handleClosePopup = () => {
    setIsPopupVisible(false);
    setSelectedParticleInfo(null);
  };

  // BC handling (remains the same)
  const handleAddBoundaryCondition = (particleInfo) => {
    const { flatIndex } = particleInfo;
    setParticleBoundaryConditions((prevConditions) => {
      const newConditions = [...prevConditions];
      if (
        flatIndex >= 0 &&
        flatIndex < newConditions.length &&
        newConditions[flatIndex] === 0
      ) {
        newConditions[flatIndex] = 1;
        showNotification(
          "info",
          `Added Boundary Conditions to Particle-${flatIndex}`
        );
      } else {
        showNotification(
          "warning",
          `Could not add BC: Invalid index or BC already exists. Particle-${flatIndex}`
        );
      }
      return newConditions;
    });
    handleClosePopup();
  };

  const handleRemoveBoundaryCondition = (particleInfo) => {
    const { flatIndex } = particleInfo;
    setParticleBoundaryConditions((prevConditions) => {
      const newConditions = [...prevConditions];
      if (
        flatIndex >= 0 &&
        flatIndex < newConditions.length &&
        newConditions[flatIndex] === 1
      ) {
        newConditions[flatIndex] = 0;
        showNotification(
          "info",
          `Removed Boundary Conditions from Particle-${flatIndex}`
        );
        // Add actual logic here if removing involves more than resetting the flag
      } else {
        showNotification(
          "warning",
          `Could not remove BC: Invalid index or no BC exists. Particle-${flatIndex}`
        );
      }
      return newConditions;
    });
    handleClosePopup();
  };

  // for errors (remains the same)
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);

  // --- JOB MANAGER LOGIC MOVED UP ---

  // 1. Listeners for Job Updates (MOVED UP)
  useEffect(() => {
    const handleProgress = (data) => {
      setRunningJobs((prev) => ({
        ...prev,
        [data.jobId]: {
          ...prev[data.jobId], // Keep existing info like id, status, message
          id: data.jobId, // Ensure id is present
          progress: data.progress,
          elapsedTime: data.elapsedTime,
          // Only set status to 'running' if it's not already finished
          status:
            prev[data.jobId]?.status === "completed" ||
            prev[data.jobId]?.status === "error" ||
            prev[data.jobId]?.status === "aborted"
              ? prev[data.jobId].status
              : "running",
        },
      }));
    };

    const handleStatus = (data) => {
      console.log("EditorPage: Status Update Received:", data);
      setRunningJobs((prev) => {
        // Ensure we have a base object even if progress updates haven't arrived yet
        const baseJob = prev[data.jobId] || {
          id: data.jobId,
          progress: 0,
          elapsedTime: 0,
        };
        if (
          data.status === "completed" ||
          data.status === "error" ||
          data.status === "aborted"
        ) {
          return {
            ...prev,
            [data.jobId]: {
              ...baseJob, // Use base or existing job info
              status: data.status,
              message: data.message,
              // Ensure progress is 100 on complete, keep existing otherwise
              progress: data.status === "completed" ? 100 : baseJob.progress,
              // Update elapsedTime if provided in the status update
              elapsedTime:
                data.elapsedTime !== undefined
                  ? data.elapsedTime
                  : baseJob.elapsedTime,
            },
          };
        }
        // If the status is not terminal, we might not need to update here,
        // as handleProgress usually covers 'running'. Or update elapsedTime/message if needed.
        return prev; // Return previous state if status is not terminal
      });

      // Update global status/notifications from parent
      if (data.status === "completed") {
        setCurrentStatus((prev) => [
          ...prev,
          `Success: ${data.message || `Job ${data.jobId} Completed`}`,
        ]);
        showNotification(
          "success",
          data.message || `Job ${data.jobId} Completed`
        );
      } else if (data.status === "error") {
        setCurrentStatus((prev) => [
          ...prev,
          `Error: ${data.message || `Job ${data.jobId} Failed`}`,
        ]);
        showNotification("error", data.message || `Job ${data.jobId} Failed`);
      } else if (data.status === "aborted") {
        setCurrentStatus((prev) => [
          ...prev,
          `Aborted: ${data.message || `Job ${data.jobId} Aborted`}`,
        ]);
        showNotification(
          "warning",
          data.message || `Job ${data.jobId} Aborted`
        );
      }
    };

    // Register listeners
    window.electronAPI.onJobProgress(handleProgress);
    window.electronAPI.onJobStatus(handleStatus);

    // Cleanup function
    return () => {
      window.electronAPI.removeJobProgressListener();
      window.electronAPI.removeJobStatusListener();
    };
  }, [setCurrentStatus, showNotification]); // Dependencies: functions called inside

  // 2. Validity Check Helper (MOVED UP or adapted from JobManager)
  const checkJobValidity = useCallback(() => {
    // Check parts
    for (let index = 0; index < parts.length; index++) {
      const item = parts[index];
      if (!item || item.npPart <= 0) {
        showNotification(
          "error",
          `The number of particles in ${
            item?.PartName || `Part ${index}`
          } is invalid!`
        );
        return false;
      }
      if (item.TypPart !== "deformable" && item.TypPart !== "rigid") {
        showNotification(
          "error",
          `Part type in ${item?.PartName || `Part ${index}`} is invalid!`
        );
        return false;
      }
    }
    // Check material assignments
    for (let index = 0; index < iPartMat.length; index++) {
      if (index >= parts.length) continue; // Only check for existing parts
      if (iPartMat[index] < 0 || iPartMat[index] >= mats.length) {
        showNotification(
          "error",
          iPartMat[index] === -1
            ? `No material is assigned to ${
                parts[index]?.PartName || `Part ${index}`
              }`
            : `Invalid material index assigned to ${
                parts[index]?.PartName || `Part ${index}`
              }`
        );
        return false;
      }
    }
    // Add other checks if needed (e.g., boundary conditions, particle data)
    return true;
  }, [parts, mats, iPartMat, showNotification]); // Dependencies needed for the check

  // 3. Submit Job Handler (MOVED UP)
  const handleSubmitJobParent = useCallback(
    async (jobName) => {
      const jobToSubmit = jobs.find((j) => j.JobName === jobName);
      if (!jobToSubmit) {
        showNotification("error", `Job definition for ${jobName} not found.`);
        return;
      }

      const jobId = jobName; // Using job name as unique ID

      if (
        runningJobs[jobId]?.status === "running" ||
        runningJobs[jobId]?.status === "submitting"
      ) {
        showNotification(
          "warning",
          `Job ${jobId} is already running or submitting.`
        );
        return;
      }
      if (!folderPath) {
        showNotification(
          "error",
          "Output folder path is not set. Please select a folder first."
        );
        return;
      }

      // Perform validity check using the helper
      if (!checkJobValidity()) {
        return;
      }

      try {
        const jobFolderPath = await window.electronAPI.pathJoin(
          folderPath,
          jobId
        );

        // Construct the data payload
        const combinedJobData = {
          jobParams: jobToSubmit,
          generalData: {
            // Use the state variables available in EditorPage
            boundary: particleBoundaryConditions, // Ensure this is the correct boundary data format
            parts: parts,
            iPartMat: iPartMat,
            mats: mats,
            particles: formattedParticles, // Use flattened or original based on backend expectation
          },
        };

        // Optional: Check for serialization errors early
        try {
          JSON.stringify(combinedJobData);
        } catch (serializeError) {
          showNotification(
            "error",
            `Data serialization error: ${serializeError.message}`
          );
          console.error(
            "Serialization error:",
            serializeError,
            combinedJobData
          );
          return;
        }

        // Update state to 'submitting'
        setRunningJobs((prev) => ({
          ...prev,
          [jobId]: {
            id: jobId,
            progress: 0,
            elapsedTime: 0,
            status: "submitting",
            message: "Submitting...",
          },
        }));
        setCurrentStatus((prev) => [...prev, `Submitting Job-${jobId}...`]);

        // Call the Electron API
        const result = await window.electronAPI.submitJob(
          combinedJobData,
          jobFolderPath
        );

        if (result.success) {
          showNotification("info", `Job ${jobId} submitted successfully.`);
          // Don't set to 'running' here; let the handleProgress/handleStatus listener do it
        } else {
          showNotification("error", `Job submission failed: ${result.message}`);
          setCurrentStatus((prev) => [
            ...prev,
            `Error submitting Job-${jobId}: ${result.message}`,
          ]);
          // Reset the job state if submission itself failed
          setRunningJobs((prev) => {
            const newState = { ...prev };
            delete newState[jobId];
            return newState;
          });
        }
      } catch (error) {
        console.error("Submission error:", error);
        showNotification(
          "error",
          `Submission failed: ${error.message || "Unknown error"}`
        );
        setCurrentStatus((prev) => [
          ...prev,
          `Error during submission for Job-${jobId}: ${error.message}`,
        ]);
        // Reset the job state on catch
        setRunningJobs((prev) => {
          const newState = { ...prev };
          delete newState[jobId];
          return newState;
        });
      }
    },
    [
      jobs,
      runningJobs,
      folderPath,
      checkJobValidity, // Use the validity checker callback
      particleBoundaryConditions,
      parts,
      iPartMat,
      mats,
      formattedParticles, // Data needed for payload
      setCurrentStatus,
      showNotification, // Utilities
    ]
  ); // Dependencies for the callback

  // 4. Abort Job Handler (MOVED UP)
  const handleAbortJobParent = useCallback(
    async (jobId) => {
      if (runningJobs[jobId]?.status !== "running") {
        showNotification(
          "info",
          `Job ${jobId} is not currently running or cannot be aborted.`
        );
        return;
      }

      try {
        setCurrentStatus((prev) => [
          ...prev,
          `Attempting to abort Job-${jobId}...`,
        ]);
        const result = await window.electronAPI.abortJob(jobId);
        if (result.success) {
          showNotification(
            "warning",
            `Abort signal sent to Job ${jobId}. Waiting for confirmation...`
          );
          // Optional: Immediately update status to 'aborting' visually?
          // setRunningJobs(prev => ({ ...prev, [jobId]: { ...prev[jobId], status: 'aborting', message: 'Aborting...' } }));
          // The 'aborted' status update should ideally come from the handleStatus listener.
        } else {
          showNotification(
            "error",
            `Failed to send abort signal to Job ${jobId}: ${result.message}`
          );
          setCurrentStatus((prev) => [
            ...prev,
            `Error aborting Job-${jobId}: ${result.message}`,
          ]);
        }
      } catch (error) {
        console.error("Abort error:", error);
        showNotification(
          "error",
          `Abort request failed for Job ${jobId}: ${
            error.message || "Unknown error"
          }`
        );
        setCurrentStatus((prev) => [
          ...prev,
          `Error during abort for Job-${jobId}: ${error.message}`,
        ]);
      }
    },
    [runningJobs, setCurrentStatus, showNotification]
  ); // Dependencies

  // --- END OF JOB MANAGER LOGIC MOVED UP ---

  return (
    <div className="editor-page-wrapper">
      <div className="nav-bar-container">
        {/* NavBar component remains the same */}
        <NavBar
          buttons={[
            { name: "Part" },
            { name: "Particles" },
            { name: "Material" },
            { name: "Assign Material" },
            { name: "Job" },
            { name: "Results" },
          ]}
          selectedOption={currentNav}
          setSelectedOption={setCurrNav}
          fileClicked={fileClicked}
          setFileClicked={setFileClicked}
          viewClicked={viewClicked}
          setViewClicked={setViewClicked}
        />
      </div>

      {isPopupVisible && (
        <div className="popup-overlay" onClick={handleClosePopup}></div>
      )}

      {/* File and DropBox components remain the same */}
      {fileClicked && (
        <File
          parts={parts}
          setJsonData={setParts} // Might need renaming if it only sets parts
          setFileClicked={setFileClicked}
          mats={mats}
          iPartMat={iPartMat}
          particles={particles} // Pass original or formatted based on what File needs
          setIPartMat={setPartMat}
          setMats={setMats}
          setParticles={setParticles} // Setter for original particle structure
          setParts={setParts}
          setCurrNav={setCurrNav}
          setCurrentStatus={setCurrentStatus}
          setFolderPath={setFolderPath}
          boundary={particleBoundaryConditions}
          // Pass jobs state if File needs to load/save them
          jobs={jobs}
          setJobs={setJobs}
          // Pass running jobs if File needs info about them (e.g., prevent loading over running job folder)
          runningJobs={runningJobs}
        />
      )}
      {viewClicked && (
        <DropBox
          dropButtons={viewButtons}
          handleViewState={handleViewState}
          setViewClicked={setViewClicked}
        ></DropBox>
      )}

      <div className={`main-content ${isPopupVisible ? "blurred" : ""}`}>
        {messageType && (
          <Notification type={messageType} message={message} duration={5000} />
        )}
        <Displayer
          formattedParticles={formattedParticles}
          hoveredGroup={hoveredGroup}
          setHoveredGroup={setHoveredGroup}
          viewState={viewState}
          hoverMode={hoverMode}
          onParticleClick={handleParticleClick}
          scale={scale}
          setScale={setScale}
          theta={(theta / 360) * 6.28}
          showNotification={showNotification}
        />
        <div className="module-container-right">
          {viewState === "Rotate" ? (
            <div className="theta-input">
              <label>Theta</label>
              <input
                type="number"
                step="any"
                value={theta} // Control the input
                onChange={(e) => setTheta(parseFloat(e.target.value))}
              />
              <button
                className="module-button-green"
                onClick={() => setViewState("Translate")}
              >
                Done
              </button>
            </div>
          ) : null}

          {/* Module rendering based on currentNav */}
          {currentNav === "Part" ? (
            <PartManager
              parts={parts}
              setParts={setParts}
              setCurrentStatus={setCurrentStatus}
              hoveredGroup={hoveredGroup}
              setHoveredGroup={setHoveredGroup}
              showNotification={showNotification}
              particles={particles} // Original nested structure if needed
              setParticles={setParticles}
              iPartMat={iPartMat}
              setPartMat={setPartMat}
            />
          ) : currentNav === "Particles" ? (
            <ParticleManager
              parts={parts}
              particles={particles} // Original nested structure
              setParticles={setParticles}
              formattedParticles={formattedParticles} // Pass flattened too if needed
              // setFormattedParticles={setFormattedParticles} // Setter likely not needed here
              showNotification={showNotification}
            />
          ) : currentNav === "Material" ? (
            <MaterialManager
              mats={mats}
              setMats={setMats}
              showNotification={showNotification}
            />
          ) : currentNav === "Assign Material" ? (
            <AssignMaterial
              parts={parts}
              mats={mats}
              setPartMat={setPartMat}
              iPartMat={iPartMat}
              showNotification={showNotification}
              setCurrentStatus={setCurrentStatus}
            />
          ) : currentNav === "Job" ? (
            // *** PASS NEW PROPS TO JobManager ***
            <JobManager
              // Pass state needed for job definition and context
              folderPath={folderPath}
              parts={parts}
              particles={formattedParticles} // Pass flattened for consistency? Check JobManager usage
              iPartMat={iPartMat}
              mats={mats}
              boundary={particleBoundaryConditions} // Pass boundary data
              // Pass defined jobs state + setter
              jobs={jobs}
              setJobs={setJobs}
              // Pass running jobs state (READ-ONLY for JobManager)
              runningJobs={runningJobs} // <-- MOVED STATE
              // Pass handlers (Callbacks defined above)
              onSubmitJob={handleSubmitJobParent} // <-- NEW HANDLER
              onAbortJob={handleAbortJobParent} // <-- NEW HANDLER
              // Pass utilities
              setCurrentStatus={setCurrentStatus}
              showNotification={showNotification}
            />
          ) : (
            <Results
              folderPath={folderPath}
              runningJobs={runningJobs}
              showNotification={showNotification}
              setCurrentStatus={setCurrentStatus}
            ></Results>
          )}
        </div>
      </div>

      {/* Popup rendering remains the same */}
      {isPopupVisible && selectedParticleInfo && (
        <ParticleInfoPopup
          particleInfo={selectedParticleInfo}
          onClose={handleClosePopup}
          onAddBoundaryCondition={handleAddBoundaryCondition}
          onRemoveBoundaryCondition={handleRemoveBoundaryCondition}
          particleBoundaryConditions={particleBoundaryConditions}
        />
      )}
      <div className="status">
        {/* Status component remains the same */}
        <Status
          currentStatus={currentStatus}
          setCurrentStatus={setCurrentStatus}
        >
          {currentStatus.map((item, index) => (
            <p key={index} className="Updates">
              {item}
            </p>
          ))}
        </Status>
      </div>
    </div>
  );
}

export default EditorPage;
