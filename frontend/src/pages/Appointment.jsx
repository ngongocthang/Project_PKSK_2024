import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Nhập useNavigate
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import RelatedDoctors from "../components/RelatedDoctors";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Appointment = () => {
  const { docId } = useParams();
  const { doctors, user } = useContext(AppContext);
  const navigate = useNavigate(); // Tạo hàm navigate

  // Khai báo state
  const [docInfo, setDocInfo] = useState(null);
  const [slotTime, setSlotTime] = useState("");
  const [doctorSchedule, setDoctorSchedule] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [errorLoadingSchedule, setErrorLoadingSchedule] = useState(false); // Thêm state để theo dõi lỗi

  // Kiểm tra người dùng đã đăng nhập
  useEffect(() => {
    if (!user) {
      return;
    }
  }, [user]);

  const fetchDocInfo = async () => {
    const docInfo = doctors.find((doc) => doc._id === docId);
    setDocInfo(docInfo);
  };

  const fetchDoctorSchedule = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/get-schedule-doctor/${docId}`);
      const groupedSchedule = response.data.reduce((acc, schedule) => {
        const dateStr = new Date(schedule.work_date).toISOString().split("T")[0];
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

  // Đặt lại trạng thái đặt lịch khi một bác sĩ mới được chọn
  useEffect(() => {
    setSelectedDate(null);
    setSlotTime("");
  }, [docId, doctors]);

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

  const handleBooking = async () => {
    if (!user) {
      // Điều hướng đến trang đăng nhập nếu người dùng chưa đăng nhập
      navigate('/account');
      return; // Thoát sớm khỏi hàm
    }
    
    if (slotTime) {
      const formattedDate = new Date(selectedDate).toLocaleDateString("vi-VN", {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
      });

      toast.info(
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center mb-2">
            <i className="fas fa-info-circle text-blue-500 text-2xl mr-2"></i>
            <p className="font-bold text-lg">Thông báo</p>
          </div>
          <p>Bạn có chắc chắn muốn đặt lịch hẹn vào {formattedDate} lúc {slotTime} không?</p>
          <div className="flex mt-2">
            <button
              onClick={() => { confirmBooking(); toast.dismiss(); }}
              className="bg-[#00759c] text-white px-4 py-2 rounded mr-2"
            >
              Có
            </button>
            <button
              onClick={() => toast.dismiss()}
              className="bg-red-500 text-white px-4 py-2 rounded"
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
    } else {
      toast.warn("Vui lòng chọn ca làm việc trước khi đặt lịch hẹn.");
    }
  };

  const confirmBooking = async () => {
    try {
      const patientId = user.id;
      const token = user?.token || "";
      const selectedSchedule = doctorSchedule[selectedDate]?.find(
        (schedule) =>
          (schedule.work_shift === "morning" && slotTime === "Buổi sáng") ||
          (schedule.work_shift === "afternoon" && slotTime === "Buổi chiều")
      );

      if (selectedSchedule && patientId) {
        const appointmentData = {
          patient_id: patientId,
          doctor_id: docId,
          work_shift: selectedSchedule.work_shift,
          work_date: selectedSchedule.work_date,
        };

        await axios.post("http://localhost:5000/create-appointment", appointmentData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success("Đặt lịch hẹn thành công!");

        setSelectedDate(null);
        setSlotTime("");

      } else {
        toast.error("Không tìm thấy lịch hẹn hoặc thông tin bệnh nhân.");
      }
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast.error("Có lỗi xảy ra khi đặt lịch hẹn. Vui lòng thử lại.");
    }
  };

  // Kiểm tra nếu chưa có thông tin bác sĩ
  if (!docInfo) {
    return <div className="text-center text-2xl mt-10 text-gray-500">Đang tải thông tin bác sĩ...</div>;
  }

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
          <p className="flex items-center gap-2 text-2xl font-medium text-gray-900" style={{ lineHeight: '2.5' }}>
            {docInfo.user_id.name}
            <img className="w-5" src={assets.verified_icon} alt="" />
          </p>
          <div className="flex items-center gap-2 text-sm mt-1 text-gray-600" style={{ lineHeight: '2.5' }}>
            <p>Chuyên Khoa: {docInfo.specialization_id.name}</p>
          </div>
          <div>
            <p className="flex items-center gap-1 text-sm font-medium text-gray-900" style={{ lineHeight: '2.5' }}>
              Giới thiệu <img src={assets.info_icon} alt="" />
            </p>
            <p className="text-sm text-gray-500 max-w-[700px] mt-1" style={{ lineHeight: '1.5' }}>
              {docInfo.description}
            </p>
          </div>
        </div>
      </div>

      {/* ----- Booking slots ----- */}
      <div className="sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700">
        <p>Lịch làm việc:</p>
        {errorLoadingSchedule ? (
          <p className="text-red-500"></p>
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
                  <p className={`text-sm font-medium ${isSelected ? "text-white" : "text-gray-600"}`}>
                    {dayOfWeek}
                  </p>
                  <p className={`text-sm font-semibold ${isSelected ? "text-white" : "text-gray-500"}`}>
                    {`${date.getDate()}/${date.getMonth() + 1}`}
                  </p>
                </div>
              );
            })}
          </div>
        )}

         {/* Hiển thị các buổi sáng và chiều theo ngày */}
         {selectedDate && !errorLoadingSchedule && (
          <div className="flex items-center gap-3 w-full overflow-x-auto mt-4">
            {doctorSchedule[selectedDate].map((schedule) => (
              <p key={schedule._id} onClick={() => setSlotTime(schedule.work_shift === "morning" ? "Buổi sáng" : "Buổi chiều")}
                className={`text-sm font-medium px-6 py-3 rounded-full cursor-pointer transition-all duration-300 ${slotTime === (schedule.work_shift === "morning" ? "Buổi sáng" : "Buổi chiều")
                  ? "bg-[#00759c] text-white"
                  : "text-gray-500 border border-gray-300 hover:border-[#00759c] hover:text-[#00759c]"}`}
              >
                {schedule.work_shift === "morning" ? "Buổi sáng" : "Buổi chiều"}
              </p>
            ))}
          </div>
        )}

        {selectedDate && slotTime && (
          <button
            onClick={handleBooking}
            className="bg-[#00759c] text-white text-sm font-light px-14 py-3 rounded-full my-6"
          >
            Đặt lịch hẹn
          </button>
        )}
      </div>

      {/* ----- Danh sách bác sĩ liên quan ----- */}
      <RelatedDoctors docId={docId} speciality={docInfo.specialization_id.name} />
    </div>
  );
};

export default Appointment;