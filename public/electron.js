// --- START OF FILE electron.js ---

const { app, BrowserWindow, Menu, dialog, ipcMain } = require("electron");
let store;
const util = require("util");
const path = require("path"); // Make sure path is required
const fs = require("fs");
const { spawn } = require("child_process"); // Import spawn

const mkdirAsync = util.promisify(fs.mkdir);
const writeFileAsync = util.promisify(fs.writeFile);
const statAsync = util.promisify(fs.stat);
const readdirAsync = util.promisify(fs.readdir);
const readFileAsync = util.promisify(fs.readFile);

// Map to store running processes and their timers
const runningProcesses = new Map();

// Dynamically import `electron-store`
async function loadStore() {
  // ... (keep existing loadStore function)
  try {
    // Ensure electron-store is treated as ESM if needed
    const { default: Store } = await import("electron-store");
    store = new Store();
    console.log(">>> Electron Store loaded successfully.");
  } catch (error) {
    console.error(">>> Failed to load Electron Store:", error);
    // Handle error appropriately, maybe show a dialog
    dialog.showErrorBox(
      "Initialization Error",
      "Failed to load essential configuration module. The application might not work correctly."
    );
  }
}

let mainWindow;

function createWindow() {
  const isDev = !app.isPackaged;

  const appRoot = app.getAppPath();
  const iconPath = path.join(
    isDev ? appRoot : path.join(appRoot, "build"),
    "icon.ico"
  );
  const preloadScriptPath = path.join(__dirname, "preload.js");
  const indexHtmlPath = path.join(appRoot, "build", "index.html");

  console.log(`>>> App Root: ${appRoot}`);
  console.log(`>>> Is Development: ${isDev}`);
  console.log(`>>> Icon Path: ${iconPath}`);
  console.log(`>>> Preload Path: ${preloadScriptPath}`);
  console.log(`>>> Index HTML Path (for prod): ${indexHtmlPath}`);

  mainWindow = new BrowserWindow({
    frame: false,
    width: 1920,
    height: 1080,
    icon: iconPath,
    webPreferences: {
      preload: preloadScriptPath,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
      devTools: false, // 🔥 THIS disables DevTools access completely
    },
  });

  const loadURL = isDev ? "http://localhost:3000" : `file://${indexHtmlPath}`;

  console.log(`>>> Loading URL: ${loadURL}`);

  Menu.setApplicationMenu(null);

  mainWindow
    .loadURL(loadURL)
    .then(() => {
      console.log(">>> mainWindow.loadURL Successful");
      // 🚫 No opening DevTools even in development
    })
    .catch((err) => {
      console.error(">>> mainWindow.loadURL Failed:", err);
      dialog.showErrorBox(
        "Load Error",
        `Failed to load application content: ${err.message}\nURL: ${loadURL}`
      );
      // 🚫 Also no opening DevTools on failure
    });

  mainWindow.webContents.on(
    "did-fail-load",
    (event, errorCode, errorDescription, validatedURL) => {
      console.error(
        `>>> WebContents Failed to load URL: ${validatedURL}. Error ${errorCode}: ${errorDescription}`
      );
      if (validatedURL === loadURL && !mainWindow.webContents.isLoading()) {
        dialog.showErrorBox(
          "Load Error",
          `Failed to load application content.\nURL: ${validatedURL}\nError: ${errorDescription} (${errorCode})`
        );
        // 🚫 No DevTools on did-fail-load either
      }
    }
  );

  mainWindow.on("closed", () => {
    console.log(">>> MainWindow closed");
    runningProcesses.forEach((procInfo, jobId) => {
      console.log(
        `>>> Terminating process for job ${jobId} due to window close.`
      );
      if (procInfo.timerId) clearInterval(procInfo.timerId);
      if (procInfo.child && !procInfo.child.killed) {
        procInfo.child.kill("SIGTERM");
      }
    });
    runningProcesses.clear();
    mainWindow = null;
  });
}

// ... (keep app event listeners: ready, window-all-closed, activate)
app.on("ready", async () => {
  console.log(">>> App ready event received.");
  await loadStore(); // Wait for store to load before creating window
  console.log(">>> loadStore finished.");
  createWindow();
  console.log(">>> createWindow called.");
});

