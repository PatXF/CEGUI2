import { useEffect } from "react";
import Button from "./Button";
import minimizeIcon from "./icons8-minimize-48.png";
import closeIcon from "./icons8-close.svg";

export default function NavBar({
  buttons,
  selectedOption,
  setSelectedOption,
  fileClicked,
  setFileClicked,
  viewClicked,
  setViewClicked,
}) {
  const handleMinimize = () => {
    console.log("Minimize button clicked");
    window.electronAPI.minimizeWindow();
  };

  const handleClose = () => {
    console.log("Close button clicked");
    window.electronAPI.closeWindow();
  };

  function handleSelection(item) {
    console.log("Button for", item.name, "clicked");
    setSelectedOption(item.name);
  }

  useEffect(() => {
    setFileClicked(false);
  }, [selectedOption, setFileClicked]);

  return (
    <div className="navbar">
      <span>CEGUI</span>
      <Button
        key={"File"}
        className="navbarbutton"
        handler={() => setFileClicked(!fileClicked)}
        current={"File"}
      >
        File
      </Button>
      {buttons.map((item) => (
        <Button
          key={item.name}
          selected={selectedOption}
          handler={() => handleSelection(item)}
          current={item.name}
          className="navbarbutton"
        >
          {item.name}
        </Button>
      ))}
      <Button
        className="navbarbutton"
        handler={() => setViewClicked(!viewClicked)}
        current={"View"}
        key={"View"}
      >
        View
      </Button>
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
