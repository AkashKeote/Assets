 // Function to toggle chatbot collapse/expand
  function toggleChatbot() {
    const chatbotContent = document.getElementById("chatbot-content");
    const toggleIcon = document.getElementById("toggle-icon");

    if (chatbotContent.style.display === "none") {
      chatbotContent.style.display = "block";
      toggleIcon.innerText = "▼";
    } else {
      chatbotContent.style.display = "none";
      toggleIcon.innerText = "▲";
    }
  }

  // Function to send a message
  async function sendMessage() {
    const userInput = document.getElementById("user-input").value;
    const modelChoice = document.getElementById("model-choice").value;

    // Add user message to the chat window
    const userMessage = document.createElement("div");
    userMessage.className = "message user-message";
    userMessage.innerText = userInput;
    document.getElementById("chat-window").appendChild(userMessage);

    // Clear the input field
    document.getElementById("user-input").value = "";

    // Fetch bot response
    const response = await fetch("/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: userInput,
        bot: modelChoice,
      }),
    });

    const data = await response.json();

    // Add bot response to the chat window
    const botMessage = document.createElement("div");
    botMessage.className = "message bot-message";
    botMessage.innerText = data.response;
    document.getElementById("chat-window").appendChild(botMessage);

    // Scroll to the bottom of the chat window
    const chatWindow = document.getElementById("chat-window");
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }
