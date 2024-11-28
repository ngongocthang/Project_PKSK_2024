import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DoctorContext } from '../../context/DoctorContext';

const ConfirmationSchedule = () => {
  const { appointments, getAppointments, completeAppointment, cancelAppointment } = useContext(DoctorContext);
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
      toast.success('Lịch hẹn đã được hủy.');
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
    <div className="w-full max-w-6xl m-5 shadow-lg">
      <p className="mb-4 text-lg font-medium">Các lịch hẹn chờ xác nhận:</p>

      <div className="bg-white border rounded text-sm max-h-[80vh] min-h-[50vh] overflow-y-scroll">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200 text-center">
              <th className="py-2 px-4 font-bold text-[16px]">#</th>
              <th className="py-2 px-4 font-bold text-[16px]">Bệnh nhân</th>
              <th className="py-2 px-4 font-bold text-[16px]">Ngày khám</th>
              <th className="py-2 px-4 font-bold text-[16px]">Ca khám</th>
              <th className="py-2 px-4 font-bold text-[16px]">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {currentAppointments.length > 0 ? (
              currentAppointments.map((item, index) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-center font-medium text-[16px]">
                    {index + 1 + (currentPage - 1) * appointmentsPerPage}
                  </td>
                  <td className="py-3 px-4 text-center font-medium text-[16px]">{item.patient_id.user_id.name}</td>
                  <td className="py-3 px-4 text-center font-medium text-[16px]">{formatDate(item.work_date)}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center">
                      <p
                        className={`py-1 px-4 rounded-full text-white text-base font-semibold w-[138px] ${item.work_shift === 'afternoon' ? 'bg-orange-300' : 'bg-blue-300'
                          }`}
                      >
                        {item.work_shift === 'morning' ? 'Sáng' : 'Chiều'}
                      </p>
                    </div>
                  </td>
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
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="py-3 text-center text-gray-500">
                  Không có lịch hẹn nào chờ được xác nhận.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pendingAppointments.length > appointmentsPerPage && (
        <div className="flex justify-center mt-4">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => paginate(index + 1)}
              className={`px-4 py-2 ${currentPage === index + 1 ? 'bg-[#219c9e] text-white' : 'bg-gray-200'} rounded-md mx-1 hover:bg-[#0091a1] hover:text-white`}
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
