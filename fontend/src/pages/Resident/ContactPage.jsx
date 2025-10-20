import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/client/contact.css";

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="contact-wrapper">
      {/* 🟡 Header */}
      <header className="landing-header">
        <div className="logo">
          <img src="/logo.jpg" alt="Logo" />
          <span>AT APARTMENT</span>
        </div>
        <nav>
          <Link to="/about">Giới thiệu</Link>
          <Link to="/contact" className="active">Liên hệ</Link>
          <Link to="/login" className="login-open-btn">Đăng nhập</Link>
        </nav>
      </header>

      {/* 🌆 Hero */}
      <section className="contact-hero">
        <div className="contact-overlay"></div>
        <div className="contact-hero-content">
          <h1 className="contact-title">LIÊN HỆ VỚI CHÚNG TÔI</h1>
          <p className="contact-subtitle">
            Hãy để lại lời nhắn, chúng tôi sẽ phản hồi trong thời gian sớm nhất.
          </p>
        </div>
      </section>

      {/* 📧 Form liên hệ */}
      <section className="contact-form-section">
        <div className="contact-container">
          <h2>Gửi tin nhắn cho chúng tôi</h2>
          <form onSubmit={handleSubmit} className="contact-form">
            <input
              type="text"
              name="name"
              placeholder="Họ và tên"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Địa chỉ Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <textarea
              name="message"
              placeholder="Nội dung tin nhắn..."
              rows="5"
              value={formData.message}
              onChange={handleChange}
              required
            />
            <button type="submit" className="contact-btn">
              Gửi ngay
            </button>
            {submitted && (
              <p className="contact-success">✅ Tin nhắn của bạn đã được gửi!</p>
            )}
          </form>
        </div>
      </section>

      {/* 🗺️ Google Map */}
      <section className="contact-map">
        <iframe
          title="Google Map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.448272844765!2d106.78252727480558!3d10.853826157733703!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3175279c2e1b74cf%3A0xe95a67498a3b4b0!2zQ8O0bmcgTmdo4buHIFThu6sgVuG7kW5nLCBUUC5IQ00!5e0!3m2!1svi!2s!4v1715678912345"
          allowFullScreen
          loading="lazy"
        ></iframe>
      </section>

      {/* 👣 Footer */}
      <footer className="contact-footer">
        <p>© 2025 SMART APARTMENT | Thiết kế bởi nhóm phát triển</p>
      </footer>
    </div>
  );
};

export default ContactPage;
