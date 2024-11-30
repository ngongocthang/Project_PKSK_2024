import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminContext } from "../../context/AdminContext";
import { AppContext } from "../../context/AppContext";

const AllAppointments = () => {
  const { aToken, appointments, getAllAppointments } = useContext(AdminContext);
  const { calculateAge, slotDateFormat, currency } = useContext(AppContext);

  const [currentPage, setCurrentPage] = useState(1);
  const [appointmentsPerPage] = useState(10);

  const totalPages = Math.ceil(appointments.length / appointmentsPerPage);

  const navigate = useNavigate();

  useEffect(() => {
    if (aToken) {
      getAllAppointments();
    }
  }, [aToken]);

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', options);
  };

  const indexOfLastAppointment = currentPage * appointmentsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
  const currentAppointments = appointments.slice(indexOfFirstAppointment, indexOfLastAppointment);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    navigate(`/all-appointments?page=${pageNumber}`);
  };

  return (
    <div className="w-full max-w-6xl m-4">
      <p className="mb-3 text-lg font-medium">Tất cả các cuộc hẹn</p>
      <div className="bg-white border rounded-2xl text-sm max-h-[90vh] min-h-[60vh] overflow-y-scroll">
        {/* Table header */}
        <div className="grid-cols-[0.5fr_1.5fr_2fr_0.5fr_2fr_1fr] bg-gray-200 py-3 px-6 border-b sm:grid hidden">
          <p className="font-bold text-[16px] text-center">#</p>
          <p className="font-bold text-[16px] text-center">Bệnh nhân</p>
          <p className="font-bold text-[16px] text-center">Ngày</p>
          <p className="font-bold text-[16px] text-center">Ca</p>
          <p className="font-bold text-[16px] text-center">Bác sĩ</p>
          <p className="font-bold text-[16px] ml-7">Trạng thái</p>
        </div>

        {/* Appointments */}
        {currentAppointments && currentAppointments.length > 0 ? (
          currentAppointments.map((item, index) => (
            <div
              className="flex flex-col sm:grid sm:grid-cols-[0.5fr_1.5fr_2fr_0.5fr_2fr_1fr] text-gray-500 py-3 px-6 border-b hover:bg-gray-50"
              key={index}
            >
              <p className="font-bold text-center">{index + 1}</p>
              <div className="flex items-center mb-2 md:mb-0 justify-start md:justify-center gap-2">
                <span className="sm:hidden font-semibold">Bệnh nhân:</span>
                <p className="text-gray-700 md:text-base truncate md:whitespace-normal md:w-auto">{item.patientInfo.name}</p>
              </div>

              <p className="md:text-center md:text-base text-left mb-2 md:mb-0">
                <span className="sm:hidden font-semibold">Ngày: </span>
                {formatDate(item.work_date)}
              </p>
              <p className="flex md:gap-3 gap-2">
                <span className="sm:hidden font-semibold">Ca: </span>
                <span
                  className={`px-2 md:py-1 mb-2 md:mb-0 rounded-full text-white text-sm text-center max-w-[80px]
                  ${item.work_shift === "afternoon" ? "bg-orange-300" : "bg-blue-400"} shadow-lg md:max-w-[100px] w-full`}
                >
                  {item.work_shift === "morning" ? "Sáng" : "Chiều"}
                </span>
              </p>

              <div className="flex md:justify-center gap-2 mb-2">
                <span className="sm:hidden font-semibold">Bác sĩ: </span>
                <p className="md:mb-0 text-gray-600 md:text-base">{item.doctorInfo.name}</p>
              </div>

              {/* Appointment Status Button */}
              <div className="flex justify-center">
                {item.status === "canceled" ? (
                  <button className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full shadow-md hover:shadow-lg transition-all duration-300 w-full max-w-[140px] text-center">
                    Đã hủy
                  </button>
                ) : item.status === "confirmed" ? (
                  <button className="bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full shadow-md hover:shadow-lg transition-all duration-300 w-full max-w-[140px] text-center">
                    Đã xác nhận
                  </button>
                ) : item.status === "pending" ? (
                  <button className="bg-yellow-500 text-white text-xs font-medium px-2 py-1 rounded-full shadow-md hover:shadow-lg transition-all duration-300 w-full max-w-[140px] text-center">
                    Đang chờ xác nhận
                  </button>
                ) : (
                  <button className="bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full shadow-md hover:shadow-lg transition-all duration-300 w-full max-w-[140px] text-center">
                    Hoàn thành
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 py-3 px-4">Không tìm thấy cuộc hẹn nào.</p>
        )}
      </div>

      {/* Pagination - Only show if there are 10 or more appointments */}
      {appointments.length >= 10 && (
        <div className="flex justify-center gap-4 mt-4">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => paginate(index + 1)}
              className={`px-4 py-2 rounded-md ${currentPage === index + 1 ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllAppointments;
