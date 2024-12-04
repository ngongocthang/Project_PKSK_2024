import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DoctorContext } from '../../context/DoctorContext';

const DoctorAppointments = () => {
  const { dToken, appointments, getAllAppointments } = useContext(DoctorContext);
  const [currentPage, setCurrentPage] = useState(1);
  const appointmentsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    if (dToken) {
      getAllAppointments();
    }
  }, [dToken]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  // Paginate appointments
  const indexOfLastAppointment = currentPage * appointmentsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
  const currentAppointments = appointments.slice(indexOfFirstAppointment, indexOfLastAppointment);

  // Handle pagination
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    navigate(`/doctor-appointments?page=${pageNumber}`);
  };

  // Calculate total pages
  const totalPages = Math.ceil(appointments.length / appointmentsPerPage);

  return (
    <div className='w-full max-w-6xl m-5'>
      <p className='mb-4 text-lg font-medium'>Tất cả lịch hẹn:</p>
      <div className='bg-white border rounded-xl text-sm max-h-[80vh] min-h-[50vh] overflow-y-scroll'>

        {/* Header Row - Only for larger screens */}
        <div className='hidden sm:grid grid-cols-[0.5fr_1fr_1fr_0.5fr_0.7fr_auto] gap-4 py-4 px-6 bg-gray-200 border-b text-center'>
          <p className='font-bold text-[16px]'>#</p>
          <p className='font-bold text-[16px]'>Bệnh nhân</p>
          <p className='font-bold text-[16px]'>Ngày khám</p>
          <p className='font-bold text-[16px]'>Ca khám</p>
          <p className='font-bold text-[16px] justify-self-end'>Trạng thái</p>
        </div>

        {currentAppointments.length > 0 ? (
          currentAppointments.reverse().map((item, index) => (
            <div
              className='grid sm:grid-cols-[0.5fr_1fr_1fr_0.5fr_0.7fr_auto] items-center gap-3 py-4 px-6 border-b hover:bg-gray-50'
              key={item._id}
            >
              {/* Hiển thị thông tin theo hàng trên mobile */}
              <div className="sm:block text-center font-bold">
                <p className='font-bold'>{index + 1}</p>
              </div>

              <div className="text-left sm:text-center">
                <p className='text-base md:text-center font-medium md:font-normal'>
                  <span className="md:hidden font-semibold">Bệnh nhân: </span>
                  {item.patient_id?.user_id?.name || 'Unknown'}
                </p>
              </div>

              <div className="text-left sm:text-center">
                <p className='text-base'>
                  <span className="md:hidden font-semibold">Ngày khám: </span>
                  {formatDate(item.work_date)}
                </p>
              </div>

              <div className="flex justify-start sm:justify-center items-center">
                <span className="md:hidden text-sm font-semibold mr-2">Ca khám: </span>
                <p
                  className={`py-0 md:py-1 rounded-full text-white text-sm text-center 
                    ${item.work_shift === "afternoon" ? "bg-orange-300" : "bg-blue-300"} shadow-lg max-w-[100px] w-full`}
                >
                  {item.work_shift === "morning" ? "Sáng" : "Chiều"}
                </p>
              </div>

              {/* Center status buttons on mobile, align right on larger screens */}
              <div className='flex gap-3 justify-start sm:justify-self-end'>
                <span className="md:hidden text-sm font-semibold">Trạng thái: </span>
                {item.status === "pending" && (
                  <button className='bg-yellow-400 text-white font-semibold py-1 px-4 rounded-full text-xs sm:text-sm'>
                    Đang chờ
                  </button>
                )}
                {item.status === "confirmed" && (
                  <button className='bg-green-500 text-white font-semibold py-1 px-4 rounded-full text-xs sm:text-sm'>
                    Đã xác nhận
                  </button>
                )}
                {item.status === "canceled" && (
                  <button className='bg-red-500 text-white font-semibold py-1 px-4 rounded-full text-xs sm:text-sm'>
                    Đã từ chối
                  </button>
                )}
                {item.status === "completed" && (
                  <button className='bg-blue-500 text-white font-semibold py-1 px-4 rounded-full text-xs sm:text-sm'>
                    Đã hoàn thành
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className='text-gray-500 py-3 text-center'>Không có lịch hẹn nào!</p>
        )}
      </div>

      {/* Pagination - Centered and responsive */}
      {appointments.length > appointmentsPerPage && (
        <div className="flex justify-center mt-4">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => paginate(index + 1)}
              className={`px-4 py-2 ${currentPage === index + 1 ? 'bg-[#219c9e] text-white' : 'bg-gray-200'} rounded-md mx-1 hover:bg-[#0091a1] hover:text-white text-xs sm:text-sm`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );

};

export default DoctorAppointments;
