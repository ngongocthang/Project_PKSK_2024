import React, { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css'; // Import AOS styles

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 500, once: true }); // Init AOS with 1s duration and only animate once
  }, []);

  // Kiểm tra khi nào nút "Scroll to Top" nên hiển thị
  const checkScrollPosition = () => {
    if (window.pageYOffset > 250) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Lắng nghe sự kiện cuộn trang
  useEffect(() => {
    window.addEventListener('scroll', checkScrollPosition);
    return () => {
      window.removeEventListener('scroll', checkScrollPosition);
    };
  }, []);

  // Hàm cuộn trang lên đầu
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    isVisible && (
      <button
        onClick={scrollToTop}
        className="fixed bg-[#0090a1] text-white p-5 rounded-full shadow-lg hover:bg-[#00759c]"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
        }}
        data-aos="zoom-in-up"
      >
        <i class="fa-solid fa-arrow-up"></i>
      </button>
    )
  );
};

export default ScrollToTopButton;
