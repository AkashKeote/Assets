document.addEventListener('scroll', function() {
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => {
      const position = el.getBoundingClientRect();
      if (position.top < window.innerHeight) {
        el.classList.add('scroll-in-view');
      }
    });
  });
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('hacker-mode-toggle').addEventListener('click', function(e) {
        e.preventDefault();
        document.body.classList.toggle('hacker-mode');
    });
});


  window.addEventListener('scroll', () => {
    let sections = document.querySelectorAll('section');
    let navLinks = document.querySelectorAll('nav .right a');

    sections.forEach((section, index) => {
      let top = window.scrollY;
      let offset = section.offsetTop - 150;
      let height = section.offsetHeight;

      if (top >= offset && top < offset + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
        });
        navLinks[index].classList.add('active');
      }
    });
  });

  document.addEventListener("DOMContentLoaded", function () {
    let video = document.getElementById("hero-video");

    // Check if the user is on a desktop (width > 768px)
    if (window.innerWidth > 768) {
        video.setAttribute("autoplay", "true");
        video.play().catch(error => console.log("Autoplay blocked:", error));
    }
});
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