app.on("window-all-closed", () => {
  console.log(">>> window-all-closed event received.");
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  console.log(">>> activate event received.");
  if (BrowserWindow.getAllWindows().length === 0) {
    if (app.isReady()) {
      createWindow();
    } else {
      console.warn(">>> Activate event received but app is not ready yet.");
    }
  }
});

// --- IPC Handlers ---

// ... (keep existing handlers: save-json-file, open-json-file, window:minimize, window:close, select-folder, createFolder, pathJoin, writeJson)
ipcMain.handle("save-json-file", async (event, data) => {
  // ... (your existing code)
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    title: "Save Master JSON File",
    defaultPath: "simulation_data.json",
    filters: [{ name: "JSON Files", extensions: ["json"] }],
  });
  if (canceled || !filePath) return null;
  const folderPath = path.dirname(filePath); // Get directory from chosen file path
  try {
    // No need to mkdir here if we are just saving a file
    // fs.mkdirSync(folderPath, { recursive: true }); // Redundant if showSaveDialog returns folder
    const masterFilePath = filePath; // Use the full path from dialog
    fs.writeFileSync(masterFilePath, JSON.stringify(data, null, 2));
    // Return the FOLDER path where the file was saved for consistency? Or the file path?
    // Let's return the folder path as the original code seemed to expect that.
    return folderPath;
  } catch (error) {
    console.error("Error saving master JSON file:", error);
    dialog.showErrorBox("Save Error", `Failed to save file: ${error.message}`);
    return null;
  }
});

ipcMain.handle("open-json-file", async () => {
  // ... (your existing code)
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: "Open JSON Data File",
    properties: ["openFile"],
    filters: [{ name: "JSON Files", extensions: ["json"] }],
  });
  if (canceled || filePaths.length === 0) return null;
  const filePath = filePaths[0];
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading JSON file:", error);
    dialog.showErrorBox(
      "Open Error",
      `Failed to open or parse file: ${error.message}`
    );
    return null;
  }
});

ipcMain.on("window:minimize", () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on("window:close", () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.handle("select-folder", async () => {
  // ... (your existing code)
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    properties: ["openDirectory"],
  });
  if (canceled || filePaths.length === 0) return null;

  const selectedPath = filePaths[0];
  if (store) {
    store.set("folderPath", selectedPath);
  }
  return selectedPath;
});

ipcMain.handle("createFolder", async (event, folderPath) => {
  // ... (your existing code)
  if (!folderPath || typeof folderPath !== "string") {
    return { success: false, error: "Invalid Folder Path!" };
  }
  try {
    await mkdirAsync(folderPath, { recursive: true });
    return { success: true, message: `Output path set to ${folderPath}` };
  } catch (error) {
    console.error(
      `IPC createFolder: Error creating folder "${folderPath}":`,
      error
    );
    let errorMessage = `Failed to create folder: ${error.message}`;
    dialog.showErrorBox("Folder Creation Error", errorMessage);
    return { success: false, error: errorMessage, errorCode: error.code };
  }
});

ipcMain.handle("pathJoin", async (event, ...args) => {
  // ... (your existing code)
  try {
    const joinedPath = path.join(...args);
    return joinedPath;
  } catch (error) {
    console.error("IPC pathJoin: Error joining path:", error);
    return null;
  }
});

ipcMain.handle("writeJson", async (event, filePath, data) => {
  // Corrected: Use writeFileAsync from promisified fs
  try {
    await writeFileAsync(filePath, JSON.stringify(data, null, 2));
    return { success: true };
  } catch (error) {
    console.error(`IPC writeJson: Error writing file "${filePath}":`, error);
    dialog.showErrorBox(
      "File Write Error",
      `Failed to write JSON file: ${error.message}`
    );
    // Return an error object or throw, depending on how you handle it in renderer
    return { success: false, error: error.message };
    // OR: throw error; // If you want the promise to reject in the renderer
  }
});

// --- New Job Execution Handlers ---

