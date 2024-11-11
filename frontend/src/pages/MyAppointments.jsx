import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MyAppointments = () => {
  const { user, setUser } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true); // Add loading state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointments = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        setUser({ token });
        const userData = JSON.parse(localStorage.getItem("user"));
        if (userData) {
          setUser(userData);
        }
      } else {
        setError("User not authenticated. Please log in.");
        navigate("/account");
        setLoading(false); // Set loading to false when not authenticated
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/user-appointment", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            setError("User not authenticated. Please log in.");
            navigate("/account");
          } else {
            throw new Error("Failed to fetch appointments");
          }
        } else {
          const data = await response.json();
          setAppointments(data);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setLoading(false); // Set loading to false after data fetching is done
      }
    };

    fetchAppointments();
  }, [setUser, navigate, user?.token]);

  const handleCancelAppointment = (appointmentId) => {
    const confirmDelete = () => {
      const token = user?.token;

      if (!token) {
        setError("User not authenticated. Please log in.");
        navigate("/account");
        return;
      }

      const cancelAppointment = async () => {
        try {
          const response = await fetch(`http://localhost:5000/cancel-appointment/${appointmentId}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error("Failed to cancel appointment");
          }

          setAppointments((prev) => prev.filter((appointment) => appointment._id !== appointmentId));
          toast.success("Cuộc hẹn đã được hủy thành công!");
        } catch (error) {
          console.error("Error canceling appointment:", error);
          toast.error("Bạn chỉ huỷ cuộc hẹn trước 24h.");
        }
      };

      cancelAppointment();
    };

    const appointment = appointments.find((appt) => appt._id === appointmentId);
    const appointmentDate = new Date(appointment.work_date).toLocaleDateString("vi-VN");
    const appointmentShift = appointment.work_shift === "morning" ? "Buổi sáng" : "Buổi chiều";

    toast.warn(
      <div className="p-4">
        <p className="text-lg font-semibold text-center mb-3">
          Bạn có chắc chắn muốn hủy cuộc hẹn ngày {appointmentDate} vào {appointmentShift} này không?
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => {
              toast.dismiss();
              confirmDelete();
            }}
            className="bg-red-600 text-white px-4 py-2 rounded transition duration-300 hover:bg-red-700"
          >
            Có
          </button>
          <button
            onClick={() => toast.dismiss()}
            className="bg-gray-300 text-black px-4 py-2 rounded transition duration-300 hover:bg-gray-400"
          >
            Không
          </button>
        </div>
      </div>,
      {
        closeOnClick: false,
        draggable: false,
        autoClose: false,
        position: "top-center",
      }
    );
  };

  return (
    <div>
      <ToastContainer />
      <p className="pb-3 mt-12 font-medium text-zinc-700 border-b text-xl">
        Lịch hẹn của tôi:
      </p>
      <div>
        {loading ? (
          <p className="text-center text-gray-500 mt-5">Đang tải dữ liệu...</p> 
        ) : appointments.length === 0 ? (
          <p className=" text-center text-gray-500 mt-5">Hiện tại bạn không có lịch hẹn.</p>
        ) : (
          appointments.map((appointment) => (
            <div
              className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b"
              key={appointment._id}
            >
              <div>
                <img className="w-32 bg-indigo-50" src={appointment.doctor_id.user_id.image} alt="Doctor" />
              </div>
              <div className="flex-1 text-sm text-zinc-600">
                <p className="text-lg text-neutral-800 font-semibold">
                  Bệnh nhân: {appointment.patient_id.user_id.name}
                </p>
                <p className="text-neutral-800 font-semibold">
                  Bác sĩ: {appointment.doctor_id.user_id.name}
                </p>
                <p className="text-xs mt-1">
                  <span className="text-sm text-neutral-700 font-medium">
                    Ngày khám:
                  </span>{" "}
                  {new Date(appointment.work_date).toLocaleDateString("vi-VN")}
                </p>
                <p className="text-xs mt-1">
                  <span className="text-sm text-neutral-700 font-medium">
                    Ca khám:
                  </span>{" "}
                  {appointment.work_shift === "morning"
                    ? "Buổi sáng"
                    : "Buổi chiều"}
                </p>
                <p className="text-xs mt-1">
                  <span className="text-sm text-neutral-700 font-medium">Trạng thái:</span>{" "}
                  <span
                    className={`${appointment.status === "pending"
                      ? "text-blue-500"
                      : appointment.status === "confirmed"
                        ? "text-green-500"
                        : "text-red-500"
                      }`}
                  >
                    {appointment.status === "pending"
                      ? "Đang chờ"
                      : appointment.status === "confirmed"
                        ? "Đã xác nhận"
                        : "Từ chối"}
                  </span>
                </p>
              </div>
              <div className="flex flex-col gap-2 justify-end">
                <button className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300">
                  Thanh toán trực tuyến
                </button>
                <button
                  className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300"
                  onClick={() => handleCancelAppointment(appointment._id)}
                >
                  Hủy cuộc hẹn
                </button>
              </div>
            </div>
          ))
        )}
        {error && (
          <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
            <span className="font-medium">Lỗi:</span> {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAppointments;
