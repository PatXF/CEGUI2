import minimizeIcon from "./minimize.svg";
import closeIcon from "./close.svg";

export default function NavBar() {
  const handleMinimize = () => {
    console.log("Minimize button clicked");
    window.electronAPI.minimizeWindow();
  };

  const handleClose = () => {
    console.log("Close button clicked");
    window.electronAPI.closeWindow();
  };

  return (
    <div className="navbar">
      <span>CEGUI</span>
      <div className="window">
        <button className="btn minimize" onClick={handleMinimize}>
          <img src={minimizeIcon} alt="Minimize" width="20" height="20" />
        </button>
        <button className="btn close" onClick={handleClose}>
          <img src={closeIcon} alt="Close" width="20" height="20" />
        </button>
      </div>
    </div>
  );
}
