import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import React, { useContext, useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { assets } from "../../assets/assets";
import { AdminContext } from "../../context/AdminContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const {
    aToken,
    getDashData,
    getAllPatients,
    getAllDoctors,
    getUpcomingApointmentsDashData,
    countAppointments,
    countPatient,
    dashUpApData,
    doctors,
  } = useContext(AdminContext);

  const [revenueData, setRevenueData] = useState([
    { month: "Tháng 1", revenue: 0 },
    { month: "Tháng 2", revenue: 0 },
    { month: "Tháng 3", revenue: 0 },
    { month: "Tháng 4", revenue: 0 },
    { month: "Tháng 5", revenue: 0 },
    { month: "Tháng 6", revenue: 0 },
    { month: "Tháng 7", revenue: 0 },
    { month: "Tháng 8", revenue: 0 },
    { month: "Tháng 9", revenue: 0 },
    { month: "Tháng 10", revenue: 0 },
    { month: "Tháng 11", revenue: 0 },
    { month: "Tháng 12", revenue: 0 },
  ]);

  // Sử dụng useEffect để gọi API và lấy dữ liệu doanh thu
  useEffect(() => {
    const fetchRevenueData = async () => {
      if (aToken) {
        try {
          const response = await fetch("http://localhost:5000/get-money-dashboard-admin", {
            headers: {
              Authorization: `Bearer ${aToken}`,
            },
          });
          const data = await response.json();

          // Cập nhật doanh thu vào tháng tương ứng
          const updatedRevenueData = revenueData.map((item) => {
            const revenueItem = data.find((d) => d.month === item.month);
            return {
              ...item,
              revenue: revenueItem ? revenueItem.revenue : 0,
            };
          });

          setRevenueData(updatedRevenueData); // Cập nhật dữ liệu doanh thu
        } catch (error) {
          console.error("Error fetching revenue data:", error);
        }
      }
    };

    fetchRevenueData();
    getDashData();
    getAllPatients();
    getAllDoctors();
    getUpcomingApointmentsDashData();
  }, [aToken]);

  // Cấu hình biểu đồ
  const chartData = {
    labels: revenueData.map((item) => item.month),
    datasets: [
      {
        label: "Doanh thu (VND)",
        data: revenueData.map((item) => item.revenue),
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: {
          color: "#4B5563",
          font: {
            size: 10,
            weight: "bold",
          },
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: "#1F2937",
        titleFont: {
          size: 14,
          weight: "bold",
        },
        bodyFont: {
          size: 12,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#4B5563",
          font: {
            size: 12,
          },
        },
      },
      y: {
        grid: {
          color: "#E5E7EB",
          borderDash: [5, 5],
        },
        ticks: {
          color: "#4B5563",
          font: {
            size: 12,
          },
        },
      },
    },
  };

  return (
    <div className="m-5 w-full">
      <div className="flex flex-wrap gap-3">
        {/* Hiển thị số lượng bác sĩ */}
        <div className="relative flex-1 min-w-0 bg-[#4fc2f7] p-4 rounded border-2 cursor-pointer hover:scale-105 transition-all flex items-center justify-center shadow-lg overflow-hidden">
          <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-white opacity-50 rounded-full z-10"></div>
          <div className="absolute top-[60px] right-[-40px] w-16 h-16 bg-white opacity-30 rounded-full z-10"></div>

          <div className="text-center relative z-20">
            <img className="w-14 mx-auto" src={assets.doctor_icon} alt="" />
            <p className="text-xl font-semibold text-white">{doctors.length}</p>
            <p className="text-white text-xl font-semibold">Bác sĩ</p>
          </div>
        </div>

        {/* Hiển thị số lượng lịch hẹn */}
        <div className="relative flex-1 min-w-0 bg-[#32db9d] p-4 rounded border-2 cursor-pointer hover:scale-105 transition-all flex items-center justify-center shadow-lg overflow-hidden">
          <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-white opacity-50 rounded-full z-10"></div>
          <div className="absolute top-[60px] right-[-40px] w-16 h-16 bg-white opacity-30 rounded-full z-10"></div>

          <div className="text-center relative z-20">
            <img className="w-14 mx-auto" src={assets.appointments_icon3} alt="" />
            <p className="text-xl font-semibold text-white">{countAppointments.length}</p>
            <p className="text-white text-xl font-semibold">Lịch hẹn</p>
          </div>
        </div>

        {/* Hiển thị số lượng bệnh nhân */}
        <div className="relative flex-1 min-w-0 bg-[#ff8a66] p-4 rounded border-2 cursor-pointer hover:scale-105 transition-all flex items-center justify-center shadow-lg overflow-hidden">
          <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-white opacity-50 rounded-full z-10"></div>
          <div className="absolute top-[60px] right-[-40px] w-16 h-16 bg-white opacity-30 rounded-full z-10"></div>

          <div className="text-center relative z-20">
            <img className="w-14 mx-auto" src={assets.patients_icon} alt="" />
            <p className="text-xl font-semibold text-white">{countPatient.length}</p>
            <p className="text-white text-xl font-semibold">Bệnh nhân</p>
          </div>
        </div>
      </div>

      <div className="pt-4 mt-10 flex flex-wrap lg:flex-nowrap gap-3 mb-4">
        {/* Cột trái: Biểu đồ doanh thu */}
        <div className="flex-1 bg-white p-4 rounded-lg border-2 border-gray-100 cursor-pointer transition-all duration-300 shadow-lg">
          <div className="flex items-center justify-center min-h-[350px]">
            <Bar data={chartData} options={options} />
          </div>
          <div className="mt-4 text-center text-gray-600">
            <p className="text-sm font-bold">Biểu đồ thể hiện doanh thu hàng tháng trong năm.</p>
          </div>
        </div>

        {/* Cột phải: Hiển thị lịch hẹn sắp tới */}
        <div className="flex-1 bg-white p-4 rounded-lg border-2 border-gray-100 shadow-lg">
          <div className="flex items-center gap-2.5 px-4 py-4 rounded-t bg-gray-50">
            <img src={assets.list_icon} alt="icon" />
            <p className="font-semibold text-gray-800">Lịch hẹn sắp tới</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg overflow-hidden shadow-md">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="py-3 px-4 text-gray-700 font-semibold text-center">Bệnh nhân</th>
                  <th className="py-3 px-4 text-left text-gray-700 font-semibold">Bác sĩ</th>
                  <th className="py-3 px-4 text-left text-gray-700 font-semibold">Ca làm việc</th>
                  <th className="py-3 px-4 text-left text-gray-700 font-semibold">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {dashUpApData &&
                  dashUpApData.map((item, index) => (
                    <tr key={index} className={`hover:bg-gray-50 ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                      <td className="py-4 px-4">
                        <div className="text-sm text-center">
                          <p className="font-medium text-gray-800">{item.patient_id.user_id.name}</p>
                          <p className="text-gray-500 text-xs">Ngày khám: {new Date(item.work_date).toLocaleDateString()}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium text-gray-800 text-sm">{item.doctor_id.user_id.name}</p>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`py-1 px-4 rounded-full text-sm font-medium text-white shadow-md ${item.work_shift === "afternoon" ? "bg-orange-400" : "bg-blue-400"}`}>
                          {item.work_shift === "afternoon" ? "Chiều" : "Sáng"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`py-1 px-4 rounded-full text-sm font-medium text-white shadow-md ${item.status === "confirmed" ? "bg-green-500" : "bg-red-500"}`}>
                          {item.status === "confirmed" ? "Đã xác nhận" : "Chưa xác nhận"}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
