export interface AutoConnectState {
    isRunning: boolean;
    connectionsAttempted: number;
    maxConnectionsPerSession: number;
  }
  
  export const DEFAULT_STATE: AutoConnectState = {
    isRunning: false,
    connectionsAttempted: 0,
    maxConnectionsPerSession: 50
  };
