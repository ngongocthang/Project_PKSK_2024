import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import { NavLink, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, setUser, unreadCount, setUnreadCount } = useContext(AppContext);
  const [showMenu, setShowMenu] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [rotateIcon, setRotateIcon] = useState(false);

  const getDisplayName = (fullName) => {
    const nameParts = fullName.split(" ");
    return nameParts.slice(-2).join(" ");
  };

  const fetchUnreadNotifications = async () => {
    try {
      const response = await fetch("http://localhost:5000/notification", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await response.json();

      // Kiểm tra xem dữ liệu có phải là mảng không
      if (Array.isArray(data)) {
        // Lọc thông báo chưa đọc
        const unreadNotifications = data.filter(notification => !notification.isRead);
        const unreadCount = unreadNotifications.length;
        setUnreadCount(unreadCount);
      } else {
        setUnreadCount(0); // Nếu không phải mảng, không có thông báo chưa đọc
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông báo chưa đọc:", error);
    }
  };

  // useEffect(() => {
  //   if (user?.token) {
  //     fetchUnreadNotifications(); // Lần đầu tiên khi có user
  //     const interval = setInterval(fetchUnreadNotifications, 1000); // Lấy thông báo mỗi 30 giây

  //     return () => clearInterval(interval); // Dọn dẹp interval khi component bị hủy
  //   }
  // }, [user, setUnreadCount]);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, [setUser]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/account");
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
    setRotateIcon(!rotateIcon);
  };

  const handleNotificationClick = () => {
    setNotificationsCount(0);
    navigate("/Notifications");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="spinner">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between text-sm py-4 mb-5 border-b border-b-gray-400">
      <img
        onClick={() => navigate('/')}
        className="w-20 sm:w-24 cursor-pointer"
        src={assets.logo}
        alt="Logo"
      />

      <ul className="hidden md:flex items-start gap-5 font-medium">
        <NavLink to="/" activeClassName="underline">
          <li className="py-1 text-base">Trang chủ</li>
          <hr className='border-none outline-none h-0.5 bg-[#00759c] w-3/5 m-auto hidden' />
        </NavLink>
        <NavLink to="/doctors" activeClassName="underline">
          <li className="py-1 text-base">Tất cả bác sĩ</li>
          <hr className='border-none outline-none h-0.5 bg-[#00759c] w-3/5 m-auto hidden' />
        </NavLink>
        <NavLink to="/abouts" activeClassName="underline">
          <li className="py-1 text-base">Về chúng tôi</li>
          <hr className='border-none outline-none h-0.5 bg-[#00759c] w-3/5 m-auto hidden' />
        </NavLink>
        <NavLink to="/contact" activeClassName="underline">
          <li className="py-1 text-base">Liên hệ</li>
          <hr className='border-none outline-none h-0.5 bg-[#00759c] w-3/5 m-auto hidden' />
        </NavLink>
        <NavLink to="/all-schedule" activeClassName="underline">
          <li className="py-1 text-base">Đặt lịch hẹn</li>
          <hr className='border-none outline-none h-0.5 bg-[#00759c] w-3/5 m-auto hidden' />
        </NavLink>
      </ul>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-2 cursor-pointer group relative" onClick={() => setShowDropdown(!showDropdown)}>
            <img className="w-8 rounded-full" src={assets.profile_pic} alt="Avatar" />
            <p className="font-medium text-gray-700">{getDisplayName(user.name)}</p>
            <img className="w-2.5" src={assets.dropdown_icon} alt="Dropdown Icon" />
            {showDropdown && (
              <div className="absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20">
                <div className="min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4">
                  <p onClick={() => navigate('my-profile')} className="hover:text-black cursor-pointer">Hồ sơ của tôi</p>
                  <p onClick={() => navigate('my-appointments')} className="hover:text-black cursor-pointer">Lịch hẹn của tôi</p>
                  <p onClick={() => navigate('medical-history')} className="hover:text-black cursor-pointer">Lịch sử khám bệnh</p>
                  <p onClick={handleLogout} className="hover:text-black cursor-pointer">Đăng xuất</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <NavLink to="/account">
            <button className="bg-[#00759c] text-white px-8 py-3 rounded-full font-light hidden md:block">
              Đăng nhập
            </button>
          </NavLink>
        )}

        {user && (
          <div className="relative">
            <img
              onClick={handleNotificationClick}
              className="w-6 cursor-pointer"
              src={assets.notification_icon}
              alt="Thông báo"
            />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
                {unreadCount}
              </span>
            )}
          </div>
        )}

        <img
          onClick={toggleMenu}
          className="w-6 md:hidden"
          src={assets.menu_icon}
          alt="Menu"
        />

        <div className={`transition-all duration-500 ${showMenu ? "fixed w-full top-0 right-0 bottom-0 z-20 bg-white" : "h-0 w-0 overflow-hidden"}`}>
          <div className="flex items-center justify-between px-5 py-6">
            <img className="w-20" src={assets.logo} alt="Logo" />
            <img
              className={`w-7 duration-300 ease-in-out ${rotateIcon ? "rotate-180" : ""}`}
              onClick={toggleMenu}
              src={assets.cross_icon}
              alt="Close"
            />
          </div>
          <ul className="flex flex-col items-center gap-2 mt-5 px-5 text-lg font-medium">
            <NavLink onClick={() => setShowMenu(false)} to="/">
              <p className="px-4 py-2 rounded inline-block">Trang chủ</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/doctors">
              <p className="px-4 py-2 rounded inline-block">Tất cả bác sĩ</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/abouts">
              <p className="px-4 py-2 rounded inline-block">Về chúng tôi</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/contact">
              <p className="px-4 py-2 rounded inline-block">Liên hệ</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/all-schedule">
              <p className="px-4 py-2 rounded inline-block">Đặt lịch hẹn</p>
            </NavLink>
            {!user && (
              <NavLink onClick={() => setShowMenu(false)} to="/account">
                <p className="bg-[#00759c] text-white px-4 py-2 rounded font-light text-center w-full">Đăng nhập</p>
              </NavLink>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;