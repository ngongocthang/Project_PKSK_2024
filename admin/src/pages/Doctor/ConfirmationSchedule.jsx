import React, { useContext, useEffect } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import { assets } from '../../assets/assets';

const DoctorAppointments = () => {
  const { dToken, appointments, getAllAppointments } = useContext(DoctorContext);

  useEffect(() => {
    if (dToken) {
      getAllAppointments();
    }
  }, [dToken]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  return (
    <div className='w-full max-w-6xl m-5'>
      <p className='mb-4 text-lg font-medium'>Tất cả lịch hẹn:</p>
      <div className='bg-white border rounded text-sm max-h-[80vh] min-h-[50vh] overflow-y-scroll'>

        {/* Header Row */}
        <div className='max-sm:hidden grid grid-cols-[0.5fr_2fr_1fr_1fr_2fr_auto] gap-4 py-4 px-6 border-b text-center'>
          <p className='font-bold text-[16px]'>#</p>
          <p className='font-bold text-[16px]'>Bệnh nhân</p>
          <p className='font-bold text-[16px]'>Ngày khám</p>
          <p className='font-bold text-[16px]'>Ca khám</p>
          <p className='font-bold text-[16px] justify-self-end'>Trạng thái</p>
        </div>

        {/* Appointment Rows */}
        {appointments.length > 0 ? (
          appointments.reverse().map((item, index) => (
            <div className='grid grid-cols-[0.5fr_2fr_1fr_1fr_2fr_auto] items-center gap-4 py-4 px-6 border-b hover:bg-gray-50' key={item._id}>
              <p className='max-sm:hidden text-center font-bold'>{index + 1}</p>
              <p className='text-base text-center'>{item.patient_id.user_id.name}</p>
              <p className='text-base text-center'>{formatDate(item.work_date)}</p>
              <p className='text-base text-center'>
                {item.work_shift === "morning" && "Buổi sáng"}
                {item.work_shift === "afternoon" && "Buổi chiều"}
              </p>
              <div className='flex gap-3 justify-self-end'>
                {item.status === "pending" && (
                  <button className='bg-green-500 text-white font-semibold py-1 px-4 rounded-full'>Đang chờ</button>
                )}
                {item.status === "confirmed" && (
                  <button className='bg-yellow-400 text-white font-semibold py-1 px-4 rounded-full'>Đã xác nhận</button>
                )}
                {item.status === "canceled" && (
                  <button className='bg-red-500 text-white font-semibold py-1 px-4 rounded-full'>Đã từ chối</button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className='text-gray-500 py-3 text-center'>Không có lịch hẹn nào!</p>
        )}
      </div>
    </div>
  );
};

export default DoctorAppointments;
