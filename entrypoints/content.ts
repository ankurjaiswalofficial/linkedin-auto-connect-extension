import { defineContentScript } from "wxt/sandbox";

export default defineContentScript({
  matches: ["https://*.linkedin.com/*"],

  async main() {
    let isRunning = false;

    const sleep = (ms: number): Promise<void> => {
      return new Promise((resolve) => setTimeout(resolve, ms));
    };

    const getRandomDelay = (): number => {
      return Math.floor(Math.random() * (10000 - 5000 + 1) + 5000);
    };

    const findButtons = (text: string): HTMLButtonElement[] => {
      return Array.from(
        document.querySelectorAll<HTMLButtonElement>("button"),
      ).filter((button) => button.textContent?.includes(text));
    };

    const startAutoConnect = async (): Promise<void> => {
      if (isRunning) return;
      isRunning = true;

      try {
        while (isRunning) {
          const connectButtons = findButtons("Connect");

          for (const button of connectButtons) {
            if (!isRunning) break;

            if (button && !button.disabled) {
              button.click();
              await sleep(1500);

              const sendButton = findButtons("Send")[0];
              if (sendButton) {
                sendButton.click();
              }

              await sleep(getRandomDelay());
            }
          }

          const nextButton = document.querySelector<HTMLButtonElement>(
            'button[aria-label="Next"]',
          );
          if (nextButton && !nextButton.disabled) {
            nextButton.click();
            await sleep(3000);
          } else {
            break;
          }
        }
      } catch (error) {
        console.error("Auto connect error:", error);
        throw error;
      } finally {
        isRunning = false;
      }
    };

    const stopAutoConnect = async (): Promise<void> => {
      isRunning = false;
    };

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      (async () => {
        try {
          switch (request.action) {
            case "startAutoConnect":
              await startAutoConnect();
              sendResponse({ success: true });
              break;

            case "stopAutoConnect":
              await stopAutoConnect();
              sendResponse({ success: true });
              break;

            default:
              sendResponse({ success: false, error: "Unknown action" });
          }
        } catch (error) {
          sendResponse({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      })();
      return true;
    });
  },
});
