import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DoctorContext } from '../../context/DoctorContext';

const ConfirmationSchedule = () => {
  const { dToken, appointments, getAppointments, completeAppointment, cancelAppointment } = useContext(DoctorContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingId, setLoadingId] = useState(null); // State to track loading
  const appointmentsPerPage = 10;

  // Định dạng ngày
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  // Xử lý xác nhận lịch hẹn
  const handleCompleteAppointment = async (id) => {
    setLoadingId(id);
    try {
      await completeAppointment(id);
    } catch (error) {
      toast.error('Có lỗi xảy ra khi xác nhận lịch hẹn.');
    } finally {
      setLoadingId(null);
    }
  };

  // Xử lý hủy lịch hẹn
  const handleCancelAppointment = async (id) => {
    setLoadingId(id);
    try {
      await cancelAppointment(id);
    } catch (error) {
      toast.error('Có lỗi xảy ra khi hủy lịch hẹn.');
    } finally {
      setLoadingId(null);
    }
  };

  const pendingAppointments = appointments.filter(
    (appointment) => !appointment.isCompleted && !appointment.cancelled && appointment.status === 'pending'
  );

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const page = parseInt(params.get('page')) || 1;
    setCurrentPage(page);
  }, [location.search]);

  useEffect(() => {
    const fetchAppointments = async () => {
      await getAppointments(); // Gọi lại danh sách lịch hẹn
    };

    fetchAppointments(); // Lần đầu tiên khi component mount

    const interval = setInterval(fetchAppointments, 10000); // Lấy lịch hẹn mỗi 30 giây

    return () => clearInterval(interval); // Dọn dẹp interval khi component bị hủy
  }, [getAppointments]);

  const indexOfLastAppointment = currentPage * appointmentsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
  const currentAppointments = pendingAppointments.slice(indexOfFirstAppointment, indexOfLastAppointment);
  const totalPages = Math.ceil(pendingAppointments.length / appointmentsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    navigate(`/confirmation-schedule?page=${pageNumber}`);
  };

  return (
    <div className='w-full max-w-6xl m-5'>
      <p className='mb-4 text-lg font-medium'>Các lịch hẹn chờ xác nhận:</p>
      <div className='bg-white border rounded-xl text-sm max-h-[80vh] min-h-[50vh] overflow-y-auto'>

        {/* Header Row */}
        <div className='hidden md:grid grid-cols-[0.5fr_2fr_2fr_2fr_1fr] gap-4 py-4 px-6 bg-gray-200 border-b text-center'>
          <p className='font-bold text-[16px]'>#</p>
          <p className='font-bold text-[16px]'>Bệnh nhân</p>
          <p className='font-bold text-[16px]'>Ngày khám</p>
          <p className='font-bold text-[16px]'>Ca khám</p>
          <p className='font-bold text-[16px] justify-self-end'>Hành động</p>
        </div>

        {/* Appointment Rows */}
        {currentAppointments.length > 0 ? (
          currentAppointments.map((item, index) => (
            <div
              className='border-b hover:bg-gray-50 p-4 md:p-1'
              key={item._id}
            >
              <div className='md:grid md:grid-cols-[0.5fr_2fr_2fr_2fr_1fr] items-center gap-4'>
                <p className='text-center font-bold md:col-span-1'>{index + 1 + (currentPage - 1) * appointmentsPerPage}</p>

                {/* Mobile-friendly stacking */}
                <div className='flex flex-col gap-1 md:gap-0'>
                  <p className='text-base text-center md:text-center font-medium md:font-normal'>
                    <span className="md:hidden font-semibold">Bệnh nhân: </span>
                    {item.patient_id.user_id.name}
                  </p>
                  <div className='md:hidden'>
                    <p className='text-sm py-2 font-semibold'>Ngày khám: {formatDate(item.work_date)}</p>
                    {/* <p>{formatDate(item.work_date)}</p> */}
                  </div>
                  <div className='md:hidden flex items-center'>
                    <p className='text-sm font-semibold'>Ca khám:</p>
                    <p
                      className={`py-0 ml-1 p-2 md:py-1 rounded-full text-white text-sm text-center max-w-[100px] 
                      ${item.work_shift === "afternoon" ? "bg-orange-300" : "bg-blue-300"} shadow-lg max-w-[70px] w-full`}
                    >
                      {item.work_shift === "morning" ? "Sáng" : "Chiều"}
                    </p>
                  </div>
                </div>

                {/* Desktop-specific layout */}
                <p className='text-base text-center hidden md:block'>
                  {formatDate(item.work_date)}
                </p>

                {/* Updated 'Ca khám' with centered text */}
                <div className='flex justify-center items-center'>
                  <p
                    className={`py-1 rounded-full text-white text-sm text-center max-w-[100px] hidden md:block 
                    ${item.work_shift === "afternoon" ? "bg-orange-300" : "bg-blue-300"} shadow-lg max-w-[100px] w-full`}
                  >
                    {item.work_shift === "morning" ? "Sáng" : "Chiều"}
                  </p>
                </div>


                {/* Action Buttons */}
                <div className='flex flex-row gap-2 md:gap-3 justify-center md:justify-end'>
                  {/* Mobile-friendly text buttons */}
                  <div className="md:hidden flex gap-2 mt-5">
                    <button
                      onClick={() => completeAppointment(item._id)}
                      className='bg-green-500 text-white px-3 py-1 rounded-md shadow-md'
                    >
                      Xác nhận
                    </button>
                    <button
                      onClick={() => cancelAppointment(item._id)}
                      className='bg-red-500 text-white px-3 py-1 rounded-md shadow-md'
                    >
                      Hủy
                    </button>
                  </div>

                  {/* Desktop SVG icons */}
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center gap-3">
                      {loadingId === item._id ? (
                        <div className="w-8 h-8 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <svg
                            onClick={() => handleCompleteAppointment(item._id)}
                            className="w-[30px] h-[30px] cursor-pointer bg-green-500 p-2 rounded-full shadow-lg"
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

                          <svg
                            onClick={() => handleCancelAppointment(item._id)}
                            className="w-[30px] h-[30px] cursor-pointer bg-red-500 p-2 rounded-full shadow-lg"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M18 6L6 18" />
                            <path d="M6 6l12 12" />
                          </svg>
                        </>
                      )}
                    </div>
                  </td>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className='text-gray-500 py-3 px-1 text-center'>Không có lịch hẹn nào chờ được xác nhận.</p>
        )}
      </div>

      {/* Pagination */}
      {pendingAppointments.length > appointmentsPerPage && (
        <div className="flex justify-center mt-4">
          {Array.from({ length: totalPages }, (_, index) => (
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
    </div>
  );
};

export default ConfirmationSchedule;
