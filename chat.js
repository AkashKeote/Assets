async function sendMessage() {
    const userInput = document.getElementById("user-input").value;
    const modelChoice = document.getElementById("model-choice").value;

    if (!userInput.trim()) return; // Prevent sending empty messages

    // Add user message to the chat window
    const userMessage = document.createElement("div");
    userMessage.className = "message user-message";
    userMessage.innerText = userInput;
    document.getElementById("chat-window").appendChild(userMessage);

    // Clear the input field
    document.getElementById("user-input").value = "";

    try {
        // Fetch bot response
        const response = await fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userInput, bot: modelChoice }),
        });

        if (!response.ok) throw new Error("Server error. Please try again.");

        const data = await response.json();

        // Add bot response to the chat window
        const botMessage = document.createElement("div");
        botMessage.className = "message bot-message";
        botMessage.innerText = data.response;
        document.getElementById("chat-window").appendChild(botMessage);
    } catch (error) {
        console.error("Chatbot Error:", error);
        const errorMessage = document.createElement("div");
        errorMessage.className = "message bot-message error";
        errorMessage.innerText = "⚠ Error: Unable to connect. Please try again.";
        document.getElementById("chat-window").appendChild(errorMessage);
    }

    // Scroll to the bottom of the chat window
    document.getElementById("chat-window").scrollTop = document.getElementById("chat-window").scrollHeight;
}
