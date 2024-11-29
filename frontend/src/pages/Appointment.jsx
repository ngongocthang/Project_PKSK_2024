import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { assets } from "../assets/assets";
import RelatedDoctors from "../components/RelatedDoctors";
import { AppContext } from "../context/AppContext";

const Appointment = () => {
  const { docId } = useParams();
  const { doctors, user } = useContext(AppContext);
  const navigate = useNavigate();

  const [docInfo, setDocInfo] = useState(null);
  const [slotTime, setSlotTime] = useState("");
  const [doctorSchedule, setDoctorSchedule] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [errorLoadingSchedule, setErrorLoadingSchedule] = useState(false);

  useEffect(() => {
    if (!user && !localStorage.getItem("user")) {
      navigate("/account");
    }
  }, [user, navigate]);

  const fetchDocInfo = () => {
    const docInfo = doctors.find((doc) => doc._id === docId);
    setDocInfo(docInfo);
  };

  const fetchDoctorSchedule = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/get-schedule-doctor/${docId}`
      );
      const groupedSchedule = response.data.reduce((acc, schedule) => {
        const dateStr = new Date(schedule.work_date)
          .toISOString()
          .split("T")[0];
        if (!acc[dateStr]) acc[dateStr] = [];
        acc[dateStr].push(schedule);
        return acc;
      }, {});
      setDoctorSchedule(groupedSchedule);
      setErrorLoadingSchedule(false);
    } catch (error) {
      console.error("Error fetching doctor schedule:", error);
      setErrorLoadingSchedule(true);
    }
  };

  useEffect(() => {
    setSelectedDate(null);
    setSlotTime("");
  }, [docId]);

  useEffect(() => {
    if (doctors.length > 0) {
      fetchDocInfo();
    }
  }, [doctors, docId]);

  useEffect(() => {
    if (docInfo) {
      fetchDoctorSchedule();
    }
  }, [docInfo]);

  useEffect(() => {
    setSlotTime("");
  }, [selectedDate]);

  const handleBooking = () => {
    if (!user && !localStorage.getItem("user")) {
      navigate("/account");
      return;
    }

    if (!selectedDate || !slotTime) {
      toast.warn("Vui lòng chọn ngày và ca làm việc.");
      return;
    }

    const formattedDate = new Date(selectedDate).toLocaleDateString("vi-VN", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });

    toast.dismiss();
    toast.info(
      <div className="flex flex-col items-center justify-center">
        <div className="flex items-center mb-2">
          <i className="fas fa-info-circle text-blue-500 text-2xl mr-2"></i>
          <p className="font-bold text-lg">Thông báo</p>
        </div>
        <p>
          Bạn có chắc chắn muốn đặt lịch hẹn vào {formattedDate} lúc{" "}
          {slotTime} không?
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => {
              confirmBooking();
              toast.dismiss();
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
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        progress: undefined,
      }
    );
  };

  const confirmBooking = async () => {
    try {
      const patientId = user?.id || JSON.parse(localStorage.getItem("user"))?.id;
      if (!patientId) {
        console.error("Không tìm thấy thông tin bệnh nhân.");
        toast.error("Thông tin bệnh nhân không hợp lệ.");
        return;
      }

      const selectedSchedule = doctorSchedule[selectedDate]?.find(
        (schedule) =>
          (schedule.work_shift === "morning" && slotTime === "Buổi sáng") ||
          (schedule.work_shift === "afternoon" && slotTime === "Buổi chiều")
      );

      if (!selectedSchedule) {
        console.error("Không tìm thấy ca làm việc đã chọn.");
        toast.error("Không tìm thấy lịch hẹn cho ngày và giờ đã chọn.");
        return;
      }

      const appointmentData = {
        patient_id: patientId,
        doctor_id: docId,
        work_shift: selectedSchedule.work_shift,
        work_date: selectedSchedule.work_date,
      };

      const token = user?.token || "";
      const response = await axios.post(
        `http://localhost:5000/create-appointment/${patientId}`,
        appointmentData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Đặt lịch hẹn thành công!");
      setSelectedDate(null);
      setSlotTime("");
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast.error(error.response?.data?.message || "Lỗi không xác định.");
    }
  };

  if (!docInfo) {
    return (
      <div className="text-center text-2xl mt-10 text-gray-500">
        Đang tải thông tin bác sĩ...
      </div>
    );
  }

  const formatPrice = (price) => {
    if (isNaN(price)) return price;
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  return (
    <div>
      <ToastContainer />
      {/* ----- Doctor Details ----- */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div>
          <img
            className="bg-primary w-full sm:max-w-72 rounded-lg"
            src={docInfo.user_id.image}
            alt=""
          />
        </div>

        <div className="flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0">
          <p className="flex items-center gap-2 text-2xl font-medium text-gray-900" style={{ lineHeight: "2.5" }}>
            {docInfo.user_id.name}
            <p className="flex items-center gap-2 text-2xl font-medium text-gray-900" style={{ lineHeight: "2.5" }}>
              <img className="w-5" src={assets.verified_icon} alt="" />
            </p>
          </p>
          <div className="flex items-center gap-2 text-sm mt-1 text-gray-600" style={{ lineHeight: "2.5" }}>
            <p><strong>Giá:</strong> {formatPrice(docInfo.price)} VND</p>
          </div>
          <div className="flex items-center gap-2 text-sm mt-1 text-gray-600" style={{ lineHeight: "2.5" }}>
            <p><strong>Chuyên Khoa:</strong> {docInfo.specialization_id.name}</p>
          </div>
          <div>
            <p className="flex items-center gap-1 text-sm font-medium text-gray-600" style={{ lineHeight: "2.5" }}>
              <strong>Giới thiệu</strong><img src={assets.info_icon} alt="" />
            </p>
            <p className="text-sm text-gray-500 mt-1 max-w-full sm:max-w-[12000px]" style={{ lineHeight: "1.5", textAlign: "justify" }}>
              {docInfo.description}
            </p>
          </div>
        </div>
      </div>

      {/* ----- Booking slots ----- */}
      <div className="sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700">
        <p>Đặt khám nhanh:</p>

        {errorLoadingSchedule ? (
          <p className="text-red-500">Hiện tại bác sĩ chưa có lịch làm việc.</p>

        ) : (
          <div className="flex gap-3 items-center w-full overflow-x-scroll mt-4 py-2">
            {Object.keys(doctorSchedule).map((dateStr) => {
              const date = new Date(dateStr);
              const dayOfWeek = date.toLocaleDateString("vi-VN", { weekday: "long" });
              const isSelected = selectedDate === dateStr;

              return (
                <div
                  key={dateStr}
                  className={`text-center w-[100px] h-[100px] flex flex-col justify-center items-center rounded-full border cursor-pointer transition-all duration-300
              ${isSelected ? "bg-[#00759c] text-white border-[#00759c]" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
                  onClick={() => setSelectedDate(dateStr)}
                >
                  <p className={`text-sm font-bold ${isSelected ? "text-white" : "text-gray-600"}`}>{dayOfWeek}</p>
                  <p className={`text-sm font-semibold ${isSelected ? "text-white" : "text-gray-500"}`}>
                    {`${date.getDate()}/${date.getMonth() + 1}`}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Hiển thị các buổi sáng và chiều theo ngày đã chọn */}
        {selectedDate && !errorLoadingSchedule && (
          <div className="flex items-center gap-3 w-full overflow-x-auto mt-4">
            {doctorSchedule[selectedDate].map((schedule) => (
              <p
                key={schedule._id}
                onClick={() => setSlotTime(schedule.work_shift === "morning" ? "Buổi sáng" : "Buổi chiều")}
                className={`text-sm font-semibold px-6 py-3 rounded-full cursor-pointer transition-all duration-300 ${slotTime === (schedule.work_shift === "morning" ? "Buổi sáng" : "Buổi chiều")
                  ? "bg-[#00759c] text-white"
                  : "text-gray-500 border border-gray-300 hover:border-[#00759c] hover:text-[#00759c]"
                  }`}
              >
                {schedule.work_shift === "morning" ? "Buổi sáng" : "Buổi chiều"}
              </p>
            ))}
          </div>
        )}

        {/* Nút đặt lịch chỉ hiển thị khi đã chọn ngày và ca */}
        {selectedDate && slotTime && (
          <button
            onClick={handleBooking}
            className="bg-[#00759c] text-white text-sm font-bold px-14 py-3 rounded-full my-6"
          >
            Đặt lịch hẹn
          </button>
        )}
      </div>

      {/* ----- Related Doctors ----- */}
      <RelatedDoctors docId={docId} speciality={docInfo.specialization_id.name} />
    </div>
  );
};

export default Appointment;
