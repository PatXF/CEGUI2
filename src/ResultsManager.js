import { useState, useEffect, useCallback } from "react";
import "./App.css"; // Assuming shared styles are here

function Results({
  folderPath,
  runningJobs,
  showNotification,
  setCurrentStatus,
}) {
  const [completedJobsData, setCompletedJobsData] = useState([]);
  const [clickedJob, setClickedJob] = useState(null);
  const [selectedFileContent, setSelectedFileContent] = useState(null);
  const [selectedFilePath, setSelectedFilePath] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const scanForResults = useCallback(async () => {
    if (!folderPath) {
      setError("Output folder path is not set.");
      setCompletedJobsData([]);
      return;
    }
    // Check if runningJobs is an object and has keys
    if (
      !runningJobs ||
      typeof runningJobs !== "object" ||
      Object.keys(runningJobs).length === 0
    ) {
      setError("No job information available or jobs not loaded yet.");
      setCompletedJobsData([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    const results = [];
    const completedJobEntries = Object.values(runningJobs).filter(
      (job) => job && job.status === "completed" && job.id // Ensure job and job.id exist
    );

    if (completedJobEntries.length === 0) {
      setError("No jobs have completed successfully yet.");
      setIsLoading(false);
      setCompletedJobsData([]);
      return;
    }

    try {
      // Use Promise.all for potentially faster scanning if API calls are async I/O
      await Promise.all(
        completedJobEntries.map(async (job) => {
          const jobId = job.id;
          try {
            const jobFolderPath = await window.electronAPI.pathJoin(
              folderPath,
              jobId
            );
            // console.log(`Checking folder: ${jobFolderPath} for job ${jobId}`); // Keep for debugging if needed

            const directoryExists = await window.electronAPI.checkPathExists(
              jobFolderPath
            );
            if (!directoryExists) {
              console.warn(
                `Directory not found for completed job ${jobId}: ${jobFolderPath}`
              );
              return; // Skip this job
            }

            const contents = await window.electronAPI.listDirectoryContents(
              jobFolderPath
            );
            const outputFiles = contents.filter(
              (file) =>
                typeof file === "string" &&
                (file === "final_output.txt" || /^output\d+\.txt$/.test(file))
            );

            if (outputFiles.length > 0) {
              results.push({
                id: jobId,
                path: jobFolderPath,
                outputFiles: outputFiles.sort(), // Sort for consistent order
              });
              // console.log(`Found files for ${jobId}:`, outputFiles); // Keep for debugging if needed
            } else {
              // console.log(`No relevant output files found in ${jobFolderPath}`); // Keep for debugging if needed
            }
          } catch (listError) {
            console.error(
              `Error processing folder for job ${jobId}:`,
              listError
            );
            showNotification(
              "warning",
              `Could not read results folder for job ${jobId}.`
            );
          }
        })
      ); // End of Promise.all map

      // Sort results by Job ID for consistent display order
      results.sort((a, b) => a.id.localeCompare(b.id));

      setCompletedJobsData(results);
      if (results.length === 0 && completedJobEntries.length > 0) {
        // Only set this error if jobs *were* completed but no files found
        setError("No output files found for any completed jobs.");
      }
    } catch (scanError) {
      // Catch errors from Promise.all or pathJoin before map
      console.error("Error scanning for results:", scanError);
      setError(`Failed to scan results: ${scanError.message}`);
      showNotification("error", `Error scanning results: ${scanError.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [folderPath, runningJobs, showNotification]);

  useEffect(() => {
    scanForResults();
  }, [scanForResults]);

  const handleJobClick = (jobId) => {
    setClickedJob((prev) => (prev === jobId ? null : jobId));
    setSelectedFileContent(null);
    setSelectedFilePath(null);
  };

  const handleFileClick = async (jobPath, fileName) => {
    // Use pathJoin API to ensure correct path construction
    let fullPath;
    try {
      fullPath = await window.electronAPI.pathJoin(jobPath, fileName);
    } catch (pathError) {
      console.error("Error joining path:", pathError);
      showNotification(
        "error",
        `Internal error creating file path for ${fileName}.`
      );
      setSelectedFileContent(`Error creating path: ${pathError.message}`);
      setSelectedFilePath(null); // Clear path if joining failed
      return;
    }

    setSelectedFileContent("Loading...");
    setSelectedFilePath(fullPath); // Store the correctly joined path
    try {
      const content = await window.electronAPI.readFileContent(fullPath);
      // Replace potential null characters or handle binary data if necessary
      const displayContent =
        typeof content === "string"
          ? content.replace(/\u0000/g, "")
          : "Cannot display binary content.";
      setSelectedFileContent(displayContent);
    } catch (readError) {
      console.error(`Error reading file ${fullPath}:`, readError);
      setSelectedFileContent(`Error loading file: ${readError.message}`);
      showNotification(
        "error",
        `Failed to read file ${fileName}: ${readError.message}`
      );
    }
  };

  const getFileNameFromPath = (filePath) => {
    if (!filePath) return "";
    // Basic split for common separators, consider a more robust library if needed
    const parts = filePath.replace(/\\/g, "/").split("/");
    return parts[parts.length - 1];
  };

  return (
    <div className="module-body">
      <h1 className="module-header">Results</h1>
      <button
        onClick={scanForResults}
        className="module-button"
        disabled={isLoading}
      >
        {isLoading ? "Scanning..." : "Refresh Results"}
      </button>

      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}

      {!isLoading && !error && completedJobsData.length === 0 && (
        <p style={{ marginTop: "10px" }}>
          No completed jobs with output files found in the selected folder, or
          no jobs have completed yet.
        </p>
      )}

      <div className="resultsInfoContainer">
        {completedJobsData.map((job) => (
          <div
            key={job.id}
            className={
              clickedJob === job.id
                ? "partContainer partContainerClicked"
                : "partContainer"
            }
            style={{ height: "auto", minHeight: "30px" }}
          >
            <div
              role="button"
              tabIndex={0}
              onClick={() => handleJobClick(job.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleJobClick(job.id);
              }}
              style={{
                cursor: "pointer",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span style={{ marginRight: "5px" }}>
                {clickedJob === job.id ? "-" : "+"}
              </span>
              {job.id}
            </div>

            {clickedJob === job.id && (
              <div
                className="partDetails"
                style={{
                  height: "auto",
                  display: "block",
                  marginTop: "5px",
                  paddingTop: "5px",
                  borderTop: "1px dashed #ccc",
                }}
              >
                {job.outputFiles.length > 0 ? (
                  job.outputFiles.map((fileName) => (
                    <div
                      key={fileName}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleFileClick(job.path, fileName)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ")
                          handleFileClick(job.path, fileName);
                      }}
                      style={{
                        cursor: "pointer",
                        padding: "3px 5px",
                        margin: "2px 0",
                        borderRadius: "3px",
                        backgroundColor:
                          selectedFilePath &&
                          selectedFilePath.endsWith(fileName)
                            ? "#b9e5e8"
                            : "transparent", // Improved highlight check
                        wordBreak: "break-all",
                      }}
                      className="result-file-item"
                    >
                      {fileName}
                    </div>
                  ))
                ) : (
                  <p style={{ margin: "5px 0", fontStyle: "italic" }}>
                    No relevant output files found in this job's folder.
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedFilePath && (
        <div className="fileContentDisplay">
          <h4
            style={{
              marginTop: 0,
              marginBottom: "5px",
              borderBottom: "1px solid #eee",
              paddingBottom: "5px",
              wordBreak: "break-all",
            }}
          >
            Content of: {getFileNameFromPath(selectedFilePath)}
          </h4>
          <pre
            style={{
              margin: 0,
              whiteSpace: "pre-wrap",
              wordWrap: "break-word",
            }}
          >
            {selectedFileContent}
          </pre>
        </div>
      )}
    </div>
  );
}

export default Results;
