import React, { useContext, useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate, useParams } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { DoctorContext } from "../../context/DoctorContext";
import "../../index.css";

const EditWorkSchedule = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getScheduleById, updateSchedule } = useContext(DoctorContext);
  const [scheduleForm, setScheduleForm] = useState({
    workDate: null,
    timeSlot: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSchedule = async () => {
      if (id) {
        const scheduleData = await getScheduleById(id);
        if (scheduleData) {
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
    setLoading(true);
    try {
      const updatedSchedule = {
        work_date: scheduleForm.workDate.toISOString().split("T")[0],
        work_shift: scheduleForm.timeSlot,
      };
      await updateSchedule(id, updatedSchedule);
      navigate("/doctor-work-schedule");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-full mx-auto p-5">
      {/* Giao diện cho Mobile */}
      <div className="block sm:hidden">
        <div className="bg-white p-5 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-5 text-center">
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
                className="p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500 w-[250px]"
              />
            </div>

            {/* Time Slot */}
            <div>
              <label className="block text-gray-700 mb-2">Ca làm việc</label>
              <select
                name="timeSlot"
                value={scheduleForm.timeSlot}
                onChange={handleInputChange}
                required
                className="w-[250px] p-3 border rounded focus:outline-none focus:border-black"
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
              className={`w-full py-3 mt-5 text-white rounded font-semibold flex items-center justify-center ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#219B9D] hover:bg-[#0091a1]"
                }`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="loader border-t-4 border-white w-4 h-4 rounded-full animate-spin mr-2"></div>
                  Đang cập nhật...
                </>
              ) : (
                "Cập nhật Lịch Làm Việc"
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Giao diện cho Desktop */}
      <div className="hidden sm:block">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-5 text-center">
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
                className="p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500 w-[340px]"
              />
            </div>

            {/* Time Slot */}
            <div>
              <label className="block text-gray-700 mb-2">Ca làm việc</label>
              <select
                name="timeSlot"
                value={scheduleForm.timeSlot}
                onChange={handleInputChange}
                required
                className="w-full p-3 border rounded focus:outline-none focus:border-black"
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
              className={`w-full py-3 mt-5 text-white rounded font-semibold flex items-center justify-center ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#219B9D] hover:bg-[#0091a1]"
                }`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="loader border-t-4 border-white w-4 h-4 rounded-full animate-spin mr-2"></div>
                  Đang cập nhật...
                </>
              ) : (
                "Cập nhật Lịch Làm Việc"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditWorkSchedule;