import { BellIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { AdminContext } from "../context/AdminContext";
import { DoctorContext } from "../context/DoctorContext";
import "../index.css";

const Navbar = () => {
  const { aToken, setAToken } = useContext(AdminContext);
  const { dToken, setDToken } = useContext(DoctorContext);
  const navigate = useNavigate();

  // Trạng thái modal (hiển thị thông báo)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Hàm đăng xuất
  const logout = () => {
    navigate("/"); // Điều hướng về trang chủ
    aToken && setAToken("");
    aToken && localStorage.removeItem("aToken");
    dToken && setDToken("");
    dToken && localStorage.removeItem("dToken");
  };

  // Hàm mở/đóng modal
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Hàm chuyển đổi giữa "Tất cả" và "Thu gọn"
  const toggleNotificationView = () => {
    setShowAllNotifications(!showAllNotifications);
  };

  // Lấy thông báo từ API
  const fetchNotifications = async () => {
    try {
      const doctorInfo = JSON.parse(sessionStorage.getItem("doctorInfo"));
      const doctorId = doctorInfo ? doctorInfo.id : null;
      const response = await axios.get(
        `http://localhost:5000/notification/get-notification-doctor/${doctorId}`
      );
      setNotifications(response.data);
      // console.log(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy thông báo:", error);
    }
  };

  useEffect(() => {
    if (dToken) {
      fetchNotifications();
    }
  }, [dToken]);

  // Cập nhật trạng thái thông báo là đã đọc
  const markAsRead = async (notificationId) => {
    try {
      // Cập nhật thông báo là đã đọc
      await axios.put(`http://localhost:5000/notification/read/${notificationId}`);

      // Cập nhật trạng thái trong state
      const updatedNotifications = notifications.map((notification) =>
        notification._id === notificationId
          ? { ...notification, isRead: true }
          : notification
      );
      setNotifications(updatedNotifications);
    } catch (error) {
      console.error("Lỗi khi cập nhật thông báo:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (dToken) {
        fetchNotifications();
      }
    }, 1000); 

    return () => clearInterval(interval);
  }, [dToken]); 

  // Nhóm thông báo theo ngày và sắp xếp từ mới nhất đến cũ nhất
  const groupedNotifications = notifications
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sắp xếp theo thời gian từ mới nhất đến cũ nhất
    .reduce((acc, notification) => {
      const time = notification.createdAt;
      if (!acc[time]) {
        acc[time] = [];
      }
      acc[time].push(notification);
      return acc;
    }, {});

  // Tính số lượng thông báo chưa đọc
  const unreadNotifications = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  // Hàm chuyển đổi thời gian (sử dụng date-fns để tính toán thời gian từ hiện tại)
  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return formatDistanceToNow(date, { addSuffix: true, locale: vi }); // Cấu hình ngôn ngữ tiếng Việt
  };

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.pointerEvents = "none";
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.pointerEvents = "auto";
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.pointerEvents = "auto";
      document.body.style.overflow = "auto";
    };
  }, [isModalOpen]);

  return (
    <div className="flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white">
      <a
        href={aToken ? "http://localhost:5174/admin-dashboard" : "http://localhost:5174/doctor-dashboard"}
      >
        <div className="flex items-center gap-2 text-xs">
          <img
            className="w-36 sm:w-40 cursor-pointer"
            src={assets.admin_logo}
            alt="Logo"
          />
          <p className="border px-2.5 py-0.5 rounded-full border-gray-500 text-gray-600">
            {aToken ? "Quản trị viên" : "Bác sĩ"}
          </p>
        </div>
      </a>

      <div className="flex items-center gap-4">
        {/* Icon thông báo chỉ hiển thị với bác sĩ */}
        {!aToken && (
          <div className="relative">
            <BellIcon
              className="w-6 h-6 text-gray-600 cursor-pointer"
              onClick={toggleModal}
            />
            {/* Hiển thị số lượng thông báo chưa đọc */}
            {unreadNotifications > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {unreadNotifications}
              </span>
            )}
          </div>
        )}

        {/* Nút Đăng xuất */}
        <button
          onClick={logout}
          className="bg-[#0091a1] text-white text-sm px-10 py-2 rounded-full"
        >
          Đăng xuất
        </button>
      </div>

      {/* Modal thông báo */}
      {isModalOpen && !aToken && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-gray-500 bg-opacity-50">
          <div className="bg-white p-8 rounded-lg w-3/4 max-w-5xl modal-content">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Thông báo</h3>
              <button onClick={toggleModal} className="text-gray-500 text-lg">
                Đóng
              </button>
            </div>
            <div className="mt-6">
              {Object.keys(groupedNotifications).length > 0 ? (
                <div className="h-80 overflow-y-auto">
                  {Object.keys(groupedNotifications).map((time) => (
                    <div key={time}>
                      <h4 className="font-semibold text-gray-600 mt-4">
                        {/* Hiển thị thời gian thay vì ngày */}
                        {formatTime(time)}
                      </h4>
                      <ul className="space-y-4">
                        {groupedNotifications[time].map((notification) => (
                          <li
                            key={notification._id}
                            className={`py-3 px-4 border-b border-black-200 flex items-start gap-2 cursor-pointer ${!notification.isRead ? "bg-blue-100" : ""}`}
                            onClick={() => markAsRead(notification._id)}
                          >
                            <BellIcon className="w-5 h-5 text-black" />
                            <p className="text-lg text-gray-800">{notification.content}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Không có thông báo mới.</p>
              )}

              <div className="mt-4">
                <button
                  onClick={toggleNotificationView}
                  className="text-blue-500 text-sm"
                >
                  {showAllNotifications ? "Thu gọn" : "Tất cả"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
