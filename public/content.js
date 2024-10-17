let isRunning = false;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRandomDelay() {
    return Math.floor(Math.random() * (10000 - 5000 + 1) + 5000);
}

async function startAutoConnect() {
    isRunning = true;

    while (isRunning) {
        const connectButtons = Array.from(
            document.querySelectorAll("button")
        ).filter((button) => button.textContent.includes("Connect"));

        for (const button of connectButtons) {
            if (!isRunning) break;

            if (button && !button.disabled) {
                button.click();

                await sleep(1000);

                const sendButton = Array.from(
                    document.querySelectorAll("button")
                ).find((button) => button.textContent.includes("Send"));
                if (sendButton) {
                    sendButton.click();
                }

                await sleep(getRandomDelay());
            }
        }

        const nextButton = document.querySelector('button[aria-label="Next"]');
        if (nextButton && !nextButton.disabled) {
            nextButton.click();
            await sleep(3000);
        } else {
            break;
        }
    }
}

function stopAutoConnect() {
    isRunning = false;
}
function handleMessage(request, sender, sendResponse) {
    if (request.action === "startAutoConnect") {
        startAutoConnect()
            .then(() => sendResponse({ correct: true, error: false }))
            .catch(() => sendResponse({ correct: false, error: true }));
    } else if (request.action === "stopAutoConnect") {
        stopAutoConnect();
        sendResponse({ correct: true, error: false });
    } else {
        sendResponse({ correct: false, error: true, message: "Unknown action" });
    }
    return true;
}

chrome.runtime.onMessage.addListener(handleMessage);