// Function to run a single Fortran executable
function runFortranProcess(executablePath, args, cwd, jobId, stepName) {
  return new Promise((resolve, reject) => {
    console.log(`[${jobId}] Running: ${executablePath} in ${cwd}`);
    const child = spawn(executablePath, args, { cwd }); // Execute in the job's directory

    // Store the child process reference for potential abortion
    if (runningProcesses.has(jobId)) {
      runningProcesses.get(jobId).child = child;
    } else {
      // Should not happen if called from submit-job, but maybe add safety?
      console.warn(
        `[${jobId}] Process started but no entry in runningProcesses map.`
      );
    }

    child.stdout.on("data", (data) => {
      console.log(`[${jobId}-${stepName} stdout]: ${data}`);
      // Potentially parse stdout for finer-grained progress later
    });

    child.stderr.on("data", (data) => {
      console.error(`[${jobId}-${stepName} stderr]: ${data}`);
      // Send error info back?
    });

    child.on("close", (code) => {
      console.log(`[${jobId}-${stepName}] process exited with code ${code}`);
      // Clear the child process reference for this step
      if (runningProcesses.has(jobId)) {
        runningProcesses.get(jobId).child = null;
      }
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(`${stepName} failed with exit code ${code}. Check stderr.`)
        );
      }
    });

    child.on("error", (err) => {
      console.error(`[${jobId}-${stepName}] Failed to start process:`, err);
      if (runningProcesses.has(jobId)) {
        runningProcesses.get(jobId).child = null;
      }
      reject(new Error(`Failed to start ${stepName}: ${err.message}`));
    });
  });
}

