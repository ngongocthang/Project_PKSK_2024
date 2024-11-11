import React, { useContext, useEffect } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import { assets } from '../../assets/assets';

const DoctorAppointments = () => {
  const { dToken, appointments, getAppointments, completeAppointment, cancelAppointment } = useContext(DoctorContext);

  useEffect(() => {
    if (dToken) {
      getAppointments();
    }
  }, [dToken]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  // Lọc các lịch hẹn chưa hoàn tất hoặc bị hủy
  const pendingAppointments = appointments.filter(
    (appointment) => !appointment.isCompleted && !appointment.cancelled && appointment.status === "pending"
  );

  return (
    <div className='w-full max-w-6xl m-5'>
      <p className='mb-4 text-lg font-medium'>Các lịch hẹn chờ xác nhận:</p>
      <div className='bg-white border rounded text-sm max-h-[80vh] min-h-[50vh] overflow-y-scroll'>

        {/* Header Row */}
        <div className='max-sm:hidden grid grid-cols-[0.5fr_2fr_1fr_1fr_2fr_auto] gap-4 py-4 px-6 border-b text-center'>
          <p className='font-bold text-[16px]'>#</p>
          <p className='font-bold text-[16px]'>Bệnh nhân</p>
          <p className='font-bold text-[16px]'>Ngày khám</p>
          <p className='font-bold text-[16px]'>Ca khám</p>
          <p className='font-bold text-[16px] justify-self-end'>Hành động</p>
        </div>

        {/* Appointment Rows */}
        {pendingAppointments.length > 0 ? (
          pendingAppointments.reverse().map((item, index) => (
            <div className='grid grid-cols-[0.5fr_2fr_1fr_1fr_2fr_auto] items-center gap-4 py-4 px-6 border-b hover:bg-gray-50' key={item._id}>
              <p className='max-sm:hidden text-center font-bold'>{index + 1}</p>
              <p className='text-base text-center'>{item.patient_id.user_id.name}</p>
              <p className='text-base text-center'>{formatDate(item.work_date)}</p>
              <p className='text-base text-center'>
                {item.work_shift === "morning" && "Buổi sáng"}
                {item.work_shift === "afternoon" && "Buổi chiều"}
              </p>
              <div className='flex gap-3 justify-self-end'>
                <img onClick={() => cancelAppointment(item._id)} className='w-[30px] h-[30px] cursor-pointer'src={assets.cancel_icon}alt="Cancel"/>
                <img onClick={() => completeAppointment(item._id)} className='w-[30px] h-[30px] cursor-pointer'src={assets.checkmark_icon} alt="Complete"/>
              </div>
            </div>
          ))
        ) : (
          <p className='text-gray-500 py-3 text-center'>Không có lịch hẹn nào chờ được xác nhận.</p>
        )}
      </div>
    </div>
  );
};

export default DoctorAppointments;


DoctorAppointments
