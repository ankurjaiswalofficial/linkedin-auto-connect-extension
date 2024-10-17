import { useState } from 'react'
import './App.css'

function App() {
  const [error, setError] = useState<string | null>(null);

  const handleAutoConnectStart = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "startAutoConnect" },
          (response) => {
            if (!response) {
              setError("Error: Auto Connect program failed !!!")
            }
          }
        );
      }
    });
  }

  const handleAutoConnectStop = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "stopAutoConnect" },
          (response) => {
            if (!response) {
              setError("Error: Failed to STOP Auto Connect, PLEASE RELOAD PAGE!!!")
            }
          }
        );
      }
    });
  }

  return (
    <>
      <h1>LinkedIn Auto Connect Application</h1>
      <h3 style={{color: "#f00", fontWeight: "700"}}>{error}</h3>
      <div className="card">
        <button style={{backgroundColor: "#f00"}} onClick={handleAutoConnectStart}>
          Start Auto Connect
        </button>
        <br />
        <button style={{backgroundColor: "#00f"}} onClick={handleAutoConnectStop}>
          Stop Auto Connect
        </button>
      </div>
    </>
  )
}

export default App
