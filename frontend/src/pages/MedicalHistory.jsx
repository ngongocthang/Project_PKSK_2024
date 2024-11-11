import React, { useEffect, useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MedicalHistory = () => {
  const { user } = useContext(AppContext);
  const [medicalRecords, setMedicalRecords] = useState([]);

  const fetchMedicalHistory = async () => {
    const token = user?.token;

    if (!token) {
      toast.error("User not authenticated. Please log in.");
      navigate("/account");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/medical-history/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setMedicalRecords(data.historyAppointments);
      localStorage.setItem("medicalRecords", JSON.stringify(data.historyAppointments));
    } catch (error) {
      console.error("Error fetching medical history:", error);
      toast.error("Có lỗi xảy ra khi tải lịch sử lịch hẹn. Vui lòng thử lại.");
    }
  };

  useEffect(() => {
    // Kiểm tra xem dữ liệu có trong localStorage chưa
    const storedRecords = localStorage.getItem("medicalRecords");
    if (storedRecords) {
      setMedicalRecords(JSON.parse(storedRecords));
    } else {
      fetchMedicalHistory();
    }
  }, [user]);

  return (
    <div className="container mx-auto p-4">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-4">Lịch sử lịch hẹn:</h1>
      {medicalRecords.length === 0 ? (
        <p className="text-center text-gray-500">Chưa có lịch sử lịch hẹn nào.</p>
      ) : (
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-2 px-4 border-b">Bác sĩ</th>
              <th className="py-2 px-4 border-b">Ngày khám</th>
              <th className="py-2 px-4 border-b">Ca khám</th>
            </tr>
          </thead>
          <tbody>
            {medicalRecords.map((record) => (
              <tr key={record.history.id} className="hover:bg-gray-100">
                <td className="py-2 px-4 border-b text-center">{record.history.doctor_name}</td>
                <td className="py-2 px-4 border-b text-center">
                  {new Date(record.history.work_date).toLocaleDateString("vi-VN")}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {record.history.work_shift === "morning" && "Buổi sáng"}
                  {record.history.work_shift === "afternoon" && "Buổi chiều"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MedicalHistory;
