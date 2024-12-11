import React, { useContext, useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { DoctorContext } from '../../context/DoctorContext';

const CreateDoctorSchedule = () => {
  const { getDoctorSpecialization, createSchedule } = useContext(DoctorContext);
  const [scheduleForm, setScheduleForm] = useState({
    workDate: new Date(), // Khởi tạo ngày làm việc là ngày hiện tại
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
      const formattedDate = new Date(scheduleForm.workDate).toLocaleDateString('en-CA');
      const scheduleData = {
        work_date: formattedDate,
        work_shift: scheduleForm.timeSlot,
      };
      await createSchedule(doctorId, scheduleData);

      // Điều hướng về trang lịch làm việc với thông báo thành công
      navigate("/doctor-work-schedule", { state: { successMessage: "Tạo lịch làm việc thành công!" } });
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
    <div className='max-w-full mx-auto p-5'>
      {/* Giao diện cho Mobile */}
      <div className='block sm:hidden'>
        <div className='bg-white p-6 rounded-lg shadow-lg'>
          <h2 className='text-2xl font-semibold mb-5 text-center text-gray-800'>Tạo Lịch Làm Việc của Bác Sĩ</h2>
          <form onSubmit={handleSubmit} className='space-y-5'>
            <div>
              <label className='block text-gray-700 mb-2 text-sm font-medium'>Ngày làm việc</label>
              <DatePicker
                selected={scheduleForm.workDate}
                onChange={handleDateChange}
                dateFormat="dd/MM/yyyy"
                minDate={new Date()}
                className='w-[250px] p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500'
              />
            </div>

            <div>
              <label className='block text-gray-700 mb-2 text-sm font-medium'>Ca làm việc</label>
              <select
                name='timeSlot'
                value={scheduleForm.timeSlot}
                onChange={handleInputChange}
                required
                className='w-[250px] p-3 border rounded focus:outline-none focus:border-black'
              >
                <option value='' disabled>Chọn ca làm việc</option>
                <option value='morning'>Buổi sáng</option>
                <option value='afternoon'>Buổi chiều</option>
              </select>
            </div>

            <button
              type='submit'
              className='w-full py-3 mt-5 bg-[#219B9D] text-white rounded hover:bg-[#0091a1] font-semibold'
            >
              Tạo Lịch Làm Việc
            </button>
          </form>
        </div>
      </div>

      {/* Giao diện cho Desktop */}
      <div className='hidden sm:block'>
        <div className='bg-white p-8 rounded-lg shadow-lg'>
          <h2 className='text-2xl font-semibold mb-5 text-center text-gray-800'>Tạo Lịch Làm Việc của Bác Sĩ</h2>
          <form onSubmit={handleSubmit} className='space-y-5'>
            <div>
              <label className='block text-gray-700 mb-2'>Ngày làm việc</label>
              <DatePicker
                selected={scheduleForm.workDate}
                onChange={handleDateChange}
                dateFormat="dd/MM/yyyy"
                minDate={new Date()}
                className='w-[340px] p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500'
              />
            </div>

            <div>
              <label className='block text-gray-700 mb-2'>Ca làm việc</label>
              <select
                name='timeSlot'
                value={scheduleForm.timeSlot}
                onChange={handleInputChange}
                required
                className='w-full p-3 border rounded focus:outline-none focus:border-black'
              >
                <option value='' disabled>Chọn ca làm việc</option>
                <option value='morning'>Buổi sáng</option>
                <option value='afternoon'>Buổi chiều</option>
              </select>
            </div>

            <button
              type='submit'
              className='w-full py-3 mt-5 bg-[#219B9D] text-white rounded hover:bg-[#0091a1] font-semibold'
            >
              Tạo Lịch Làm Việc
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateDoctorSchedule;