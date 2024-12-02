import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AppContext } from "../context/AppContext";
import "../index.css"

const MyAppointments = () => {
  const { user, setUser } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toastId = React.useRef(null);

  const formatPrice = (price) => {
    if (isNaN(price)) return price;
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const checkPaymentStatus = async (appointmentId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/check-payment-status/${appointmentId}`
      );

      if (response.data.success) {
        return response.data.status;
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
      return false;
    }
  };

  const fetchAppointments = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("User not authenticated. Please log in.");
      navigate("/account");
      setLoading(false);
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

        // Kiểm tra trạng thái thanh toán cho từng cuộc hẹn
        const updatedAppointments = await Promise.all(
          data.map(async (appointment) => {
            const paymentStatus = await checkPaymentStatus(appointment._id);
            return { ...appointment, paymentStatus };
          })
        );

        setAppointments(updatedAppointments);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();

    // Kiểm tra nếu người dùng quay lại từ MoMo
    const queryParams = new URLSearchParams(window.location.search);
    const appointmentId = queryParams.get("appointmentId");
    if (appointmentId) {
      fetchAppointments(); // Cập nhật lại danh sách cuộc hẹn
    }
  }, [setUser, navigate, user?.token]);

  const handleCancelAppointment = (appointmentId) => {
    const appointment = appointments.find((appt) => appt._id === appointmentId);
    const appointmentDate = new Date(appointment.work_date).toLocaleDateString(
      "vi-VN"
    );
    const appointmentShift =
      appointment.work_shift === "morning" ? "Buổi sáng" : "Buổi chiều";

    const confirmDelete = async () => {
      const token = user?.token;

      if (!token) {
        setError("User not authenticated. Please log in.");
        navigate("/account");
        return;
      }
      try {
        const response = await axios.put(
          `http://localhost:5000/cancel-appointment/${appointmentId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          toast.error("Có lỗi xảy ra khi hủy cuộc hẹn.");
          console.error("Error else here:", error);
         
        } else {
          console.log("Appointment canceled successfully");
          toast.success("Cuộc hẹn đã được hủy thành công!");
          fetchAppointments();
        }
      } catch (error) {
        console.error("Error canceling appointment:", error);
        toast.error("Bạn chỉ huỷ cuộc hẹn trước 24h.");
      }
    };

    if (!toast.isActive(toastId.current)) {
      toastId.current = toast.warn(
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center mb-2">
            <i className="fas fa-info-circle text-blue-500 text-2xl mr-2"></i>
            <p className="font-bold text-lg">Thông báo</p>
          </div>
          <p>
            Bạn có chắc chắn muốn hủy cuộc hẹn ngày {appointmentDate} vào{" "}
            {appointmentShift} này không?
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={() => {
                toast.dismiss(toastId.current);
                confirmDelete();
              }}
              className="bg-red-600 text-white px-4 py-2 rounded transition duration-300 hover:bg-red-700"
            >
              Có
            </button>
            <button
              onClick={() => toast.dismiss(toastId.current)}
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
    }
  };

  const handlePayment = async (appointmentId, price) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/payment/${appointmentId}`,
        { price },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (response.data.resultCode === 0) {
        const shortLink = response.data.payUrl;
        window.location.href = shortLink; // Chuyển hướng tới cổng thanh toán MoMo
      }
    } catch (error) {
      console.error("Error making payment:", error);
      toast.error("Có lỗi xảy ra khi thực hiện thanh toán.");
    }
  };

  return (
    <div className="mb-10">
      <ToastContainer />
      <p className="pb-3 mt-12 font-medium text-zinc-700 border-b text-xl">
        Lịch hẹn của tôi:
      </p>
      <div className="appointments-container"> {/* Thêm div này */}
        {loading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : appointments.length === 0 ? (
          <p className="text-center text-gray-500 mt-5">
            Hiện tại bạn không có lịch hẹn.
          </p>
        ) : (
          appointments.map((appointment) => (
            <div
              className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b"
              key={appointment._id}
            >
              <div>
                <img
                  className="w-32 bg-indigo-50"
                  src={appointment.doctor_id.user_id.image}
                  alt="Doctor"
                />
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
                  <span className="text-sm text-neutral-700 font-medium">
                    Trạng thái:
                  </span>{" "}
                  <span
                    className={`${
                      appointment.status === "pending"
                        ? "text-yellow-500"
                        : appointment.status === "confirmed"
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {appointment.status === "pending"
                      ? "Đang chờ"
                      : appointment.status === "confirmed"
                      ? "Đã xác nhận"
                      : "Đã hủy"}
                  </span>
                </p>
                <p className="text-xs mt-1">
                  <span className="text-sm text-neutral-700 font-medium">
                    Giá khám:
                  </span>{" "}
                  {formatPrice(appointment.doctor_id.price)} (VND)
                </p>
                <p className="text-xs mt-1">
                  <span className="text-sm text-neutral-700 font-medium">
                    Trạng thái thanh toán:
                  </span>{" "}
                  <span
                    className={`${
                      appointment.paymentStatus
                        ? "text-green-500"
                        : "text-yellow-500"
                    }`}
                  >
                    {appointment.paymentStatus
                      ? "Đã thanh toán"
                      : "Chưa thanh toán"}
                  </span>
                </p>
              </div>
              <div className="flex flex-col gap-2 justify-end">
                {/* Vô hiệu hóa nút thanh toán nếu trạng thái không phải là confirmed */}
                <button
                  onClick={() =>
                    handlePayment(appointment._id, appointment.doctor_id.price)
                  }
                  className={`text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded transition-all duration-300 ${
                    !appointment.paymentStatus &&
                    appointment.status === "confirmed"
                      ? "hover:bg-primary hover:text-white"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                  disabled={
                    appointment.status !== "confirmed" ||
                    appointment.paymentStatus
                  }
                >
                  Thanh toán trực tuyến
                </button>
                {/* Vô hiệu hóa nút hủy nếu trạng thái thanh toán là "Đã thanh toán" */}
                <button
                  onClick={() => handleCancelAppointment(appointment._id)}
                  className={`text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded transition-all duration-300 ${
                    appointment.paymentStatus
                      ? "bg-gray-300 cursor-not-allowed"
                      : "hover:bg-red-600 hover:text-white"
                  }`}
                  disabled={appointment.paymentStatus}
                >
                  Hủy cuộc hẹn
                </button>
              </div>
          </div>
            ))
        )}
        {error && (
          <div
            className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg"
            role="alert"
          >
            <span className="font-medium">Lỗi:</span> {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAppointments;
