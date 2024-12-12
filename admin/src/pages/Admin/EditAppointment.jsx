import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const VITE_BACKEND_URI = import.meta.env.VITE_BACKEND_URI;

const AppointmentDetails = () => {
  const { id } = useParams(); // Lấy ID từ params
  const [appointment, setAppointment] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [doctorSchedules, setDoctorSchedules] = useState([]); // Lịch làm việc của bác sĩ đã chọn
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const response = await axios.get(
          `${VITE_BACKEND_URI}/appointment/find/${id}`
        );
        if (response.data.success) {
          setAppointment(response.data.data);
          setSelectedDoctorId(response.data.data.doctor_id); // Lưu ID bác sĩ mặc định
        } else {
          toast.error("Không tìm thấy thông tin cuộc hẹn!");
        }
      } catch (error) {
        toast.error(
          error.response?.data.message || "Đã xảy ra lỗi khi lấy thông tin!"
        );
      } finally {
        setLoading(false);
      }
    };

    const fetchDoctors = async () => {
      try {
        const response = await axios.get(`${VITE_BACKEND_URI}/doctor/find-all`);
        if (response.data.success) {
          setDoctors(response.data.doctors);
        } else {
          toast.error("Không tìm thấy danh sách bác sĩ!");
        }
      } catch (error) {
        toast.error(
          error.response?.data.message ||
            "Đã xảy ra lỗi khi lấy danh sách bác sĩ!"
        );
      }
    };

    fetchAppointment();
    fetchDoctors();
  }, [id]);

  useEffect(() => {
    const fetchDoctorSchedules = async () => {
      if (selectedDoctorId) {
        try {
          const doctor = doctors.find((doc) => doc._id === selectedDoctorId);
          if (doctor) {
            // Lọc lịch làm việc chỉ hiển thị những ngày và ca khám sau giờ hiện tại
            const currentDateTime = new Date();
            const filteredSchedules = doctor.schedules.filter((schedule) => {
              const scheduleDate = new Date(schedule.work_date);
              const morningShiftStart = new Date(scheduleDate);
              morningShiftStart.setHours(7, 30); // 7h30

              const afternoonShiftStart = new Date(scheduleDate);
              afternoonShiftStart.setHours(13, 30); // 13h30

              return scheduleDate > currentDateTime || 
                     (schedule.work_shift === "morning" && morningShiftStart > currentDateTime) ||
                     (schedule.work_shift === "afternoon" && afternoonShiftStart > currentDateTime);
            });

            setDoctorSchedules(filteredSchedules); // Lưu lịch làm việc đã lọc
          }
        } catch (error) {
          toast.error("Đã xảy ra lỗi khi lấy lịch làm việc của bác sĩ!");
        }
      }
    };

    fetchDoctorSchedules();
  }, [selectedDoctorId, doctors]);

  const onCancelHandler = () => {
    navigate("/all-appointments"); // Điều hướng về danh sách cuộc hẹn
  };

  const handleDoctorChange = (event) => {
    setSelectedDoctorId(event.target.value); // Cập nhật bác sĩ được chọn
  };

  const handleScheduleChange = (event) => {
    const selectedSchedule = doctorSchedules.find(
      (schedule) => schedule.work_date === event.target.value
    );
    if (selectedSchedule) {
      setAppointment((prev) => ({
        ...prev,
        work_date: selectedSchedule.work_date,
        work_shift: selectedSchedule.work_shift,
      }));
    }
  };

  const handleUpdateAppointment = async () => {
    try {
      const updatedData = {
        work_date: appointment.work_date,
        work_shift: appointment.work_shift,
        doctor_id: selectedDoctorId,
        patient_id: appointment.patient_id, // Giả định bạn đã lưu patient_id trong appointment
        status: appointment.status,
      };

      const response = await axios.put(
        `${VITE_BACKEND_URI}/appointment/admin-update/${id}`,
        updatedData
      );

      if (response.data.success) {
        toast.success("Cập nhật cuộc hẹn thành công!");
        navigate("/all-appointments");
      } else {
        toast.error("Cập nhật cuộc hẹn thất bại!");
      }
    } catch (error) {
      toast.error(
        error.response?.data.message || "Đã xảy ra lỗi khi cập nhật!"
      );
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Hiển thị loading khi đang lấy dữ liệu
  }

  if (!appointment) {
    return <div>Không có thông tin cuộc hẹn.</div>; // Nếu không có thông tin
  }

  return (
    <form className="m-5 w-full">
      <div className="flex justify-between items-center mb-4">
        <p className="md:text-3xl text-xl font-bold text-[#0091a1]">
          Thông tin cuộc hẹn
        </p>
      </div>
      <div className="overflow-x-auto bg-white p-4 rounded-md shadow-md">
        <div className="flex flex-col lg:flex-row items-start gap-10 text-gray-500">
          <div className="w-full lg:flex-1 flex flex-col gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <p className="font-bold">Bác sĩ:</p>
              <select
                className="border rounded px-3 py-2 text-black"
                value={selectedDoctorId}
                onChange={handleDoctorChange}
              >
                {doctors.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    {doctor.user_id.name} ({doctor.specialization_id.name})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <p className="font-bold">Bệnh nhân:</p>
              <input
                className="border rounded px-3 py-2"
                type="text"
                value={appointment.patient_name}
                readOnly
              />
            </div>
          </div>

          <div className="w-full lg:flex-1 flex flex-col gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <p className="font-bold">Ngày - Ca khám:</p>
              <select
                className="border rounded px-3 py-2"
                value={appointment.work_date}
                onChange={handleScheduleChange}
              >
                <option value="">Chọn ngày khám</option>
                {doctorSchedules.map((schedule) => (
                  <option key={schedule.work_date} value={schedule.work_date}>
                    {new Date(schedule.work_date).toLocaleDateString()} -{" "}
                    {schedule.work_shift === "morning" ? "Sáng" : "Chiều"}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <p className="font-bold">Trạng thái:</p>
              <input
                className="border rounded px-3 py-2"
                type="text"
                value={
                  appointment.status === "canceled"
                    ? "Đã huỷ"
                    : appointment.status === "confirmed"
                    ? "Đã xác nhận"
                    : appointment.status === "pending"
                    ? "Đang chờ xác nhận"
                    : "Đã xác nhận"
                }
                readOnly
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-4">
          <button
            type="button"
            onClick={handleUpdateAppointment}
            className="bg-blue-500 px-10 py-3 text-white rounded-full hover:bg-blue-600"
          >
            Cập nhật
          </button>
          <button
            type="button"
            onClick={onCancelHandler}
            className="bg-gray-300 px-10 py-3 text-black rounded-full hover:bg-gray-400"
          >
            Quay lại
          </button>
        </div>
      </div>
    </form>
  );
};

export default AppointmentDetails;
