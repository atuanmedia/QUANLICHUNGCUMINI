import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import "../../styles/admin/chat-support.css";

const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://quanlichungcumini.onrender.com";

const socket = io(API_BASE_URL, {
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
});

const formatTime = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
};

export default function ChatSupport() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    socket.emit("admin_join");

    socket.on("user_list", (list) => setUsers(list));

    socket.on("receive_message", (msg) => {
      if (
        selectedUser &&
        (msg.senderId === selectedUser._id || msg.receiverId === selectedUser._id)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.off("user_list");
      socket.off("receive_message");
    };
  }, [selectedUser]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/chat/${user._id}`);
      setMessages(res.data || []);
    } catch (err) {
      console.error("❌ Lỗi tải lịch sử chat:", err.message);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedUser) return;

    const newMsg = {
      sender: "admin",
      senderId: "admin",
      receiverId: selectedUser._id,
      content: input.trim(),
      timestamp: new Date(),
    };

    socket.emit("send_message", newMsg);
    setInput("");
  };

  return (
    <div className="chat-admin-wrapper">
      <aside className="chat-users">
        <h3>👥 Cư dân đang online</h3>
        {users.length === 0 && <p>Không có cư dân nào online</p>}
        <ul>
          {users.map((u) => (
            <li
              key={u._id}
              className={selectedUser?._id === u._id ? "active" : ""}
              onClick={() => handleSelectUser(u)}
            >
              🏠 {u.fullName} ({u.apartmentCode})
            </li>
          ))}
        </ul>
      </aside>

      <section className="chat-box">
        {selectedUser ? (
          <>
            <header className="chat-header">
              <h3>💬 Chat với {selectedUser.fullName}</h3>
            </header>

            <div className="chat-messages">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`chat-row ${m.sender === "admin" ? "right" : "left"}`}
                >
                  <div className="chat-bubble">
                    <div>
                      <strong>
                        {m.sender === "admin" ? "Admin" : selectedUser.fullName}:
                      </strong>{" "}
                      {m.content}
                    </div>
                    <span className="time">
                      {formatTime(m.createdAt || m.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <form className="chat-input" onSubmit={handleSend}>
              <input
                type="text"
                placeholder="Nhập tin nhắn..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button type="submit">Gửi</button>
            </form>
          </>
        ) : (
          <div className="no-chat">👈 Chọn cư dân để bắt đầu trò chuyện</div>
        )}
      </section>
    </div>
  );
}
