async function sendMessage() {
    const userInput = document.getElementById("user-input");
    const chatWindow = document.getElementById("chat-window");
    const modelChoice = document.getElementById("model-choice").value;

    if (!userInput.value.trim()) return; // Prevent empty messages

    // Add user message to chat
    const userMessage = document.createElement("div");
    userMessage.className = "message user-message";
    userMessage.innerText = userInput.value;
    chatWindow.appendChild(userMessage);

    // Clear input and disable it to prevent spam
    const messageText = userInput.value;
    userInput.value = "";
    userInput.disabled = true;

    try {
        const response = await fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: messageText, bot: modelChoice }),
        });

        if (!response.ok) throw new Error("Server error. Please try again.");

        const data = await response.json();

        // Add bot response
        const botMessage = document.createElement("div");
        botMessage.className = "message bot-message";
        botMessage.innerText = data.response || "⚠ Bot did not respond.";
        chatWindow.appendChild(botMessage);
    } catch (error) {
        console.error("Chatbot Error:", error);
        const errorMessage = document.createElement("div");
        errorMessage.className = "message bot-message error";
        errorMessage.innerText = "⚠ Error: Unable to connect. Please try again.";
        chatWindow.appendChild(errorMessage);
    } finally {
        // Re-enable input and scroll down
        userInput.disabled = false;
        userInput.focus();
        setTimeout(() => {
            chatWindow.scrollTop = chatWindow.scrollHeight;
        }, 100);
    }
}
