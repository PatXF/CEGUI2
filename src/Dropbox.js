export default function DropBox({
  x,
  y,
  dropButtons,
  handleViewState,
  setViewClicked,
}) {
  // Expects an array with the name of the buttons only
  function handleClick(buttonName) {
    handleViewState(buttonName);
    setViewClicked(false);
  }
  return (
    <div className="context-window">
      {dropButtons.map((buttonName, index) => (
        <div
          role="button"
          key={index}
          className="context-buttons"
          onClick={() => handleClick(buttonName)}
        >
          {buttonName}
        </div>
      ))}
    </div>
  );
}
