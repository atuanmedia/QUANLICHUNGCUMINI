import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "../styles/admin/componentadmin.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const AIChatBox = () => {
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Xin chào 👋! Tôi là Trợ lý Chung cư Mini, bạn cần hỗ trợ gì không?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // 🧭 Tự cuộn xuống tin mới
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 📨 Gửi tin nhắn
  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/api/ai/chat`, { message: input });
      const aiReply =
        res.data?.reply ||
        "Xin lỗi, hiện tôi chưa thể trả lời câu hỏi này. Vui lòng thử lại sau.";
      setMessages((prev) => [...prev, { sender: "ai", text: aiReply }]);
    } catch (error) {
      console.error("❌ Lỗi AI:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "⚠️ Không thể kết nối đến máy chủ AI." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="ai-chatbox">
      <div className="chat-header">
        🤖 Trợ lý Chung cư Mini
      </div>

      <div className="chat-body">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`chat-message ${msg.sender === "user" ? "user" : "ai"}`}
          >
            <div className="message-text">{msg.text}</div>
          </div>
        ))}
        {loading && <p className="ai-typing">AI đang trả lời...</p>}
        <div ref={chatEndRef} />
      </div>

      <div className="chat-input">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập câu hỏi (vd: Phòng 203 đã thanh toán chưa?)"
        />
        <button onClick={sendMessage} disabled={loading}>
          Gửi
        </button>
      </div>
    </div>
  );
};

export default AIChatBox;
