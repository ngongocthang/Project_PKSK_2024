import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DoctorContext } from "../../context/DoctorContext";

const EditWorkSchedule = () => {
  const { id } = useParams();
  const { getScheduleById, updateSchedule } = useContext(DoctorContext);
  const [schedule, setSchedule] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    workDate: null,
    timeSlot: "",
  });

  useEffect(() => {
    const fetchSchedule = async () => {
      if (id) {
        const scheduleData = await getScheduleById(id);
        if (scheduleData) {
          setSchedule(scheduleData);
          setScheduleForm({
            workDate: new Date(scheduleData.work_date),
            timeSlot: scheduleData.work_shift,
          });
        }
      }
    };
    fetchSchedule();
  }, [id, getScheduleById]);

  const handleDateChange = (date) => {
    setScheduleForm((prevForm) => ({
      ...prevForm,
      workDate: date,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setScheduleForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedSchedule = {
      work_date: scheduleForm.workDate.toISOString().split("T")[0],
      work_shift: scheduleForm.timeSlot,
    };
    await updateSchedule(id, updatedSchedule);
  };

  if (!schedule) return <p>Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto p-5">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-5">
          Chỉnh Sửa Lịch Làm Việc của Bác Sĩ
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Work Date */}
          <div>
            <label className="block text-gray-700 mb-2">Ngày làm việc</label>
            <DatePicker
              selected={scheduleForm.workDate}
              onChange={handleDateChange}
              dateFormat="dd/MM/yyyy"
              minDate={new Date()}
              className="w-full p-3 border rounded focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Time Slot */}
          <div>
            <label className="block text-gray-700 mb-2">Ca làm việc</label>
            <select
              name="timeSlot"
              value={scheduleForm.timeSlot}
              onChange={(e) => setScheduleForm({ ...scheduleForm, timeSlot: e.target.value })}
              required
              className="w-full p-3 border rounded focus:outline-none focus:border-blue-500"
            >
              <option value="" disabled>
                Chọn ca làm việc
              </option>
              <option value="morning">Buổi sáng</option>
              <option value="afternoon">Buổi chiều</option>
            </select>
          </div>
          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 mt-5 bg-blue-500 text-white rounded hover:bg-blue-600 font-semibold"
          >
            Cập nhật Lịch Làm Việc
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditWorkSchedule;
