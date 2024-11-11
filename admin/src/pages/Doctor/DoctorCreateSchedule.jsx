import React, { useContext, useEffect, useState } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import DatePicker from 'react-datepicker';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const CreateDoctorSchedule = () => {
  const { getDoctorSpecialization, createSchedule } = useContext(DoctorContext);
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
      // Chuyển đổi ngày về định dạng YYYY-MM-DD
      const formattedDate = new Date(scheduleForm.workDate).toLocaleDateString('en-CA'); // 'en-CA' cho định dạng YYYY-MM-DD
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
          <div>
            <label className='block text-gray-700 mb-2'>Ngày làm việc</label>
            <DatePicker
              selected={scheduleForm.workDate}
              onChange={handleDateChange}
              dateFormat="dd/MM/yyyy"
              minDate={new Date()} // Set minimum date to today
              className='w-full p-3 border rounded focus:outline-none focus:border-blue-500'
            />
          </div>

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

          <button
            type='submit'
            className='w-full py-3 mt-5 bg-[#a2dbde] text-white rounded hover:bg-[#0091a1] font-semibold'
          >
            Tạo Lịch Làm Việc
          </button>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default CreateDoctorSchedule;