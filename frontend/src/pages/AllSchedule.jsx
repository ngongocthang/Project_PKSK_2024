import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import viLocale from "@fullcalendar/core/locales/vi"; // Ngôn ngữ tiếng Việt

const DoctorTimeline = () => {
  const [doctors, setDoctors] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await fetch("http://localhost:5000/get-all-schedule-doctor");
        const data = await response.json();

        // Tạo danh sách bác sĩ (resources)
        const resources = data.map((doctor) => ({
          id: doctor.doctorId,
          doctorName: doctor.doctorName,
          doctorImage: doctor.doctorImage,
        }));

        // Xử lý lịch làm việc (events)
        const mappedEvents = data.flatMap((doctor) =>
          doctor.schedules.map((schedule) => {
            const startDate = new Date(schedule.work_date); // Lấy thời gian bắt đầu
            const endDate = new Date(startDate); // Tính thời gian kết thúc
            endDate.setHours(endDate.getHours() + 4); // Cộng thêm 4 tiếng

            return {
              id: schedule._id,
              resourceId: doctor.doctorId,
              title: `Ca: ${schedule.work_shift}`,
              start: startDate.toISOString(),
              end: endDate.toISOString(),
            };
          })
        );

        setDoctors(resources);
        setEvents(mappedEvents);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      }
    };

    fetchSchedules();
  }, []);

  return (
    <div>
      <h1 className="">Lịch Làm Việc Của Bác Sĩ</h1>
      <FullCalendar
        plugins={[resourceTimelinePlugin]}
        initialView="resourceTimelineWeek"
        resources={doctors}
        events={events}
        locale={viLocale} // Cài đặt ngôn ngữ tiếng Việt
        resourceAreaColumns={[
          {
            // Tùy chỉnh hiển thị cột tài nguyên
            headerContent: "Bác sĩ",
            field: "doctorName",
            cellContent: (args) => {
              const { doctorImage, doctorName } = args.resource.extendedProps;
              return (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <img
                    src={doctorImage}
                    alt={doctorName}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      marginRight: 8,
                    }}
                  />
                  {doctorName}
                </div>
              );
            },
          },
        ]}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "resourceTimelineDay,resourceTimelineWeek",
        }}
        slotMinTime="06:00:00" // Thời gian bắt đầu hiển thị
        slotMaxTime="19:00:00" // Thời gian kết thúc hiển thị
        nowIndicator={true} // Hiển thị vạch thời gian hiện tại
      />
    </div>
  );
};

export default DoctorTimeline;
