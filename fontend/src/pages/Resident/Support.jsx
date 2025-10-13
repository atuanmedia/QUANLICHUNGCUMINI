import React, { useState, useRef, useEffect } from "react";
import "../../styles/client/support.css";

const Support = () => {
    const [messages, setMessages] = useState([
        { id: 1, sender: "Admin", content: "Chào bạn! Mình có thể giúp gì không?" },
        { id: 2, sender: "Bạn", content: "Mình muốn hỏi về phí gửi xe tháng này ạ." },
    ]);
    const [input, setInput] = useState("");
    const chatEndRef = useRef(null);

    // Auto scroll xuống tin mới
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        setMessages([
            ...messages,
            { id: Date.now(), sender: "Bạn", content: input.trim() },
        ]);
        setInput("");
    };

    const adminInfo = {
        name: "Ban Quản Lý Chung Cư Mini",
        phone: "0909 000 111",
        email: "admin@chungcu-mini.vn",
        address: "Vinhomes Grand Park, Nguyễn Xiển, Long Thạnh Mỹ, Quận 9, TP. Hồ Chí Minh",
        mapQuery: "Vinhomes Grand Park, Quận 9, TP. Hồ Chí Minh", // ✅ vị trí thật
    };


    return (
        <div className="support-wrapper">
            {/* LEFT: KHUNG CHAT */}
            <section className="chat-section">
                <h2 className="section-title">💬 Liên hệ chăm sóc khách hàng</h2>

                <div className="chat-container">
                    {messages.map((m) => (
                        <div
                            key={m.id}
                            className={`chat-row ${m.sender === "Bạn" ? "right" : "left"
                                }`}
                        >
                            <div className="chat-bubble">
                                <strong>{m.sender}: </strong>
                                {m.content}
                            </div>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>

                <form className="chat-input-box" onSubmit={handleSend}>
                    <input
                        type="text"
                        placeholder="Nhập tin nhắn..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <button type="submit">Gửi</button>
                </form>
            </section>

            {/* RIGHT: GOOGLE MAP + LIÊN HỆ */}
            <aside className="info-section">
                <h3 className="section-title">📍 Thông tin liên hệ</h3>
                <div className="info-card">
                    <p><strong>{adminInfo.name}</strong></p>
                    <p>📞 {adminInfo.phone}</p>
                    <p>✉️ {adminInfo.email}</p>
                    <p>🏢 {adminInfo.address}</p>
                </div>

                <div className="map-container">
                    <iframe
                        title="Google Map - Vinhomes Grand Park, Quận 9"
                        src="https://www.google.com/maps?q=Vinhomes%20Grand%20Park%2C%20Nguy%E1%BB%85n%20Xi%E1%BB%83n%2C%20Long%20Th%E1%BA%A1nh%20M%E1%BB%B9%2C%20Qu%E1%BA%ADn%209%2C%20TP.%20H%E1%BB%93%20Ch%C3%AD%20Minh&output=embed"
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                </div>

            </aside>
        </div>
    );
};

export default Support;
