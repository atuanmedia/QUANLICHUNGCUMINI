import React from "react";
import { Link } from "react-router-dom";
import "../../styles/client/about.css";

const AboutPage = () => {
  return (
    <div className="about-wrapper">
      {/* 🟡 Header giống LoginPage */}
      <header className="landing-header">
        <div className="logo">
          <img src="/logo.jpg" alt="Logo" />
          <span>AT APARTMENT</span>
        </div>
        <nav>
          <Link to="/about" className="active">Giới thiệu</Link>
          <a href="#features">Tính năng</a>
          <a href="#contact">Liên hệ</a>
          <Link to="/login" className="login-open-btn">Đăng nhập</Link>
        </nav>
      </header>

      {/* 🌆 Hero Section */}
      <section className="about-hero">
        <div className="about-overlay"></div>
        <div className="about-hero-content">
          <h1 className="about-title">SMART APARTMENT</h1>
          <p className="about-subtitle">
            Giải pháp quản lý chung cư mini hiện đại, tiện ích và chuyên nghiệp.
          </p>
        </div>
      </section>

      {/* 🏢 Về chúng tôi */}
      <section className="about-content" id="about">
        <div className="about-text">
          <h2>Về chúng tôi</h2>
          <p>
            <strong>SMART APARTMENT</strong> là nền tảng hỗ trợ chủ trọ và cư dân
            quản lý phòng, hóa đơn, thông tin và liên hệ nhanh chóng – mọi lúc, mọi nơi.
          </p>
          <p>
            Chúng tôi tin rằng sự kết hợp giữa <span>công nghệ</span> và <span>trải nghiệm người dùng</span>
            sẽ mang lại giá trị bền vững cho cộng đồng cư dân hiện đại.
          </p>
        </div>
      </section>

      {/* ✨ Tầm nhìn & Sứ mệnh */}
      <section className="about-vision" id="features">
        <div className="vision-card">
          <h3>TẦM NHÌN</h3>
          <p>
            Trở thành nền tảng quản lý chung cư mini hàng đầu Việt Nam – nơi mỗi cư dân
            có thể kết nối, thanh toán và quản lý thông tin một cách dễ dàng.
          </p>
        </div>
        <div className="vision-card">
          <h3>SỨ MỆNH</h3>
          <p>
            Ứng dụng công nghệ để xây dựng hệ sinh thái quản lý nhà ở hiệu quả,
            minh bạch và thân thiện, giúp cộng đồng phát triển bền vững.
          </p>
        </div>
      </section>

      {/* 👥 Đội ngũ */}
      <section className="about-team" id="contact">
        <h2>Đội ngũ phát triển</h2>
        <p>
          SMART APARTMENT được xây dựng bởi nhóm sinh viên
          <strong> Khoa CNTT – Trường Cao Đẳng Công Thương TP.HCM</strong>, 
          với mong muốn ứng dụng công nghệ vào quản lý và đời sống thực tế.
        </p>
      </section>

      {/* 👣 Footer */}
      <footer className="about-footer">
        <p>© 2025 SMART APARTMENT | Thiết kế bởi nhóm phát triển</p>
      </footer>
    </div>
  );
};

export default AboutPage;
