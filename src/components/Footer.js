import React from 'react';
import '../styles/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>🛍️ Product Manager</h3>
          <p>Hệ thống quản lý và bán hàng trực tuyến chuyên nghiệp</p>
          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              📘 Facebook
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              📷 Instagram
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              🐦 Twitter
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
              📺 YouTube
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h4>Về chúng tôi</h4>
          <ul>
            <li><a href="#about">Giới thiệu</a></li>
            <li><a href="#terms">Điều khoản sử dụng</a></li>
            <li><a href="#privacy">Chính sách bảo mật</a></li>
            <li><a href="#shipping">Chính sách giao hàng</a></li>
            <li><a href="#return">Chính sách đổi trả</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Hỗ trợ khách hàng</h4>
          <ul>
            <li><a href="#faq">Câu hỏi thường gặp</a></li>
            <li><a href="#guide">Hướng dẫn mua hàng</a></li>
            <li><a href="#payment">Phương thức thanh toán</a></li>
            <li><a href="#warranty">Chính sách bảo hành</a></li>
            <li><a href="#contact">Liên hệ hỗ trợ</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Liên hệ</h4>
          <ul className="contact-info">
            <li>📍 123 Đường ABC, Quận 9, TP.HCM</li>
            <li>📞 Hotline: 1900-xxxx</li>
            <li>📧 Email: Hoaisung@gmail.com</li>
            <li>🕐 Thứ 2 - Chủ nhật: 8:00 - 22:00</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} Product Manager System. All rights reserved.</p>
        <p>Designed with ❤️ by Hoài Sung</p>
      </div>
    </footer>
  );
};

export default Footer;