// Handler for submitting a job
ipcMain.handle("submit-job", async (event, jobData, jobFolderPath) => {
  const jobId = jobData.jobParams.JobName; // Use JobName as unique ID

  if (runningProcesses.has(jobId)) {
    console.warn(`[${jobId}] Job is already running.`);
    return { success: false, message: `Job ${jobId} is already running.` };
  }

  console.log(
    `[${jobId}] Received submission request. Folder: ${jobFolderPath}`
  );

  // --- Determine Executable Paths ---
  const isDev = !app.isPackaged; // More reliable check
  let binPath;

  if (isDev) {
    // Development mode: Assume 'bin' folder is at the project root
    // process.cwd() is usually the project root when running `npm run electron`
    binPath = path.join(process.cwd(), "bin");
    console.log(`[${jobId}] [Dev Mode] Expecting executables in: ${binPath}`);
  } else {
    // Production mode (packaged app): Executables should be in the 'resources/bin' folder
    // This assumes you configure electron-builder to copy 'bin' into 'resources/bin'
    // using the "extraResources" option in package.json.
    binPath = path.join(process.resourcesPath, "bin");
    console.log(
      `[${jobId}] [Production Mode] Expecting executables in: ${binPath}`
    );
    // --- Verification Log ---
    // Let's check if the calculated resources path actually exists
    try {
      const stats = await statAsync(process.resourcesPath);
      console.log(
        `[${jobId}] Verified resources path exists: ${process.resourcesPath}`
      );
      // Optionally list contents of resources path for debugging
      // const resContents = await readdirAsync(process.resourcesPath);
      // console.log(`[${jobId}] Contents of resourcesPath:`, resContents);
      // And check the bin directory specifically
      try {
        const binStats = await statAsync(binPath);
        console.log(
          `[${jobId}] Verified bin path exists inside resources: ${binPath}`
        );
      } catch (binErr) {
        console.error(
          `[${jobId}] The calculated bin path (${binPath}) does NOT exist or is not accessible! Error: ${binErr.code}`
        );
        // This strongly suggests the files weren't copied correctly by electron-builder.
      }
    } catch (err) {
      console.error(
        `[${jobId}] The calculated resources path (${process.resourcesPath}) does NOT exist or is not accessible! Error: ${err.code}`
      );
    }
    // --- End Verification Log ---
  }

  const ext = process.platform === "win32" ? ".exe" : ""; // Keep platform detection
  const prog1Exe = path.join(binPath, `prog1${ext}`);
  const prog2Exe = path.join(binPath, `prog2${ext}`);
  const prog3Exe = path.join(binPath, `prog3${ext}`);

  console.log(`[${jobId}] Calculated path for prog1: ${prog1Exe}`);
  console.log(`[${jobId}] Calculated path for prog2: ${prog2Exe}`);
  console.log(`[${jobId}] Calculated path for prog3: ${prog3Exe}`);

  // --- Check if executables exist (using the calculated paths) ---
  // Use asynchronous check for consistency, although sync is often fine here at startup
  try {
    await statAsync(prog1Exe);
    await statAsync(prog2Exe);
    await statAsync(prog3Exe);
    console.log(
      `[${jobId}] All required executables seem to exist at calculated paths.`
    );
  } catch (error) {
    // This is where your original error likely occurred in production
    const missingExePath = error.path || "Unknown executable"; // error.path usually contains the problematic path
    const errorMsg = `Required executable not found or inaccessible: ${missingExePath}\nError code: ${error.code}`;
    console.error(`[${jobId}] ${errorMsg}`);
    console.error(`[${jobId}] Full stat error:`, error); // Log the full error object
    dialog.showErrorBox(
      "Execution Error",
      errorMsg + "\n\nPlease check the application installation and logs."
    );
    return { success: false, message: errorMsg };
  }

  // --- Prepare Input Data ---
  // ... (rest of your submit-job handler remains the same)
  const combinedInputPath = path.join(jobFolderPath, "input_combined.json");
  try {
    // Create the job folder first
    await mkdirAsync(jobFolderPath, { recursive: true });
    console.log(`[${jobId}] Created job folder: ${jobFolderPath}`);

    // Write the combined data (job specific params + general data)
    await writeFileAsync(combinedInputPath, JSON.stringify(jobData, null, 2));
    console.log(`[${jobId}] Wrote combined input to ${combinedInputPath}`);
  } catch (error) {
    console.error(`[${jobId}] Error preparing input files:`, error);
    dialog.showErrorBox(
      "Setup Error",
      `Failed to prepare input data for job ${jobId}: ${error.message}`
    );
    return {
      success: false,
      message: `Failed to prepare input data: ${error.message}`,
    };
  }

  // --- Start Execution Sequence ---
  // ... (rest of your submit-job handler remains the same) ...
  const startTime = Date.now();
  let timerId = null;

  // Send initial progress (0%) and start timer
  mainWindow.webContents.send("job-progress", {
    jobId,
    progress: 0,
    elapsedTime: 0,
  });
  timerId = setInterval(() => {
    const elapsedTime = Math.round((Date.now() - startTime) / 1000);
    // Don't send progress here, just update time based on the last known progress
    if (runningProcesses.has(jobId)) {
      const currentProgress = runningProcesses.get(jobId).progress || 0;
      mainWindow.webContents.send("job-progress", {
        jobId,
        progress: currentProgress,
        elapsedTime,
      });
    } else {
      clearInterval(timerId); // Stop timer if job entry removed
    }
  }, 1000); // Update elapsed time every second

  // Store process info
  runningProcesses.set(jobId, { child: null, timerId, startTime, progress: 0 });

  // Run asynchronously
  (async () => {
    try {
      // Step 1
      runningProcesses.get(jobId).progress = 5; // Indicate starting step 1
      mainWindow.webContents.send("job-progress", {
        jobId,
        progress: 5,
        elapsedTime: Math.round((Date.now() - startTime) / 1000),
      });
      // Pass the CORRECT executable path and the jobFolderPath as CWD
      await runFortranProcess(prog1Exe, [], jobFolderPath, jobId, "prog1");

      // Check if aborted during step 1
      if (!runningProcesses.has(jobId)) throw new Error("Job aborted");

      // Step 2
      runningProcesses.get(jobId).progress = 33;
      mainWindow.webContents.send("job-progress", {
        jobId,
        progress: 33,
        elapsedTime: Math.round((Date.now() - startTime) / 1000),
      });
      // Pass the CORRECT executable path and the jobFolderPath as CWD
      await runFortranProcess(prog2Exe, [], jobFolderPath, jobId, "prog2");

      // Check if aborted during step 2
      if (!runningProcesses.has(jobId)) throw new Error("Job aborted");

      // Step 3
      runningProcesses.get(jobId).progress = 66;
      mainWindow.webContents.send("job-progress", {
        jobId,
        progress: 66,
        elapsedTime: Math.round((Date.now() - startTime) / 1000),
      });
      // Pass the CORRECT executable path and the jobFolderPath as CWD
      await runFortranProcess(prog3Exe, [], jobFolderPath, jobId, "prog3");

      // Check if aborted during step 3
      if (!runningProcesses.has(jobId)) throw new Error("Job aborted");

      // --- Completion ---
      clearInterval(timerId);
      const finalElapsedTime = Math.round((Date.now() - startTime) / 1000);
      mainWindow.webContents.send("job-status", {
        jobId,
        status: "completed",
        message: `Job ${jobId} completed successfully in ${finalElapsedTime}s.`,
        elapsedTime: finalElapsedTime,
      });
      runningProcesses.delete(jobId);
      console.log(`[${jobId}] Job completed successfully.`);
    } catch (error) {
      // --- Error Handling ---
      console.error(`[${jobId}] Execution Error:`, error);
      const procInfo = runningProcesses.get(jobId);
      if (procInfo) {
        // Check if it exists (might have been aborted)
        clearInterval(procInfo.timerId);
        // Ensure the process is killed if it's still somehow running after an error/abort signal
        if (procInfo.child && !procInfo.child.killed) {
          console.log(`[${jobId}] Killing process due to error/abort.`);
          procInfo.child.kill("SIGTERM");
        }
        runningProcesses.delete(jobId); // Clean up map entry
      }

      // Determine status based on error message
      const isAborted = error.message.includes("aborted");
      const finalStatus = isAborted ? "aborted" : "error";
      const finalMessage = isAborted
        ? `Job ${jobId} aborted.`
        : `Job ${jobId} failed: ${error.message}`; // Include error message
      const finalElapsedTime = Math.round((Date.now() - startTime) / 1000);

      mainWindow.webContents.send("job-status", {
        jobId,
        status: finalStatus,
        message: finalMessage,
        elapsedTime: finalElapsedTime,
      });
    }
  })(); // Immediately invoke the async function

  // Return success to indicate the job *started*
  return { success: true, message: `Job ${jobId} submitted.` };
});

