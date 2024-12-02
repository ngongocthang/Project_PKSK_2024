import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import moment from "moment-timezone";

const ConfirmAppointments = () => {
  const [confirmedAppointments, setConfirmedAppointments] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const doctorInfo = JSON.parse(sessionStorage.getItem("doctorInfo"));
  const doctorId = doctorInfo ? doctorInfo.id : null;
  const location = useLocation();

  // Lấy tham số từ URL
  const queryParams = new URLSearchParams(location.search);
  const workDate = queryParams.get("date");
  const workShift = queryParams.get("work-shift");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.post(
          `http://localhost:5000/doctor/appointment-confirm/${doctorId}`,
          {
            work_date: workDate,
            work_shift: workShift,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (response.data.success) {
          console.log("lay lich hen da xac nhan ", response.data.data);
          setConfirmedAppointments(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };

    if (doctorId && workDate && workShift) {
      fetchAppointments();
    }
  }, [doctorId, workDate, workShift]);

  const completeAppointment = async (id) => {
    setLoadingId(id);
    try {
      const response = await axios.put(
        `http://localhost:5000/doctor/complete-appointment/${id}`
      );
      if (response.data.success) {
        // Cập nhật trạng thái lịch hẹn
        setConfirmedAppointments((prev) =>
          prev.map((appointment) =>
            appointment._id === id
              ? { ...appointment, status: "completed" }
              : appointment
          )
        );
        console.log("Lịch hẹn hoàn thành!");
      }
    } catch (error) {
      console.error("Error completing appointment:", error);
    } finally {
      setLoadingId(null);
    }
  };

  const handleConfirm = (id) => {
    completeAppointment(id);
  };

  const filteredAppointments = confirmedAppointments.filter((appointment) =>
    appointment.patient_id.user_id.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const formatVietnameseDate = (date) => {
    moment.locale("vi");
    const formattedDate = moment
      .utc(date)
      .tz("Asia/Ho_Chi_Minh")
      .format("DD/MM/YYYY"); // Định dạng theo kiểu dd/mm/yyyy
    return formattedDate;
  };
  

  return (
    <div className="w-full max-w-6xl m-5 shadow-lg">
      <div className="flex justify-between items-center mb-3">
        <p className="text-lg font-medium text-gray-700">Xác nhận khám bệnh</p>
        <div className="space-x-4">
          <input
            type="text"
            placeholder="Tìm kiếm bệnh nhân..."
            className="p-2 rounded-lg border-2 border-[#0091a1] bg-blue-50 shadow-md text-sm font-semibold text-gray-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="p-2 rounded-lg border-2 border-[#0091a1] bg-blue-50 shadow-md text-sm font-semibold text-gray-800">
            {formatVietnameseDate(workDate)}
          </span>
        </div>
      </div>

      <div className="bg-white border rounded text-sm max-h-[80vh] min-h-[50vh] overflow-y-scroll">
        {filteredAppointments.length === 0 ? (
          <p className="text-center py-4 text-gray-600">
            Không có lịch hẹn nào trong lịch làm việc này.
          </p>
        ) : (
          <table className="w-full border-collapse">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-2 px-4 font-bold text-[16px]">#</th>
                <th className="py-2 px-4 font-bold text-center text-[16px]">
                  Bệnh nhân
                </th>
                <th className="py-2 px-4 font-bold text-center text-[16px]">
                  Trạng thái thanh toán
                </th>
                <th className="py-2 px-4 font-bold text-center text-[16px]">
                  Ca khám
                </th>
                <th className="py-2 px-4 font-bold text-center text-[16px]">
                  Xác nhận
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((appointment, index) => (
                <tr
                  key={appointment._id}
                  className="hover:bg-gray-50 text-center text-[16px]"
                >
                  <td className="py-3 px-4 text-gray-800 font-medium">
                    {index + 1}
                  </td>
                  <td className="py-3 px-4 text-gray-800 font-medium">
                    {appointment.patient_id.user_id.name}
                  </td>
                  <td className="py-3 px-4 text-center w-[170px]">
                    <p
                      className={`py-1 px-4 rounded-full text-white text-base font-semibold ${
                        appointment.paymentStatus === "true"
                          ? "bg-green-300"
                          : "bg-red-300"
                      }`}
                    >
                      {appointment.paymentStatus === "true" ? "Đã" : "Chưa"}
                    </p>
                  </td>
                  <td className="py-3 px-4 text-center w-[170px]">
                    <p
                      className={`py-1 px-4 rounded-full text-white text-base font-semibold ${
                        appointment.work_shift === "afternoon"
                          ? "bg-orange-300"
                          : "bg-blue-300"
                      }`}
                    >
                      {appointment.work_shift === "morning" ? "Sáng" : "Chiều"}
                    </p>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center gap-4">
                      {loadingId === appointment._id ? (
                        <div className="w-8 h-8 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
                      ) : (
                        <>
                          {appointment.status === "completed" ? (
                            <span className="border border-blue-500 text-blue-500 bg-white py-1 px-3 rounded-full font-semibold">
                              Hoàn thành
                            </span>
                          ) : (
                            <svg
                              onClick={() => handleConfirm(appointment._id)}
                              className="w-[30px] h-[30px] cursor-pointer bg-blue-500 p-2 rounded-full shadow-lg hover:bg-blue-600"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ConfirmAppointments;
