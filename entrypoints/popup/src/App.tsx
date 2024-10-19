import React, { useEffect, useState } from 'react'
import type { AutoConnectState } from '../../types/storage'
import { DEFAULT_STATE } from '../../types/storage'
import "./App.css";


function App() {
    const [error, setError] = useState<string | null>(null)
    const [status, setStatus] = useState<AutoConnectState>(DEFAULT_STATE)
  
    const updateStatus = async () => {
      try {
        const result = await chrome.storage.local.get('autoConnectState')
        setStatus(result.autoConnectState || DEFAULT_STATE)
      } catch (err) {
        console.error('Failed to update status:', err)
      }
    }
  
    useEffect(() => {
      updateStatus()
      const interval = setInterval(updateStatus, 5000)
      return () => clearInterval(interval)
    }, [])
  
    useEffect(() => {
      const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
        if (changes.autoConnectState) {
          setStatus(changes.autoConnectState.newValue)
        }
      }
      chrome.storage.local.onChanged.addListener(listener)
      return () => chrome.storage.local.onChanged.removeListener(listener)
    }, [])
  
    const sendMessageToActiveTab = async (action: string) => {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!tabs[0]?.id) throw new Error('No active tab found')
      return chrome.tabs.sendMessage(tabs[0].id, { action })
    }
  
    const handleAutoConnectStart = async () => {
      try {
        const response = await sendMessageToActiveTab('startAutoConnect')
        if (!response.success) {
          throw new Error(response.error || 'Failed to start auto-connect')
        }
        setError(null)
        await updateStatus()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to start auto-connect')
      }
    }
  
    const handleAutoConnectStop = async () => {
      try {
        const response = await sendMessageToActiveTab('stopAutoConnect')
        if (!response.success) {
          throw new Error(response.error || 'Failed to stop auto-connect')
        }
        setError(null)
        await updateStatus()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to stop auto-connect')
      }
    }
  
    return (
      <div className="container">
        <h1>LinkedIn Auto Connect</h1>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <div className="status-container">
          <p>Status: {status.isRunning ? 'Running' : 'Stopped'}</p>
          <p>Connections Attempted: {status.connectionsAttempted}</p>
          <p>Daily Limit: {status.maxConnectionsPerSession}</p>
        </div>
        
        <div className="button-container">
          <button
            className={`action-button ${status.isRunning ? 'disabled' : 'start'}`}
            onClick={handleAutoConnectStart}
            disabled={status.isRunning}
          >
            Start Auto Connect
          </button>
          
          <button
            className={`action-button ${!status.isRunning ? 'disabled' : 'stop'}`}
            onClick={handleAutoConnectStop}
            disabled={!status.isRunning}
          >
            Stop Auto Connect
          </button>
        </div>
      </div>
    )
  }
  
  export default App;