// Handler for aborting a job
ipcMain.handle("abort-job", async (event, jobId) => {
  console.log(`[${jobId}] Received abort request.`);
  const procInfo = runningProcesses.get(jobId);

  if (!procInfo) {
    console.warn(
      `[${jobId}] Abort request received, but job not found in running map.`
    );
    return { success: false, message: "Job not found or already finished." };
  }

  // Clear timer immediately
  if (procInfo.timerId) {
    clearInterval(procInfo.timerId);
  }

  // Kill the currently running child process (if any)
  if (procInfo.child && !procInfo.child.killed) {
    console.log(`[${jobId}] Sending SIGTERM to process ${procInfo.child.pid}`);
    const killed = procInfo.child.kill("SIGTERM"); // Send TERM signal
    if (!killed) {
      console.warn(
        `[${jobId}] Failed to send SIGTERM, process might already be exiting.`
      );
      // Optionally try SIGKILL after a timeout if SIGTERM fails
    }
    procInfo.child = null; // Clear the reference
  } else {
    console.log(
      `[${jobId}] No active child process to kill (might be between steps).`
    );
  }

  // Remove from map - the async execution block will catch this via the 'Job aborted' error
  runningProcesses.delete(jobId);

  // Send status update - the async block *also* sends a status on abort error,
  // but sending one here gives quicker feedback. The renderer should handle duplicates.
  mainWindow.webContents.send("job-status", {
    jobId,
    status: "aborted",
    message: `Job ${jobId} abort requested.`,
    elapsedTime: procInfo.startTime
      ? Math.round((Date.now() - procInfo.startTime) / 1000)
      : 0,
  });

  return { success: true, message: "Abort signal sent." };
});

ipcMain.handle("checkPathExists", async (event, targetPath) => {
  if (!targetPath) return false;
  try {
    await statAsync(targetPath);
    return true; // Path exists
  } catch (error) {
    if (error.code === "ENOENT") {
      return false; // Path does not exist
    }
    // Log other errors but still return false for simplicity in the renderer
    console.error(`Error checking path existence for ${targetPath}:`, error);
    return false;
  }
});

// Handler to list the names of files and folders within a directory
ipcMain.handle("listDirectoryContents", async (event, dirPath) => {
  if (!dirPath) return []; // Return empty array if no path provided
  try {
    const contents = await readdirAsync(dirPath);
    return contents; // Return array of names
  } catch (error) {
    console.error(`Error listing directory contents for ${dirPath}:`, error);
    // Return empty array on error (e.g., permissions, path not found)
    return [];
  }
});

// Handler to read the content of a file as a UTF-8 string
ipcMain.handle("readFileContent", async (event, filePath) => {
  if (!filePath) return null; // Return null if no path provided
  try {
    // Reads the entire file content as a UTF-8 string
    const content = await readFileAsync(filePath, "utf-8");
    return content;
  } catch (error) {
    console.error(`Error reading file content for ${filePath}:`, error);
    // Return an error message string for the renderer to display
    return `Error reading file: ${error.message}`;
  }
});

console.log(">>> Electron main script finished initial execution.");
// --- END OF FILE electron.js ---
