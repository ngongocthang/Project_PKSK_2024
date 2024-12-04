import viLocale from "@fullcalendar/core/locales/vi";
import FullCalendar from "@fullcalendar/react";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AppContext } from "../context/AppContext";
import "../index.css";

const AllSchedule = () => {
  const [doctors, setDoctors] = useState([]);
  const [events, setEvents] = useState([]);
  const { user } = useContext(AppContext);
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [loading, setLoading] = useState(true); // Thêm trạng thái loading
  const patient_id = user?.id || null;
  const token = user?.token || localStorage.getItem("token");

  useEffect(() => {
    const fetchSchedules = async () => {
      setLoading(true); // Bắt đầu loading
      try {
        const response = await fetch("http://localhost:5000/get-all-schedule-doctor");
        if (!response.ok) {
          throw new Error("Không thể tải dữ liệu");
        }
        const data = await response.json();

        const resources = data.map((doctor) => ({
          id: doctor.doctorId,
          doctorName: doctor.doctorName,
          doctorImage: doctor.doctorImage,
          specialization: doctor.specialization,
        }));

        const mappedEvents = data.flatMap((doctor) =>
          doctor.schedules.map((schedule) => {
            const workDate = new Date(schedule.work_date);
            const startDate = new Date(workDate);
            const endDate = new Date(workDate);

            if (schedule.work_shift === "morning") {
              startDate.setHours(7, 30, 0, 0);
              endDate.setHours(11, 30, 0, 0);
            } else if (schedule.work_shift === "afternoon") {
              startDate.setHours(13, 30, 0, 0);
              endDate.setHours(17, 30, 0, 0);
            }

            const converWork_shift =
              schedule.work_shift === "morning" ? "Sáng" : "Chiều";

            return {
              id: schedule._id,
              resourceId: doctor.doctorId,
              title: converWork_shift,
              start: startDate.toISOString(),
              end: endDate.toISOString(),
            };
          })
        );

        setDoctors(resources);
        setEvents(mappedEvents);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        toast.error("Có lỗi xảy ra khi tải lịch làm việc.");
      } finally {
        setLoading(false); // Kết thúc loading
      }
    };

    fetchSchedules();
  }, []);

  const handleEventClick = (info) => {
    if (isToastVisible) {
      return; // Nếu đã có thông báo đang hiển thị, không làm gì cả
    }

    const clickedEvent = info.event;
    const convertTitle = clickedEvent.title === "Sáng" ? "morning" : "afternoon";

    const formatDate = (isoDate) => {
      const [year, month, day] = isoDate.split("-");
      return `${day}/${month}/${year}`;
    };

    const appointmentData = {
      patient_id: patient_id,
      doctor_id: clickedEvent.getResources()[0]?.id || "",
      work_shift: convertTitle,
      work_date: clickedEvent.start.toISOString().split("T")[0],
    };

    const formattedDate = formatDate(appointmentData.work_date);
    setIsToastVisible(true);

    toast.info(
      <div className="flex flex-col items-center justify-center">
        <div className="flex items-center mb-2">
          <p className="font-bold text-lg">Xác nhận</p>
        </div>
        <p>
          Bạn có chắc chắn muốn đặt lịch hẹn vào {formattedDate} ca{" "}
          {clickedEvent.title}?
        </p>
        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={async () => {
              toast.dismiss();
              await confirmBooking(appointmentData);
              setIsToastVisible(false);
            }}
            className="bg-green-500 text-white px-4 py-2 rounded transition duration-300 hover:bg-green-600"
          >
            Xác nhận
          </button>
          <button
            onClick={() => {
              toast.dismiss();
              setIsToastVisible(false);
            }}
            className="bg-gray-300 text-black px-4 py-2 rounded transition duration-300 hover:bg-gray-400"
          >
            Hủy
          </button>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
      }
    );
  };

  const confirmBooking = async (appointmentData) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/create-appointment/${patient_id}`,
        appointmentData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Đặt lịch hẹn thành công!");
    } catch (error) {
      console.error("Lỗi khi đặt lịch hẹn:", error.response?.data?.message);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi đặt lịch hẹn.");
    }
  };

  return (
    <div className="bg-gray-100 min-h-500px">
      <div className="container mx-auto p-4">
        <header className="text-center py-6">
          <h1 className="text-4xl font-bold text-[#0091a1]">
            Lịch Làm Việc Của Bác Sĩ
          </h1>
        </header>
        <div className="bg-white shadow-lg rounded-lg p-6 overflow-auto" style={{ maxHeight: "600px" }}>
          {loading ? ( // Hiển thị thông báo loading
            <div className="text-center py-4">
              <p className="text-gray-500">Đang tải lịch làm việc...</p>
            </div>
          ) : (
            <FullCalendar
              plugins={[resourceTimelinePlugin]}
              initialView="resourceTimelineWeek"
              resources={doctors}
              events={events}
              locale={viLocale}
              resourceAreaColumns={[
                {
                  headerContent: "Bác sĩ",
                  field: "doctorName",
                  cellContent: (args) => {
                    const { doctorImage, doctorName, specialization } = args.resource.extendedProps;
                    return (
                      <div className="flex items-center">
                        <img
                          src={doctorImage}
                          alt={doctorName}
                          className="w-8 h-8 rounded-full mr-2"
                        />
                        {doctorName}  {" "} (Chuyên khoa: {specialization})
                      </div>
                    );
                  },
                },
              ]}
              eventContent={(args) => {
                const workShift = args.event.title;
                return (
                  <div className="flex items-center justify-center w-full h-full">
                    <span>{workShift}</span>
                  </div>
                );
              }}
              headerToolbar={{
                left: "prev today next",
                center: "title",
                right: "resourceTimelineDay,resourceTimelineWeek",
              }}
              slotMinTime="06:00:00"
              slotMaxTime="19:00:00"
              nowIndicator
              eventClick={handleEventClick}
            />
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default AllSchedule;
