import axios from "axios";
import moment from "moment-timezone";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const VITE_BACKEND_URI = import.meta.env.VITE_BACKEND_URI;

const ConfirmCompletedAppointments = () => {
  const [confirmedAppointments, setConfirmedAppointments] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [appointmentsPerPage] = useState(10); // Số lịch hẹn hiển thị trên mỗi trang
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
          `${VITE_BACKEND_URI}/doctor/appointment-confirm/${doctorId}`,
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
        `${VITE_BACKEND_URI}/doctor/complete-appointment/${id}`
      );
      if (response.data.success) {
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
    appointment.patient_id && appointment.patient_id.user_id && appointment.patient_id.user_id.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const formatVietnameseDate = (date) => {
    moment.locale("vi");
    const formattedDate = moment
      .utc(date)
      .tz("Asia/Ho_Chi_Minh")
      .format("DD/MM/YYYY");
    return formattedDate;
  };

  // Logic phân trang
  const totalPages = Math.ceil(filteredAppointments.length / appointmentsPerPage);
  const indexOfLastAppointment = currentPage * appointmentsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
  const currentAppointments = filteredAppointments.slice(indexOfFirstAppointment, indexOfLastAppointment);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    const paginationItems = [];

    // Nút "Trang trước"
    paginationItems.push(
      <button
        key="prev"
        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
        className={`py-1 px-3 border rounded ${currentPage === 1 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "text-gray-600"}`}
        disabled={currentPage === 1}
      >
        Trước
      </button>
    );

    // Hiển thị các trang
    for (let i = 1; i <= totalPages; i++) {
      paginationItems.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`py-1 px-3 border rounded ${i === currentPage ? "bg-indigo-500 text-white" : "text-gray-600"}`}
        >
          {i}
        </button>
      );
    }

    // Nút "Trang tiếp theo"
    paginationItems.push(
      <button
        key="next"
        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
        className={`py-1 px-3 border rounded ${currentPage === totalPages ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "text-gray-600"}`}
        disabled={currentPage === totalPages}
      >
        Tiếp
      </button>
    );

    return (
      <div className="flex justify-center items-center mt-4 space-x-2">
        {paginationItems}
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl m-5">
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
        {currentAppointments.length === 0 ? (
          <p className="text-center py-4 text-gray-600">
            Không có lịch hẹn nào trong lịch làm việc này.
          </p>
        ) : (
          <table className="w-full border-collapse">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-2 px-4 font-bold text-[16px]">#</th>
                <th className="py-2 px-4 font-bold text-center text-[16px]">Bệnh nhân</th>
                <th className="py-2 px-4 font-bold text-center text-[16px]">SDT</th>
                <th className="py-2 px-4 font-bold text-center text-[16px]">Trạng thái thanh toán</th>
                <th className="py-2 px-4 font-bold text-center text-[16px]">Ca khám</th>
                <th className="py-2 px-4 font-bold text-center text-[16px] cursor-pointer">Xác nhận</th>
              </tr>
            </thead>
            <tbody>
              {currentAppointments.map((appointment, index) => (
                <tr key={appointment._id} className="hover:bg-gray-50 text-center text-[16px]">
                  <td className="py-3 px-4 text-gray-800 font-medium">{index + 1 + (currentPage - 1) * appointmentsPerPage}</td>
                  <td className="py-3 px-4 text-gray-800 font-medium">{appointment.patient_id.user_id.name}</td>
                  <td className="py-3 px-4 text-gray-800 font-medium">{appointment.patient_id.user_id.phone}</td>
                  <td className="py-3 px-4 text-center w-[250px]">
                    <p className={`py-1 px-4 rounded-full text-white text-base font-semibold ${appointment.paymentStatus === "true" ? "bg-green-300" : "bg-red-300"}`}>
                      {appointment.paymentStatus === "true" ? "Đã thanh toán" : "Chưa thanh toán"}
                    </p>
                  </td>
                  <td className="py-3 px-4 text-center w-[170px]">
                    <p className={`py-1 px-4 rounded-full text-white text-base font-semibold ${appointment.work_shift === "afternoon" ? "bg-orange-300" : "bg-blue-300"}`}>
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
                            <span className="border border-blue-500 text-blue-500 bg-white py-1 px-3 rounded-full font-semibold">Hoàn thành</span>
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

      {/* Phân trang */}
      {totalPages > 1 && renderPagination()}
    </div>
  );
};

export default ConfirmCompletedAppointments;
