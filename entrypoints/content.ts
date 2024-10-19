interface AutoConnectState {
  isRunning: boolean;
  connectionsAttempted: number;
  maxConnectionsPerSession: number;
}

class AutoConnector {
  private state: AutoConnectState = {
    isRunning: false,
    connectionsAttempted: 0,
    maxConnectionsPerSession: 50
  };

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private getRandomDelay(): number {
    return Math.floor(Math.random() * (10000 - 5000 + 1) + 5000);
  }

  private findButtons(text: string): HTMLButtonElement[] {
    return Array.from(
      document.querySelectorAll<HTMLButtonElement>("button")
    ).filter((button) => button.textContent?.includes(text));
  }

  async start(): Promise<void> {
    if (this.state.isRunning) return;

    this.state.isRunning = true;
    this.state.connectionsAttempted = 0;

    try {
      while (this.state.isRunning &&
        this.state.connectionsAttempted < this.state.maxConnectionsPerSession) {

        const connectButtons = this.findButtons("Connect");

        for (const button of connectButtons) {
          if (!this.state.isRunning) break;

          if (button && !button.disabled) {
            // Click connect button
            button.click();
            await this.sleep(1500);

            // Look for and click send button
            const sendButton = this.findButtons("Send")[0];
            if (sendButton) {
              sendButton.click();
              this.state.connectionsAttempted++;

              // Log progress
              console.log(`Connections attempted: ${this.state.connectionsAttempted}`);
            }

            await this.sleep(this.getRandomDelay());
          }
        }

        // Move to next page if available
        const nextButton = document.querySelector<HTMLButtonElement>('button[aria-label="Next"]');
        if (nextButton && !nextButton.disabled) {
          nextButton.click();
          await this.sleep(3000);
        } else {
          break;
        }
      }
    } catch (error) {
      console.error('Auto connect error:', error);
      throw error;
    } finally {
      this.state.isRunning = false;
    }
  }

  stop(): void {
    this.state.isRunning = false;
  }

  getStatus(): AutoConnectState {
    return { ...this.state };
  }
}

export default defineContentScript({
  matches: ['https://*.linkedin.com/*'],
  async main() {
    const autoConnector = new AutoConnector();
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      try {
        switch (request.action) {
          case "startAutoConnect":
            autoConnector.start()
              .then(() => sendResponse({ success: true }))
              .catch((error) => sendResponse({
                success: false,
                error: error.message
              }));
            break;

          case "stopAutoConnect":
            autoConnector.stop();
            sendResponse({ success: true });
            break;

          case "getStatus":
            sendResponse({
              success: true,
              status: autoConnector.getStatus()
            });
            break;

          default:
            sendResponse({
              success: false,
              error: "Unknown action"
            });
        }
      } catch (error) {
        sendResponse({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
      return true;
    });
  }
})
