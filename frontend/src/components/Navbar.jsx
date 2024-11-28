import React, { useContext, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, setUser, unreadCount, setUnreadCount } = useContext(AppContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(false);
    }
  }, [user]);

  const fetchUnreadNotifications = async () => {
    try {
      const response = await fetch("http://localhost:5000/notification", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await response.json();

      // Lọc thông báo chưa đọc
      const unreadNotifications = data.filter(notification => !notification.isRead);
      const unreadCount = unreadNotifications.length;

      setUnreadCount(unreadCount);
      // localStorage.setItem("unreadCount", unreadCount);
    } catch (error) {
      console.error("Lỗi khi lấy thông báo chưa đọc:", error);
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchUnreadNotifications(); // Lần đầu tiên khi có user
      const interval = setInterval(fetchUnreadNotifications, 1000); // Lấy thông báo mỗi 30 giây

      return () => clearInterval(interval); // Dọn dẹp interval khi component bị hủy
    }
  }, [user, setUnreadCount]);

  const getDisplayName = (fullName) => {
    const nameParts = fullName.split(" ");
    return nameParts.slice(-2).join(" ");
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/account");
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
          <div className="flex items-center gap-2 cursor-pointer group relative">
            <img className="w-8 rounded-full" src={assets.profile_pic} alt="" />
            <p className="font-medium text-gray-700">{getDisplayName(user.name)}</p>
            <img className="w-2.5" src={assets.dropdown_icon} alt="" />
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
            <button className="bg-[#00759c] text-white px-8 py-3 rounded-full font-light hidden md:block">Đăng nhập</button>
          </NavLink>
        )}

        <div className="relative">
          <img
            onClick={() => {
              if (user) {
                navigate("/notifications");
              } else {
                navigate("/account");
              }
            }}
            className="w-6 cursor-pointer"
            src={assets.notification_icon}
            alt="Thông báo"
          />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-1 text-xs">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
