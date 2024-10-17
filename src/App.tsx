import { useState } from 'react';
import './App.css';

function App() {
  const [error, setError] = useState<string | null>(null);

  const handleAutoConnectStart = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id !== undefined) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "startAutoConnect" },
          (response) => {
            if (!response || response.error) {
              setError("Error: Auto Connect program failed !!!");
            } else {
              setError(null);
            }
          }
        );
      }
    });
  };

  const handleAutoConnectStop = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id !== undefined) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "stopAutoConnect" },
          (response) => {
            if (!response || response.error) {
              setError("Error: Failed to STOP Auto Connect, PLEASE RELOAD PAGE!!!");
            } else {
              setError(null);
            }
          }
        );
      }
    });
  };

  return (
    <>
      <h1>LinkedIn Auto Connect Application</h1>
      {error && <h3 style={{ color: "#f00", fontWeight: "700" }}>{error}</h3>}
      <div className="card">
        <button style={{ backgroundColor: "#f00" }} onClick={handleAutoConnectStart}>
          Start Auto Connect
        </button>
        <br />
        <button style={{ backgroundColor: "#00f" }} onClick={handleAutoConnectStop}>
          Stop Auto Connect
        </button>
      </div>
    </>
  );
}

export default App;
