import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import { NavLink, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, setUser } = useContext(AppContext);
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      console.log("User data:", user);
      setUser(user);
    } else {
      console.log("No user data found in localStorage");
    }
    setLoading(false);
  }, [setUser]);

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/account");
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;

      try {
        const response = await fetch("http://localhost:5000/notification", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        if (!response.ok) throw new Error("Lỗi khi lấy thông báo");
        const notifications = await response.json();
        const unreadNotifications = notifications.some(
          (notification) => !notification.read
        );
        setHasNewNotifications(unreadNotifications);

        localStorage.setItem("hasNewNotifications", unreadNotifications.toString());
      } catch (error) {
        console.error("Lỗi khi lấy thông báo:", error);
      }
    };

  }, []);

  useEffect(() => {
    const savedNotificationState = localStorage.getItem("hasNewNotifications");
    if (savedNotificationState === "true") {
      setHasNewNotifications(true);
    } else if (savedNotificationState === "false") {
      setHasNewNotifications(false);
    }
  }, []);  

  const handleNotificationClick = () => {
    setHasNewNotifications(false);
    localStorage.setItem("hasNewNotifications", "false"); 
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
        className="w-44 cursor-pointer"
        src={assets.logo}
        alt="Logo"
        style={{ width: "80px", height: "80px", objectFit: "contain" }}
      />

      <ul className="hidden md:flex items-start gap-5 font-medium">
        <NavLink to="/">
          <li className="py-1 text-base">Trang chủ</li>
        </NavLink>
        <NavLink to="/doctors">
          <li className="py-1 text-base">Tất cả bác sĩ</li>
        </NavLink>
        <NavLink to="/about">
          <li className="py-1 text-base">Về chúng tôi</li>
        </NavLink>
        <NavLink to="/contact">
          <li className="py-1 text-base">Liên hệ</li>
        </NavLink>
      </ul>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-2 cursor-pointer group relative">
            <img className="w-8 rounded-full" src={assets.profile_pic} alt="Avatar" />
            <p className="font-medium text-gray-700">{user.name}</p>
            <img className="w-2.5" src={assets.dropdown_icon} alt="Dropdown Icon" />
            <div className="absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block">
              <div className="min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4">
                <p onClick={() => navigate('my-profile')} className="hover:text-black cursor-pointer">Hồ sơ của tôi</p>
                <p onClick={() => navigate('my-appointments')} className="hover:text-black cursor-pointer">Lịch hẹn của tôi</p>
                <p onClick={() => navigate('medical-history')} className="hover:text-black cursor-pointer">Lịch sử khám bệnh</p>
                <p onClick={handleLogout} className="hover:text-black cursor-pointer">Đăng xuất</p>
              </div>
            </div>
          </div>
        ) : (
          <NavLink to="/account">
            <button onClick={() => navigate('/account')} className="bg-[#00759c] text-white px-8 py-3 rounded-full font-light hidden md:block">
              Tạo tài khoản
            </button>
          </NavLink>
        )}

        <div className="relative">
          {hasNewNotifications && (
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
          )}
          <img
            onClick={handleNotificationClick}
            className="w-6 cursor-pointer"
            src={assets.notification_icon}
            alt="Thông báo"
          />
        </div>

        <img
          onClick={() => setShowMenu(true)}
          className="w-6 md:hidden"
          src={assets.menu_icon}
          alt="Menu"
        />
        {/* Mobile Menu */}
        <div className={`${showMenu ? 'fixed w-full' : 'h-0 w-0'} md:hidden right-0 top-0 bottom-0 z-20 overflow-hidden bg-white transition-all`}>
          <div className="flex items-center justify-between px-5 py-6">
            <img className="w-20" src={assets.logo} alt="Logo" />
            <img className="w-7" onClick={() => setShowMenu(false)} src={assets.cross_icon} alt="Close" />
          </div>
          <ul className="flex flex-col items-center gap-2 mt-5 px-5 text-lg font-medium">
            <NavLink onClick={() => setShowMenu(false)} to="/">
              <p className="px-4 py-2 rounded inline-block">Trang chủ</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/doctors">
              <p className="px-4 py-2 rounded inline-block">Tất cả bác sĩ</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/about">
              <p className="px-4 py-2 rounded inline-block">Về chúng tôi</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/contact">
              <p className="px-4 py-2 rounded inline-block">Liên hệ</p>
            </NavLink>
            {user ? null : (
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
