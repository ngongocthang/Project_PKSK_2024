// doctorcontext
import { createContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const DoctorContext = createContext();

const DoctorContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [dToken, setDToken] = useState(
    localStorage.getItem("dToken") ? localStorage.getItem("dToken") : ""
  );
  const [appointments, setAppointments] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [specialzations, setSpecialzations] = useState([]);
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
        return toast.error("Không có lịch hẹn nào!");
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
        toast.success("Xác nhận lịch hẹn thành công!");

        // Cập nhật trạng thái trực tiếp trong danh sách appointments
        setAppointments((prevAppointments) =>
          prevAppointments.filter(
            (appointment) => appointment._id !== appointmentId
          )
        );
      } else {
        return toast.error("Xác nhận lịch hẹn thất bại!");
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
        console.log(data.dashData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const getProfileData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/profile`, {
        headers: { Authorization: `Bearer ${dToken}` },
      });
      if (data.success) {
        setProfileData(data.profileData);
        console.log(data.profileData);
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
  };

  return (
    <DoctorContext.Provider value={value}>
      {props.children}
    </DoctorContext.Provider>
  );
};

export default DoctorContextProvider;
