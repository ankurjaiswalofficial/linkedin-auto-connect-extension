import React, { useState } from "react";
import "./App.css";

function App() {
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const sendMessageToActiveTab = async (action: string) => {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tabs[0]?.id) throw new Error("No active tab found");
    return chrome.tabs.sendMessage(tabs[0].id, { action });
  };

  const handleAutoConnectToggle = async (
    action: "startAutoConnect" | "stopAutoConnect",
  ) => {
    try {
      const response = await sendMessageToActiveTab(action);
      if (!response.success) {
        throw new Error(response.error || `Failed to ${action}`);
      }
      setError(null);
      setIsRunning(action === "startAutoConnect");
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action}`);
    }
  };

  return (
    <div className="container">
      <h1>LinkedIn Auto Connect</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="button-container">
        <button
          className={`action-button ${isRunning ? "disabled" : "start"}`}
          onClick={() => handleAutoConnectToggle("startAutoConnect")}
          disabled={isRunning}
        >
          Start Auto Connect
        </button>

        <button
          className={`action-button ${!isRunning ? "disabled" : "stop"}`}
          onClick={() => handleAutoConnectToggle("stopAutoConnect")}
          disabled={!isRunning}
        >
          Stop Auto Connect
        </button>
      </div>
    </div>
  );
}

export default App;
