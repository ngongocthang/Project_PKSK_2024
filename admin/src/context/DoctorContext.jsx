import axios from "axios";
import { createContext, useState } from "react";
import { toast } from "react-toastify";

export const DoctorContext = createContext();

const DoctorContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URI;

  const [dToken, setDToken] = useState(
    localStorage.getItem("dToken") ? localStorage.getItem("dToken") : ""
  );
  const [appointments, setAppointments] = useState([]);
  const [appointmentStatus, setAppointmentStatus] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [specialzations, setSpecialzations] = useState([]);
  const [moneys, setMoneys] = useState([]);
  const [patients, setCountPatients] = useState([]);
  const [dashData, setDashData] = useState(false);
  const [profileData, setProfileData] = useState(false);

  const getAppointments = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/user-appointment`, {
        headers: { Authorization: `Bearer ${dToken}` },
      });

      if (Array.isArray(data) && data.length > 0) {
        setAppointments(data);
      } else {
        return toast.error("Không có lịch hẹn đang chờ xác nhận nào!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getAllAppointments = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/doctor/appointment`, {
        headers: { Authorization: `Bearer ${dToken}` },
      });

      if (Array.isArray(data) && data.length > 0) {
        setAppointments(data);
      } else {
        return console.log("Không có lịch hẹn nào!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const completeAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.put(
        `${backendUrl}/doctor/confirm-appointment/${appointmentId}`,
        { status: "confirmed" },
        { headers: { Authorization: `Bearer ${dToken}` } }
      );
      if (data.appointment.status === "confirmed") {
        // Cập nhật trạng thái trực tiếp trong danh sách appointments
        setAppointments((prevAppointments) =>
          prevAppointments.filter(
            (appointment) => appointment._id !== appointmentId
          )
        );
      } else {
        return;
      }
    } catch (error) {
      console.log(error);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.put(
        `${backendUrl}/doctor/confirm-appointment/${appointmentId}`,
        { status: "canceled" },
        { headers: { Authorization: `Bearer ${dToken}` } }
      );
      if (data.appointment.status === "canceled") {
        toast.success("Từ chối lịch hẹn thành công!");

        // Cập nhật trạng thái trực tiếp trong danh sách appointments
        setAppointments((prevAppointments) =>
          prevAppointments.filter(
            (appointment) => appointment._id !== appointmentId
          )
        );
      } else {
        toast.error("Từ chối lịch hẹn thất bại!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getDashData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/dashboard`, {
        headers: { Authorization: `Bearer ${dToken}` },
      });
      if (data.success) {
        setDashData(data.dashData);
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getProfileData = async () => {
    try {
      const doctorInfo = JSON.parse(sessionStorage.getItem("doctorInfo"));
      const doctorId = doctorInfo ? doctorInfo.id : null;
      const { data } = await axios.get(
        `${backendUrl}/doctor/profile/${doctorId}`,
        {
          headers: { Authorization: `Bearer ${dToken}` },
        }
      );
      if (data.success) {
        setProfileData(data);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const getDoctorSchedule = async (doctorId) => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/doctor/schedule/${doctorId}`,
        {
          headers: { Authorization: `Bearer ${dToken}` },
        }
      );

      if (Array.isArray(data) && data.length > 0) {
        setSchedules(data);
      } else {
        return toast.error("Không có lịch làm việc nào!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getDoctorSpecialization = async (doctorId) => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/doctor/get-specializations/${doctorId}`,
        {
          headers: { Authorization: `Bearer ${dToken}` },
        }
      );

      if (data && data.specialization_id) {
        setSpecialzations([data.specialization_id]);
      } else {
        return console.log("Error fetching specializations!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const createSchedule = async (doctorId, scheduleData) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/doctor/create-schedule/${doctorId}`,
        scheduleData,
        { headers: { Authorization: `Bearer ${dToken}` } }
      );

      if (data.success) {
        toast.success("Tạo lịch làm việc thành công!");
      } else {
        toast.error("Tạo lịch làm việc thất bại!");
      }
    } catch (error) {
      console.log(error);
      toast.error( error.response?.data?.message ||" Lịch làm việc đã tồn tại!");
    }
  };

  const getScheduleById = async (scheduleId) => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/doctor/find-schedule/${scheduleId}`,
        {
          headers: { Authorization: `Bearer ${dToken}` },
        }
      );

      if (data.success) {
        return data.schedule; // Trả về lịch hẹn
      } else {
        toast.error("Không tìm thấy lịch hẹn!");
        return null;
      }
    } catch (error) {
      console.log(error);
      toast.error("Có lỗi xảy ra khi lấy lịch hẹn!");
      return null;
    }
  };

  const updateSchedule = async (scheduleId, scheduleData) => {
    const doctorInfo = JSON.parse(sessionStorage.getItem("doctorInfo"));
    const doctorId = doctorInfo ? doctorInfo.id : null;

    try {
      const { data } = await axios.put(
        `${backendUrl}/doctor/update-schedule/${scheduleId}`,
        { ...scheduleData, id: doctorId },
        { headers: { Authorization: `Bearer ${dToken}` } }
      );

      if (data.success) {
        toast.success("Cập nhật lịch làm việc thành công!");
      } else {
        toast.error("Cập nhật lịch làm việc thất bại!");
      }
    } catch (error) {
      console.log(error);
      toast.error("Không thể cập nhật lịch làm việc trong vòng 24 giờ diễn ra!");
    }
  };

  const deleteSchedule = async (scheduleId) => {
    try {
      const { data } = await axios.delete(
        `${backendUrl}/schedule/delete/${scheduleId}`,
        {
          headers: { Authorization: `Bearer ${dToken}` },
        }
      );

      if (data.success) {
        toast.success("Xóa lịch làm việc thành công!");
        setSchedules((prevSchedules) =>
          prevSchedules.filter((schedule) => schedule._id !== scheduleId)
        );
      } else {
        toast.error("Xóa lịch làm việc thất bại!");
      }
    } catch (error) {
      console.log(error);
      toast.error( error.response?.data?.message || "Bạn không thể xoá lịch làm việc trong vòng 24h trước khi diễn ra!");
    }
  };

  const showUpcomingAppointments = async (userId) => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/show-upcoming-appointments/${userId}`,
        { headers: { Authorization: `Bearer ${dToken}` } }
      );
      setAppointments(data.length > 0 ? data : []);
      if (data.length === 0) console.log("Không có lịch hẹn nào!");
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const getAppointmentsByStatus = async (doctorId) => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/get-appointments-status/${doctorId}`,
        { headers: { Authorization: `Bearer ${dToken}` } }
      );
  
      if (Array.isArray(data) && data.length > 0) {
        setAppointmentStatus(data);
      } else {
        console.log("Không có lịch hẹn sắp tới nào!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const amountPaymentDoctors = async (doctorId) => {
    try {
      const { data } = await axios.get(`${backendUrl}/doctor/get-amount-dashboard-doctor/${doctorId}`, {});

      if (data.success) {
        setMoneys(data.data);
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.log(error.response?.data?.message || error.message);
    }
  };

  const countPatients = async (doctorId) => {
    try {
      const { data } = await axios.get(`${backendUrl}/patient/get-patient-dashboard-doctor/${doctorId}`, {});

      if (data.success) {
        setCountPatients(data.data);
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.log(error.response?.data?.message || error.message);
    }
  };
  

  const value = {
    dToken,
    setDToken,
    backendUrl,
    appointments,
    setAppointments,
    getAppointments,
    completeAppointment,
    cancelAppointment,
    dashData,
    setDashData,
    getDashData,
    profileData,
    setProfileData,
    getProfileData,
    getAllAppointments,
    schedules,
    setSchedules,
    getDoctorSchedule,
    specialzations,
    setSpecialzations,
    getDoctorSpecialization,
    createSchedule,
    getScheduleById,
    updateSchedule,
    deleteSchedule,
    showUpcomingAppointments,
    appointmentStatus,
    setAppointmentStatus,
    getAppointmentsByStatus,
    moneys,
    setMoneys,
    amountPaymentDoctors,
    patients,
    setCountPatients,
    countPatients
  };

  return (
    <DoctorContext.Provider value={value}>
      {props.children}
    </DoctorContext.Provider>
  );
};

export default DoctorContextProvider;
