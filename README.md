
# CEGUI – Graphical User Interface for a Particle-Based Solver

**CEGUI** is a cross-platform desktop application developed in **React** and **Electron**, designed to serve as a user-friendly front-end for a **Fortran-based particle solver (PIS2D proxy)**.  
The goal is to democratize engineering simulations by providing researchers and students with an intuitive, modern GUI that handles model definition, job execution, and results analysis — without requiring in-depth knowledge of solver internals or costly commercial software.

---

## ✨ Features

### 🔹 Model Setup
- **Parts & Particles**
  - Create and manage parts, particles, and rigid components.  
  - Automatic cleanup of associated data on deletion.  
  - Step-by-step particle input (coordinates, velocities, volumes).  

- **Materials**
  - Define materials with dynamic forms.  
  - Supports **Elastic, Plastic, Johnson-Cook, JH1/JH2 EOS** models.  
  - Robust validation (unique names, numeric checks, required fields).  

- **Material Assignment**
  - Associate defined materials with parts.  
  - Accordion-style expandable list for clean navigation.  

- **Boundary Conditions**
  - Intuitive toggle mechanism for applying/removing BCs.  
  - Blurred background for focused interaction.  

### 🔹 Execution & Monitoring
- **Job Management**
  - Create, configure, and submit jobs to the solver.  
  - Real-time monitoring with **progress bars, status logs, elapsed time**.  
  - Safe abortion of running jobs.  
  - Prevents accidental deletions of active jobs.  

- **Results Viewer**
  - Automatic discovery of completed job outputs.  
  - Browse solver output files within the app.  
  - View raw text output (future-ready for graphical post-processing).  

### 🔹 Visualization
- Particle-based interactive display with:
  - **Zoom, Translate, Rotate** transformations.  
  - Highlighting of Groups vs. Points.  
  - Reset view to default.  

- **DXF Import**  
  - Import geometry from **AutoCAD DXF files** using blocks & inserts.  
  - Converts CAD points into particle data for simulation setup.  

### 🔹 User Experience
- Clean and modular workflows.  
- Dynamic, context-sensitive forms (only show relevant fields).  
- Notifications: **Success, Info, Warning, Error** with a persistent status log.  
- Multi-window navigation with React Router.  

---

## 🛠 Tech Stack

- **Frontend/UI:** React, Electron  
- **Core Modules:** Parts, Particles, Materials, Material Assignment, Boundary Conditions, Job Manager, Results Manager  
- **Visualization:** Particle-based rendering with transformations  
- **File Handling:** DXF parsing with `dxf-parser`, job output browsing  
- **Languages/Tools:** JavaScript, CSS, Fortran (solver backend), Electron IPC  

---
## Home Screen
<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/74f96799-193e-47a9-b09f-7adea73ca13c" />

## Main Application
<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/4c1e914c-53f0-4728-add7-68fcd4e47941" />

## For using the app please check the releases.
