
import { useState } from "react";
import "./CareerMentor.css";

function CareerMentor() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const suggestions = [
    "How can I prepare for software developer jobs?",
    "What skills should I learn for Java development?",
    "Suggest projects to improve my resume",
    "Create a 30-day placement preparation plan"
  ];

  async function handleSend(text = message) {
    const userMessage = text.trim();

    if (!userMessage || loading) return;

    const history = messages.map((msg) => ({
      role: msg.role,
      content: msg.content
    }));

    const updatedMessages = [
      ...messages,
      { role: "user", content: userMessage }
    ];

    setMessages(updatedMessages);
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8080/api/career-mentor/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${sessionStorage.getItem("token")}`
          },
          body: JSON.stringify({
            message: userMessage,
            history: history
          })
        }
      );

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to get a response from the server.");
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply
        }
      ]);

    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again."
        }
      ]);

      console.error("Career Mentor Error:", error);

    } finally {
      setLoading(false);
    }
  }

  function handleNewChat() {
    if (loading) return;

    setMessages([]);
    setMessage("");
  }

  return (
    <div className="mentor-container">

      <aside className="mentor-sidebar">
        <h2>Career Mentor</h2>

        <button onClick={handleNewChat} disabled={loading}>
          + New Chat
        </button>

        <p className="history-title">Recent Chats</p>

        <div className="chat-history">
          Your conversations will appear here.
        </div>
      </aside>

      <main className="mentor-main">

        <header className="mentor-header">
          <h3>AI Career Mentor</h3>
        </header>

        <section className="mentor-chat">

          {messages.length === 0 ? (
            <div className="mentor-welcome">
              <h1>Hi! How can I help your career?</h1>

              <p>
                Ask me about career paths, skills,
                projects, internships and placements.
              </p>

              <div className="suggestion-list">
                {suggestions.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleSend(item)}
                    disabled={loading}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="message-list">

              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message ${msg.role}`}
                >
                  {msg.content}
                </div>
              ))}

              {loading && (
                <div className="message assistant">
                  Thinking...
                </div>
              )}

            </div>
          )}

        </section>

        <form
          className="mentor-input-area"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >

          <input
            type="text"
            placeholder="Ask anything about your career..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading || !message.trim()}
          >
            {loading ? "Sending..." : "Send"}
          </button>

        </form>

        <p className="mentor-disclaimer">
          AI can make mistakes. Verify important career advice.
        </p>

      </main>
    </div>
  );
}

export default CareerMentor;
