import React from 'react';
import { assets } from '../assets/assets';

const Footer = () => {
  return (
    <footer className="bg-[#ffffff] pt-10 pb-6 text-gray-700">
      <div className="container mx-auto px-5 md:px-10 grid gap-10 sm:grid-cols-3 lg:grid-cols-4">

        {/* ----- Left Section: Clinic Info ----- */}
        <div className="flex flex-col items-center lg:items-start">
          <img className="mb-3 w-56 md:w-48 lg:w-64" src={assets.logofood} alt="Clinic Logo" />
          <p className="text-sm leading-6 md:text-center lg:text-left">
            Triple T Care cam kết hướng tới sự xuất sắc trong hoạt động thăm khám lâm sàng, đào tạo và nghiên cứu, nhằm cung cấp dịch vụ chăm sóc tốt nhất. Mạng lưới chăm sóc sức khỏe của chúng tôi bao gồm hơn 2.900 giường bệnh trên khắp 13 bệnh viện và 4 phòng khám, với 27 năm kinh nghiệm.
          </p>
        </div>

        {/* ----- Center Left Section: Quick Links ----- */}
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">PHÒNG KHÁM</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/" className="hover:text-blue-500">Trang chủ</a></li>
            <li><a href="/abouts" className="hover:text-blue-500">Về chúng tôi</a></li>
            <li><a href="/contact" className="hover:text-blue-500">Liên hệ</a></li>
            <li><a href="/privacy-policy" className="hover:text-blue-500">Chính sách bảo mật</a></li>
          </ul>
        </div>

        {/* ----- Center Right Section: Contact Info ----- */}
        <div className="text-center lg:text-left">
          <h3 className="text-lg font-semibold mb-4">LIÊN HỆ</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <span className="font-medium">Điện thoại:</span>
              <a href="tel:+84365142649" className="hover:text-blue-500 ml-1">+84-365-142-649</a>
            </li>
            <li>
              <span className="font-medium">Email:</span>
              <a href="mailto:lequythien1@gmail.com" className="hover:text-blue-500 ml-1">lequythien1@gmail.com</a>
            </li>
            <li>
              <span className="font-medium">Địa chỉ:</span>
              <span className="ml-1">123 Đường ABC, Thành phố XYZ, Việt Nam</span>
            </li>
          </ul>
        </div>

        {/* ----- Right Section: Social Media ----- */}
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">THEO DÕI CHÚNG TÔI</h3>
          <div className="flex justify-center space-x-5">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <img src={assets.facebook_icon} alt="Facebook Icon" className="w-7 h-7 hover:scale-110 transition-transform" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <img src={assets.instagram_icon} alt="Instagram Icon" className="w-7 h-7 hover:scale-110 transition-transform" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <img src={assets.twitter_icon} alt="Twitter Icon" className="w-7 h-7 hover:scale-110 transition-transform" />
            </a>
          </div>
        </div>
      </div>

      {/* ----- Divider and Copyright Section ----- */}
      <div className="mt-8 border-t border-gray-300 pt-6 text-center text-sm text-gray-500">
        <p>Phòng Khám Sức Khỏe © {new Date().getFullYear()}. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
