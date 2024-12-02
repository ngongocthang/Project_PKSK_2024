import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { convertToSlug } from "../utils/stringUtils";

const Doctors = () => {
  const { speciality } = useParams();
  const [filterDoc, setFilterDoc] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [specializations, setSpecializations] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [doctorsPerPage] = useState(8);
  const [selectedDate, setSelectedDate] = useState(""); // Thêm trạng thái cho ngày làm việc
  const navigate = useNavigate();
  const location = useLocation();

  const fetchDoctors = async () => {
    try {
      const response = await axios.get("http://localhost:5000/doctor/find-all");
      setDoctors(response.data.success ? response.data.doctors : []);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  const fetchSpecializations = async () => {
    try {
      const response = await axios.get("http://localhost:5000/specialization/find-all");
      setSpecializations(response.data.success ? response.data.specializations : []);
    } catch (error) {
      console.error("Error fetching specializations:", error);
    }
  };

  const applyFilter = () => {
    let filtered = speciality
      ? doctors.filter(
          (doc) => convertToSlug(doc.specialization_id?.name) === speciality
        )
      : doctors;

    // Lọc theo ngày làm việc
    if (selectedDate) {
      filtered = filtered.filter((doc) =>
        doc.schedules.some(schedule => 
          new Date(schedule.work_date).toISOString().split('T')[0] === selectedDate
        )
      );
    }

    setFilterDoc(filtered);
  };

  useEffect(() => {
    fetchDoctors();
    fetchSpecializations();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [doctors, speciality, selectedDate]); // Cập nhật khi selectedDate thay đổi

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    setCurrentPage(Number(queryParams.get("page")) || 1);
    setSelectedDate(queryParams.get("date") || ""); // Lấy giá trị ngày từ URL
  }, [location]);

  const totalDoctors = filterDoc.length;
  const totalPages = Math.ceil(totalDoctors / doctorsPerPage);
  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = filterDoc.slice(indexOfFirstDoctor, indexOfLastDoctor);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const queryParams = new URLSearchParams(location.search);
    queryParams.set("page", page);
    queryParams.set("date", selectedDate); // Thêm giá trị ngày vào URL
    navigate(
      `/doctors${speciality ? `/${speciality}` : ""}?${queryParams.toString()}`,
      { replace: true }
    );
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    const queryParams = new URLSearchParams(location.search);
    queryParams.set("date", date); // Cập nhật giá trị ngày trong URL
    queryParams.set("page", 1); // Đặt lại trang về 1 khi thay đổi ngày
    navigate(
      `/doctors${speciality ? `/${speciality}` : ""}?${queryParams.toString()}`,
      { replace: true }
    );
  };

  const renderPagination = () => {
    const paginationItems = [];
    const delta = 2;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        paginationItems.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`py-1 px-3 border rounded ${i === currentPage ? "bg-indigo-500 text-white" : "text-gray-600"}`}
          >
            {i}
          </button>
        );
      } else if (
        (i === currentPage - delta - 1 && currentPage > delta + 2) ||
        (i === currentPage + delta + 1 && currentPage < totalPages - delta - 1)
      ) {
        paginationItems.push(<span key={i} className="px-2">...</span>);
      }
    }

    return (
      <div className="flex justify-center items-center mt-6 space-x-2">
        {paginationItems}
      </div>
    );
  };

  const formatPrice = (price) => {
    if (isNaN(price)) return price; 
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  return (
    <div>
      <p className="text-gray-600 text-[20px]">Các bác sĩ chuyên khoa.</p>
      <div className="flex flex-col sm:flex-row items-start gap-5 mt-5">
        <button className={`py-1 px-3 border rounded text-sm transition-all sm:hidden ${showFilter ? "bg-primary text-white" : ""}`} onClick={() => setShowFilter((prev) => !prev)}>
          Filters
        </button>
        <div className={`flex-col gap-4 text-[18px] text-gray-600 ${showFilter ? "flex" : "hidden sm:flex"}`}>
          <h3>Chuyên khoa:</h3>
          {specializations.map((spec) => (
            <div
              key={spec._id}
              onClick={() =>
                speciality === convertToSlug(spec.name)
                  ? navigate("/doctors")
                  : navigate(`/doctors/${convertToSlug(spec.name)}`)
              }
              className={`w-[94vw] sm:w-40 pl-3 py-1.5 border border-gray-300 rounded transition-all cursor-pointer ${speciality === convertToSlug(spec.name)
                  ? "bg-[#e0f4fb] text-[#00759c]"
                  : ""
                }`}>
              <p className="m-0">{spec.name}</p>
            </div>
          ))}
          {/* Thêm phần chọn ngày */}
          <h3>Ngày làm việc:</h3>
          <input 
            type="date" 
            value={selectedDate} // Đặt giá trị cho ô nhập ngày
            onChange={(e) => handleDateChange(e.target.value)} // Gọi hàm cập nhật ngày
            className="w-[94vw] sm:w-40 border rounded p-2"
          />
        </div>

        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6">
          {currentDoctors.map((item, index) => (
            <div
              onClick={() => navigate(`/appointment/${item._id}`)}
              className="border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500 relative"
              key={index}>
              <img className="bg-blue-50" src={item.user_id.image} alt="" />
              <span className="absolute top-2 left-2 bg-indigo-100 text-indigo-800 text-xs font-semibold px-2 py-1 rounded-full">
                {item.specialization_id ? item.specialization_id.name : "Chưa có chuyên khoa"}
              </span>
              <div className="p-4">
                <div className="flex items-center gap-2 text-sm text-center text-[#00759c]">
                  <p className="w-2 h-2 bg-[#00759c] rounded-full"></p>
                  <p>Đặt lịch</p>
                </div>
                <p className="text-gray-900 text-lg font-medium">{item.user_id.name}</p>
                <p className="text-gray-900 text-sm truncate">Giá: {formatPrice(item.price)} VND</p>
                <p className="text-gray-900 text-sm truncate">{item.description}</p>
              </div>
            </div>
          ))} 
        </div>
      </div>
      {totalPages > 1 && renderPagination()}
    </div>
  );
};

export default Doctors;
