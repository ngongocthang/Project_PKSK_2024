import React, { useContext, useEffect, useState } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import DatePicker from 'react-datepicker';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const CreateDoctorSchedule = () => {
  const { specialzations, getDoctorSpecialization, createSchedule } = useContext(DoctorContext);
  const [scheduleForm, setScheduleForm] = useState({
    workDate: null,
    timeSlot: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const doctorInfo = sessionStorage.getItem("doctorInfo");
    const doctorId = doctorInfo ? JSON.parse(doctorInfo).id : null;
    if (doctorId) {
      getDoctorSpecialization(doctorId);
    }
  }, [getDoctorSpecialization]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const doctorInfo = sessionStorage.getItem("doctorInfo");
    const doctorId = doctorInfo ? JSON.parse(doctorInfo).id : null;

    if (doctorId && scheduleForm.workDate && scheduleForm.timeSlot) {
      const formattedDate = scheduleForm.workDate.toISOString().split('T')[0]; 
      const scheduleData = {
        work_date: formattedDate,
        work_shift: scheduleForm.timeSlot,
      };
      await createSchedule(doctorId, scheduleData);
    } else {
      toast.error("Vui lòng điền đầy đủ thông tin!");
    }
  };

  const handleDateChange = (date) => {
    setScheduleForm({ ...scheduleForm, workDate: date });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setScheduleForm({ ...scheduleForm, [name]: value });
  };

  return (
    <div className='max-w-2xl mx-auto p-5'>
      <div className='bg-white p-8 rounded-lg shadow-lg'>
        <h2 className='text-2xl font-semibold mb-5'>Tạo Lịch Làm Việc của Bác Sĩ</h2>
        <form onSubmit={handleSubmit} className='space-y-5'>

          {/* Specialty */}
          <div>
            <label className='block text-gray-700 mb-2'>Chuyên khoa</label>
            {specialzations.length > 0 ? (
              <p className='w-full p-3 border rounded bg-gray-100 text-gray-700'>
                {specialzations[0].name}
              </p>
            ) : (
              <p className='w-full p-3 border rounded bg-gray-100 text-gray-700'>
                Không có chuyên khoa
              </p>
            )}
          </div>  

          {/* Ngày làm việc */}
          <div>
            <label className='block text-gray-700 mb-2'>Ngày làm việc</label>
            <DatePicker
              selected={scheduleForm.workDate}
              onChange={handleDateChange}
              dateFormat="dd/MM/yyyy"
              className='w-full p-3 border rounded focus:outline-none focus:border-blue-500'
            />
          </div>

          {/* Ca làm việc */}
          <div>
            <label className='block text-gray-700 mb-2'>Ca làm việc</label>
            <select
              name='timeSlot'
              value={scheduleForm.timeSlot}
              onChange={handleInputChange}
              required
              className='w-full p-3 border rounded focus:outline-none focus:border-blue-500'
            >
              <option value='' disabled>Chọn ca làm việc</option>
              <option value='morning'>Buổi sáng</option>
              <option value='afternoon'>Buổi chiều</option>
            </select>
          </div>

          {/* Nút gửi */}
          <button
            type='submit'
            className='w-full py-3 mt-5 bg-[#a2dbde] text-white rounded hover:bg-[#0091a1] font-semibold'
          >
            Tạo Lịch Làm Việc
          </button>
        </form>
      </div>
      {/* Toast container */}
      <ToastContainer />
    </div>
  );
};

export default CreateDoctorSchedule;
