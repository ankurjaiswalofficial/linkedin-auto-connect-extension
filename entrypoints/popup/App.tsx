import { useState, useEffect } from 'react';
import './App.css';

interface Status {
    isRunning: boolean;
    connectionsAttempted: number;
    maxConnectionsPerSession: number;
}

function App() {
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<Status | null>(null);

    const updateStatus = async () => {
        try {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tabs[0]?.id) {
                const response = await chrome.tabs.sendMessage(tabs[0].id, { action: "getStatus" });
                if (response.success) {
                    setStatus(response.status);
                }
            }
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    useEffect(() => {
        updateStatus();
        const interval = setInterval(updateStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleAutoConnectStart = async () => {
        try {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tabs[0]?.id) throw new Error("No active tab found");

            const response = await chrome.tabs.sendMessage(tabs[0].id, { action: "startAutoConnect" });
            if (!response.success) {
                throw new Error(response.error || "Failed to start auto-connect");
            }
            setError(null);
            updateStatus();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to start auto-connect");
        }
    };

    const handleAutoConnectStop = async () => {
        try {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tabs[0]?.id) throw new Error("No active tab found");

            const response = await chrome.tabs.sendMessage(tabs[0].id, { action: "stopAutoConnect" });
            if (!response.success) {
                throw new Error(response.error || "Failed to stop auto-connect");
            }
            setError(null);
            updateStatus();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to stop auto-connect");
        }
    };

    return (
        <div className="container">
            <h1>LinkedIn Auto Connect</h1>
            
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}
            
            {status && (
                <div className="status-container">
                    <p>Status: {status.isRunning ? 'Running' : 'Stopped'}</p>
                    <p>Connections Attempted: {status.connectionsAttempted}</p>
                    <p>Daily Limit: {status.maxConnectionsPerSession}</p>
                </div>
            )}
            
            <div className="button-container">
                <button
                    className={`action-button ${status?.isRunning ? 'disabled' : 'start'}`}
                    onClick={handleAutoConnectStart}
                    disabled={status?.isRunning}
                >
                    Start Auto Connect
                </button>
                
                <button
                    className={`action-button ${!status?.isRunning ? 'disabled' : 'stop'}`}
                    onClick={handleAutoConnectStop}
                    disabled={!status?.isRunning}
                >
                    Stop Auto Connect
                </button>
            </div>
        </div>
    );
}

export default App;
