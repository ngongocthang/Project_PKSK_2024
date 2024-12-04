import React, { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { useNavigate } from "react-router-dom";

const DoctorWorkSchedule = () => {
  const { dToken, schedules, getDoctorSchedule, deleteSchedule } = useContext(DoctorContext);
  const [showModal, setShowModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [schedulesPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    const doctorInfo = sessionStorage.getItem("doctorInfo");
    const doctorId = doctorInfo ? JSON.parse(doctorInfo).id : null;
    if (dToken && doctorId) {
      getDoctorSchedule(doctorId);
    }
  }, [dToken]);

  // Hàm định dạng ngày
  const formatDate = (date) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    const formattedDate = new Date(date).toLocaleDateString('vi-VN', options);
    return formattedDate;
  };

  const handleDeleteClick = (schedule) => {
    setSelectedSchedule(schedule);
    setShowModal(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedSchedule) {
      await deleteSchedule(selectedSchedule._id);

      const updatedSchedules = schedules.filter(
        (schedule) => schedule._id !== selectedSchedule._id
      );

      // Đợi 0 giây trước khi đóng modal
      setTimeout(() => {
        setShowModal(false);
        setSelectedSchedule(null);
        if (updatedSchedules.length <= 10) {
          setCurrentPage(1);
          navigate(`/doctor-work-schedule`, { replace: true });
        }
      }, 0);
    }
  };

  useEffect(() => {
    setShowModal(false);
    setSelectedSchedule(null);
  }, [schedules]);

  // Logic phân trang
  const indexOfLastSchedule = currentPage * schedulesPerPage;
  const indexOfFirstSchedule = indexOfLastSchedule - schedulesPerPage;
  const currentSchedules = schedules.slice(
    indexOfFirstSchedule,
    indexOfLastSchedule
  );

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    navigate(`/doctor-work-schedule?page=${pageNumber}`);
  };

  // Check if pagination is needed (only show if schedules length > 10)
  const shouldDisplayPagination = schedules.length > schedulesPerPage;

  return (
    <div className="w-full max-w-6xl m-5">
      <div className="flex justify-between items-center mb-3">
        <p className="text-lg font-medium">Tất cả lịch làm việc</p>
        <button
          onClick={() => navigate("/doctor-create-schedule")}
          className="flex items-center px-5 py-2 bg-[#219B9D] text-white text-base rounded hover:bg-[#0091a1]"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
          </svg>
          <span className="hidden mx-1 md:block">Tạo mới</span>
        </button>
      </div>

      <div className="bg-white border rounded-xl text-sm max-h-[80vh] min-h-[50vh] overflow-y-scroll">
        {/* Header chỉ hiển thị trên desktop */}
        <div className="hidden sm:grid grid-cols-[0.5fr_2fr_1fr_1fr] bg-gray-200 gap-4 py-3 px-6 border-b">
          <p className="font-bold text-center text-[16px]">#</p>
          <p className="font-bold text-center text-[16px]">Ngày làm việc</p>
          <p className="font-bold text-center text-[16px]">Ca làm việc</p>
          <p className="font-bold text-center text-[16px]">Hành động</p>
        </div>

        {/* Dữ liệu lịch làm việc */}
        {currentSchedules && currentSchedules.length > 0 ? (
          currentSchedules.map((schedule, index) => (
            <div
              key={schedule._id}
              className="flex flex-col sm:grid sm:grid-cols-[0.5fr_2fr_1fr_1fr] gap-3 py-3 px-5 border-b hover:bg-gray-50"
            >
              {/* Số thứ tự */}
              <p className="md:text-center text-center font-bold">{index + 1}</p>

              {/* Ngày làm việc */}
              <div className="flex md:justify-center items-center cursor-pointer">
                <span className="sm:hidden font-semibold mr-2">Ngày làm việc: </span>
                <td
                  className="text-center font-medium md:border-none border-b text-[16px] hover:text-blue-400 cursor-pointer"
                  onClick={() =>
                    navigate(
                      `/confirm-completed-appointments?date=${schedule.work_date.split("T")[0]}&work-shift=${schedule.work_shift}`
                    )
                  }
                >
                  {formatDate(schedule.work_date)}
                </td>
              </div>

              {/* Ca làm việc */}
              <div className="flex sm:items-center sm:justify-center gap-2">
                <span className="md:hidden font-semibold">Ca làm việc: </span>
                <p
                  className={`py-0 ml-1 p-2 md:py-1 rounded-full text-white text-center max-w-[80px] 
                  ${schedule.work_shift === "afternoon" ? "bg-orange-300" : "bg-blue-300"} shadow-lg md:max-w-[100px] w-full`}
                >
                  {schedule.work_shift === "afternoon" ? "Chiều" : "Sáng"}
                </p>
              </div>

              {/* Hành động */}
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => navigate(`/edit-work-schedule/${schedule._id}`)}
                  className="bg-blue-500 text-white px-3 py-1 rounded shadow-md hover:bg-blue-600"
                >
                  Sửa
                  <i class="fa-solid fa-user-pen ml-2"></i>
                </button>
                <button
                  onClick={() => handleDeleteClick(schedule)}
                  className="bg-red-500 text-white px-3 py-1 rounded shadow-md hover:bg-red-600"
                >
                  Xóa
                  <i class="fa-solid fa-trash ml-2"></i>
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-3">Không tìm thấy lịch làm việc nào.</p>
        )}
      </div>

      {/* Phân trang */}
      {shouldDisplayPagination && (
        <div className="flex justify-center mt-4">
          {Array.from({ length: Math.ceil(schedules.length / schedulesPerPage) }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => paginate(index + 1)}
              className={`px-4 py-2 ${currentPage === index + 1 ? 'bg-[#219c9e] text-white' : 'bg-gray-200'} rounded-md mx-1 hover:bg-[#0091a1]`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}

      {/* Modal xác nhận xóa */}
      {showModal && selectedSchedule && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-semibold mb-4">Xác nhận xóa</h2>
            <p className="mb-4">
              Bạn có chắc chắn muốn xóa lịch làm việc buổi{" "}
              {selectedSchedule.work_shift === "afternoon" ? "Chiều" : "Sáng"} ngày{" "}
              {formatDate(selectedSchedule.work_date)} không?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorWorkSchedule;