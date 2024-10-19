import { defineContentScript } from 'wxt/sandbox'
import { DEFAULT_STATE, type AutoConnectState } from '../types/storage'

export default defineContentScript({
  matches: ['https://*.linkedin.com/*'],
  
  async main() {
    class AutoConnector {
      private async getState(): Promise<AutoConnectState> {
        const result = await chrome.storage.local.get('autoConnectState')
        return result.autoConnectState || DEFAULT_STATE
      }

      private async setState(state: Partial<AutoConnectState>): Promise<void> {
        const currentState = await this.getState()
        await chrome.storage.local.set({
          autoConnectState: {
            ...currentState,
            ...state
          }
        })
      }

      private async sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms))
      }

      private getRandomDelay(): number {
        return Math.floor(Math.random() * (10000 - 5000 + 1) + 5000)
      }

      private findButtons(text: string): HTMLButtonElement[] {
        return Array.from(
          document.querySelectorAll<HTMLButtonElement>('button')
        ).filter((button) => button.textContent?.includes(text))
      }

      async start(): Promise<void> {
        const state = await this.getState()
        if (state.isRunning) return

        await this.setState({ 
          isRunning: true,
          connectionsAttempted: 0
        })

        try {
          while ((await this.getState()).isRunning) {
            const state = await this.getState()
            if (state.connectionsAttempted >= state.maxConnectionsPerSession) {
              break
            }

            const connectButtons = this.findButtons('Connect')

            for (const button of connectButtons) {
              const currentState = await this.getState()
              if (!currentState.isRunning) break

              if (button && !button.disabled) {
                button.click()
                await this.sleep(1500)

                const sendButton = this.findButtons('Send')[0]
                if (sendButton) {
                  sendButton.click()
                  await this.setState({ 
                    connectionsAttempted: currentState.connectionsAttempted + 1 
                  })
                }

                await this.sleep(this.getRandomDelay())
              }
            }

            const nextButton = document.querySelector<HTMLButtonElement>('button[aria-label="Next"]')
            if (nextButton && !nextButton.disabled) {
              nextButton.click()
              await this.sleep(3000)
            } else {
              break
            }
          }
        } catch (error) {
          console.error('Auto connect error:', error)
          throw error
        } finally {
          await this.setState({ isRunning: false })
        }
      }

      async stop(): Promise<void> {
        await this.setState({ isRunning: false })
      }
    }

    const autoConnector = new AutoConnector()

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      (async () => {
        try {
          switch (request.action) {
            case 'startAutoConnect':
              await autoConnector.start()
              sendResponse({ success: true })
              break

            case 'stopAutoConnect':
              await autoConnector.stop()
              sendResponse({ success: true })
              break

            default:
              sendResponse({ success: false, error: 'Unknown action' })
          }
        } catch (error) {
          sendResponse({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          })
        }
      })()
      return true
    })
  }
})
