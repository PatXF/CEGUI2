const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  saveJsonFile: (data) => ipcRenderer.invoke("save-json-file", data),
  openJsonFile: () => ipcRenderer.invoke("open-json-file"),
  minimizeWindow: () => ipcRenderer.send("window:minimize"),
  closeWindow: () => ipcRenderer.send("window:close"),
  selectFolder: () => ipcRenderer.invoke("select-folder"),
  pathJoin: (...args) => ipcRenderer.invoke("pathJoin", ...args),
  createFolder: (fullPath) => ipcRenderer.invoke("createFolder", fullPath),
  writeJson: (path, data) => ipcRenderer.invoke("writeJson", path, data),
  submitJob: (jobData, jobFolderPath) =>
    ipcRenderer.invoke("submit-job", jobData, jobFolderPath),
  abortJob: (jobId) => ipcRenderer.invoke("abort-job", jobId),
  onJobProgress: (callback) =>
    ipcRenderer.on("job-progress", (_event, value) => callback(value)),
  onJobStatus: (callback) =>
    ipcRenderer.on("job-status", (_event, value) => callback(value)),
  removeJobProgressListener: () =>
    ipcRenderer.removeAllListeners("job-progress"),
  removeJobStatusListener: () => ipcRenderer.removeAllListeners("job-status"),
  checkPathExists: (targetPath) =>
    ipcRenderer.invoke("checkPathExists", targetPath),
  listDirectoryContents: (dirPath) =>
    ipcRenderer.invoke("listDirectoryContents", dirPath),
  readFileContent: (filePath) =>
    ipcRenderer.invoke("readFileContent", filePath),
});
