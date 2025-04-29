const { app, BrowserWindow, Menu, dialog, ipcMain } = require("electron");
let store;
const util = require("util");
const path = require("path"); 
const fs = require("fs");
const { spawn } = require("child_process");

const mkdirAsync = util.promisify(fs.mkdir);
const writeFileAsync = util.promisify(fs.writeFile);
const statAsync = util.promisify(fs.stat);
const readdirAsync = util.promisify(fs.readdir);
const readFileAsync = util.promisify(fs.readFile);

const runningProcesses = new Map();

async function loadStore() {
  try {
    const { default: Store } = await import("electron-store");
    store = new Store();
    console.log(">>> Electron Store loaded successfully.");
  } catch (error) {
    console.error(">>> Failed to load Electron Store:", error);
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
      devTools: false,
    },
  });

  const loadURL = isDev ? "http://localhost:3000" : `file://${indexHtmlPath}`;

  console.log(`>>> Loading URL: ${loadURL}`);

  Menu.setApplicationMenu(null);

  mainWindow
    .loadURL(loadURL)
    .then(() => {
      console.log(">>> mainWindow.loadURL Successful");
    })
    .catch((err) => {
      console.error(">>> mainWindow.loadURL Failed:", err);
      dialog.showErrorBox(
        "Load Error",
        `Failed to load application content: ${err.message}\nURL: ${loadURL}`
      );
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

app.on("ready", async () => {
  console.log(">>> App ready event received.");
  await loadStore();
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

ipcMain.handle("save-json-file", async (event, data) => {
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    title: "Save Master JSON File",
    defaultPath: "simulation_data.json",
    filters: [{ name: "JSON Files", extensions: ["json"] }],
  });
  if (canceled || !filePath) return null;
  const folderPath = path.dirname(filePath);
  try {
    const masterFilePath = filePath;
    fs.writeFileSync(masterFilePath, JSON.stringify(data, null, 2));
    return folderPath;
  } catch (error) {
    console.error("Error saving master JSON file:", error);
    dialog.showErrorBox("Save Error", `Failed to save file: ${error.message}`);
    return null;
  }
});

ipcMain.handle("open-json-file", async () => {
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
  try {
    const joinedPath = path.join(...args);
    return joinedPath;
  } catch (error) {
    console.error("IPC pathJoin: Error joining path:", error);
    return null;
  }
});

ipcMain.handle("writeJson", async (event, filePath, data) => {
  try {
    await writeFileAsync(filePath, JSON.stringify(data, null, 2));
    return { success: true };
  } catch (error) {
    console.error(`IPC writeJson: Error writing file "${filePath}":`, error);
    dialog.showErrorBox(
      "File Write Error",
      `Failed to write JSON file: ${error.message}`
    );
    return { success: false, error: error.message };
  }
});

function runFortranProcess(executablePath, args, cwd, jobId, stepName) {
  return new Promise((resolve, reject) => {
    console.log(`[${jobId}] Running: ${executablePath} in ${cwd}`);
    const child = spawn(executablePath, args, { cwd });

    if (runningProcesses.has(jobId)) {
      runningProcesses.get(jobId).child = child;
    } else {
      console.warn(
        `[${jobId}] Process started but no entry in runningProcesses map.`
      );
    }

    child.stdout.on("data", (data) => {
      console.log(`[${jobId}-${stepName} stdout]: ${data}`);
    });

    child.stderr.on("data", (data) => {
      console.error(`[${jobId}-${stepName} stderr]: ${data}`);
    });

    child.on("close", (code) => {
      console.log(`[${jobId}-${stepName}] process exited with code ${code}`);
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

ipcMain.handle("submit-job", async (event, jobData, jobFolderPath) => {
  const jobId = jobData.jobParams.JobName;

  if (runningProcesses.has(jobId)) {
    console.warn(`[${jobId}] Job is already running.`);
    return { success: false, message: `Job ${jobId} is already running.` };
  }

  console.log(
    `[${jobId}] Received submission request. Folder: ${jobFolderPath}`
  );

  const isDev = !app.isPackaged;
  let binPath;

  if (isDev) {
    binPath = path.join(process.cwd(), "bin");
    console.log(`[${jobId}] [Dev Mode] Expecting executables in: ${binPath}`);
  } else {
    binPath = path.join(process.resourcesPath, "bin");
    console.log(
      `[${jobId}] [Production Mode] Expecting executables in: ${binPath}`
    );
    try {
      const stats = await statAsync(process.resourcesPath);
      console.log(
        `[${jobId}] Verified resources path exists: ${process.resourcesPath}`
      );
      try {
        const binStats = await statAsync(binPath);
        console.log(
          `[${jobId}] Verified bin path exists inside resources: ${binPath}`
        );
      } catch (binErr) {
        console.error(
          `[${jobId}] The calculated bin path (${binPath}) does NOT exist or is not accessible! Error: ${binErr.code}`
        );
      }
    } catch (err) {
      console.error(
        `[${jobId}] The calculated resources path (${process.resourcesPath}) does NOT exist or is not accessible! Error: ${err.code}`
      );
    }
  }

  const ext = process.platform === "win32" ? ".exe" : "";
  const prog1Exe = path.join(binPath, `prog1${ext}`);
  const prog2Exe = path.join(binPath, `prog2${ext}`);
  const prog3Exe = path.join(binPath, `prog3${ext}`);

  console.log(`[${jobId}] Calculated path for prog1: ${prog1Exe}`);
  console.log(`[${jobId}] Calculated path for prog2: ${prog2Exe}`);
  console.log(`[${jobId}] Calculated path for prog3: ${prog3Exe}`);
  try {
    await statAsync(prog1Exe);
    await statAsync(prog2Exe);
    await statAsync(prog3Exe);
    console.log(
      `[${jobId}] All required executables seem to exist at calculated paths.`
    );
  } catch (error) {
    const missingExePath = error.path || "Unknown executable";
    const errorMsg = `Required executable not found or inaccessible: ${missingExePath}\nError code: ${error.code}`;
    console.error(`[${jobId}] ${errorMsg}`);
    console.error(`[${jobId}] Full stat error:`, error);
    dialog.showErrorBox(
      "Execution Error",
      errorMsg + "\n\nPlease check the application installation and logs."
    );
    return { success: false, message: errorMsg };
  }

  const combinedInputPath = path.join(jobFolderPath, "input_combined.json");
  try {
    await mkdirAsync(jobFolderPath, { recursive: true });
    console.log(`[${jobId}] Created job folder: ${jobFolderPath}`);
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

  const startTime = Date.now();
  let timerId = null;

  mainWindow.webContents.send("job-progress", {
    jobId,
    progress: 0,
    elapsedTime: 0,
  });
  timerId = setInterval(() => {
    const elapsedTime = Math.round((Date.now() - startTime) / 1000);
    if (runningProcesses.has(jobId)) {
      const currentProgress = runningProcesses.get(jobId).progress || 0;
      mainWindow.webContents.send("job-progress", {
        jobId,
        progress: currentProgress,
        elapsedTime,
      });
    } else {
      clearInterval(timerId);
    }
  }, 1000); 

  runningProcesses.set(jobId, { child: null, timerId, startTime, progress: 0 });
  
  (async () => {
    try {
      runningProcesses.get(jobId).progress = 5;
      mainWindow.webContents.send("job-progress", {
        jobId,
        progress: 5,
        elapsedTime: Math.round((Date.now() - startTime) / 1000),
      });
      await runFortranProcess(prog1Exe, [], jobFolderPath, jobId, "prog1");

      if (!runningProcesses.has(jobId)) throw new Error("Job aborted");

      runningProcesses.get(jobId).progress = 33;
      mainWindow.webContents.send("job-progress", {
        jobId,
        progress: 33,
        elapsedTime: Math.round((Date.now() - startTime) / 1000),
      });
      await runFortranProcess(prog2Exe, [], jobFolderPath, jobId, "prog2");

      if (!runningProcesses.has(jobId)) throw new Error("Job aborted");

      runningProcesses.get(jobId).progress = 66;
      mainWindow.webContents.send("job-progress", {
        jobId,
        progress: 66,
        elapsedTime: Math.round((Date.now() - startTime) / 1000),
      });
      await runFortranProcess(prog3Exe, [], jobFolderPath, jobId, "prog3");

      if (!runningProcesses.has(jobId)) throw new Error("Job aborted");

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
      console.error(`[${jobId}] Execution Error:`, error);
      const procInfo = runningProcesses.get(jobId);
      if (procInfo) {
        clearInterval(procInfo.timerId);
        if (procInfo.child && !procInfo.child.killed) {
          console.log(`[${jobId}] Killing process due to error/abort.`);
          procInfo.child.kill("SIGTERM");
        }
        runningProcesses.delete(jobId);
      }

      const isAborted = error.message.includes("aborted");
      const finalStatus = isAborted ? "aborted" : "error";
      const finalMessage = isAborted
        ? `Job ${jobId} aborted.`
        : `Job ${jobId} failed: ${error.message}`;
      const finalElapsedTime = Math.round((Date.now() - startTime) / 1000);

      mainWindow.webContents.send("job-status", {
        jobId,
        status: finalStatus,
        message: finalMessage,
        elapsedTime: finalElapsedTime,
      });
    }
  })();

  return { success: true, message: `Job ${jobId} submitted.` };
});

ipcMain.handle("abort-job", async (event, jobId) => {
  console.log(`[${jobId}] Received abort request.`);
  const procInfo = runningProcesses.get(jobId);

  if (!procInfo) {
    console.warn(
      `[${jobId}] Abort request received, but job not found in running map.`
    );
    return { success: false, message: "Job not found or already finished." };
  }

  if (procInfo.timerId) {
    clearInterval(procInfo.timerId);
  }

  if (procInfo.child && !procInfo.child.killed) {
    console.log(`[${jobId}] Sending SIGTERM to process ${procInfo.child.pid}`);
    const killed = procInfo.child.kill("SIGTERM");
    if (!killed) {
      console.warn(
        `[${jobId}] Failed to send SIGTERM, process might already be exiting.`
      );
    }
    procInfo.child = null;
  } else {
    console.log(
      `[${jobId}] No active child process to kill (might be between steps).`
    );
  }

  runningProcesses.delete(jobId);

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
    return true;
  } catch (error) {
    if (error.code === "ENOENT") {
      return false;
    }
    console.error(`Error checking path existence for ${targetPath}:`, error);
    return false;
  }
});

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
