import AOS from 'aos';
import 'aos/dist/aos.css'; // Import AOS styles
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { convertToSlug } from "../utils/stringUtils";

const VITE_BACKEND_URI = import.meta.env.VITE_BACKEND_URI;

const DoctorCardSkeleton = () => {
  return (
    <div className="border border-indigo-200 rounded-xl overflow-hidden">
      {/* Image placeholder */}
      <div className="relative">
        <div className="h-48 w-48 bg-gray-200 animate-pulse" />
        <div className="absolute top-2 left-2 bg-gray-200 animate-pulse h-6 w-24 rounded-full" />
      </div>

      {/* Content placeholder */}
      <div className="p-4 space-y-3">
        <div className="h-7 bg-gray-200 animate-pulse rounded w-[100%]" />
        <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2" />
        <div className="h-4 bg-gray-200 animate-pulse rounded w-2/3" />
        <div className="flex justify-between items-center">
          <div className="h-4 bg-gray-200 animate-pulse rounded w-1/3" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gray-200 rounded-full animate-pulse" />
            <div className="h-4 bg-gray-200 animate-pulse rounded w-16" />
          </div>
        </div>
      </div>
    </div>
  );
};

const Doctors = () => {
  const { speciality } = useParams();
  const [filterDoc, setFilterDoc] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [specializations, setSpecializations] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [doctorsPerPage] = useState(8);
  const [selectedDate, setSelectedDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    AOS.init({ duration: 900, once: true });
  }, []);

  const fetchDoctors = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${VITE_BACKEND_URI}/doctor/find-all`);
      setDoctors(response.data.success ? response.data.doctors : []);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSpecializations = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${VITE_BACKEND_URI}/specialization/find-all`
      );
      setSpecializations(
        response.data.success ? response.data.specializations : []
      );
    } catch (error) {
      console.error("Error fetching specializations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilter = () => {
    let filtered = speciality
      ? doctors.filter(
        (doc) => convertToSlug(doc.specialization_id?.name) === speciality
      )
      : doctors;

    if (selectedDate) {
      filtered = filtered.filter((doc) =>
        doc.schedules.some(
          (schedule) =>
            new Date(schedule.work_date).toISOString().split("T")[0] ===
            selectedDate
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
  }, [doctors, speciality, selectedDate]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    setCurrentPage(Number(queryParams.get("page")) || 1);
    setSelectedDate(queryParams.get("date") || "");
  }, [location]);

  // Cập nhật URL khi có sự thay đổi
  useEffect(() => {
    const params = new URLSearchParams();

    if (speciality) {
      const formattedSpecialization = convertToSlug(speciality);
      params.append('specialization', formattedSpecialization);
    }

    if (selectedDate) {
      const dateParts = selectedDate.split("-");
      const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`; // Định dạng dd-mm-yyyy
      params.append('date', formattedDate);
    }

    navigate(`?${params.toString()}`, { replace: true });
  }, [speciality, selectedDate, navigate]);

  const totalDoctors = filterDoc.length;
  const totalPages = Math.ceil(totalDoctors / doctorsPerPage);
  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = filterDoc.slice(indexOfFirstDoctor, indexOfLastDoctor);

  const handlePageChange = (page) => {
    setCurrentPage(page);
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
    const delta = 1;
    const paginationItems = [];

    paginationItems.push(
      <button
        key="prev"
        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
        className={`py-1 px-3 border rounded w-[70px] ${currentPage === 1 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "text-gray-600"
          }`}
        disabled={currentPage === 1}
      >
        Trước
      </button>
    );

    paginationItems.push(
      <button
        key={1}
        onClick={() => handlePageChange(1)}
        className={`py-1 px-3 border rounded ${currentPage === 1 ? "bg-indigo-500 text-white" : "text-gray-600"
          }`}
      >
        1
      </button>
    );

    if (currentPage > 2) {
      paginationItems.push(
        <span key="start-dots" className="px-2">
          ...
        </span>
      );
    }

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      paginationItems.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`py-1 px-3 border rounded ${i === currentPage ? "bg-indigo-500 text-white" : "text-gray-600"
            }`}
        >
          {i}
        </button>
      );
    }

    if (currentPage < totalPages - 1) {
      paginationItems.push(
        <span key="end-dots" className="px-2">
          ...
        </span>
      );
    }

    if (totalPages > 1) {
      paginationItems.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={`py-1 px-3 border rounded ${currentPage === totalPages ? "bg-indigo-500 text-white" : "text-gray-600"
            }`}
        >
          {totalPages}
        </button>
      );
    }

    paginationItems.push(
      <button
        key="next"
        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
        className={`py-1 px-3 border rounded w-[70px] ${currentPage === totalPages ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "text-gray-600"
          }`}
        disabled={currentPage === totalPages}
      >
        Tiếp
      </button>
    );

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
      {isLoading ? (
        <div className="flex justify-end items-center h-[80vh] mt-40">
          <div className="flex flex-wrap gap-5">
            {[...Array(8)].map((_, index) => (
              <DoctorCardSkeleton key={index} />
            ))}
          </div>
        </div>
      ) : (
        <div>
          <p className="text-gray-600 font-semibold text-[20px]">Các bác sĩ chuyên khoa.</p>
          <div className="flex flex-col sm:flex-row items-start gap-5 mt-5">
            <button
              className={`py-1 px-3 border rounded text-sm transition-all sm:hidden ${showFilter ? "bg-primary text-white" : ""
                }`}
              onClick={() => setShowFilter((prev) => !prev)}
            >
              Lọc chuyên khoa
            </button>
            <div
              className={`flex-col gap-4 text-[18px] text-gray-600 ${showFilter ? "flex" : "hidden sm:flex"
                }`}
            >
              <h3 className="sm:hidden">Chuyên khoa:</h3>
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
                    }`}
                >
                  <p className="m-0">{spec.name}</p>
                </div>
              ))}
              <h3>Ngày làm việc:</h3>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-[94vw] sm:w-40 border rounded p-2"
              />
            </div>

            <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6" data-aos="fade-up">
              {currentDoctors.map((item, index) => (
                <div
                  onClick={() => navigate(`/appointment/${item._id}`)}
                  className="border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500 relative"
                  key={index}
                >
                  <img className="bg-blue-50" src={item.user_id.image} alt="" />
                  <span className="absolute top-2 left-2 bg-indigo-100 text-indigo-800 text-xs font-semibold px-2 py-1 rounded-full">
                    {item.specialization_id
                      ? item.specialization_id.name
                      : "Chưa có chuyên khoa"}
                  </span>
                  <div className="p-4">
                    {item.available === true ? (
                      <div className="flex items-center gap-2 text-sm text-center text-[#00759c]">
                        <p className="w-2 h-2 bg-[#00759c] rounded-full"></p>
                        <p>Lịch hẹn</p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-center text-[#9c0000]">
                        <p className="w-2 h-2 bg-[#9c0000] rounded-full"></p>
                        <p>Lịch hẹn</p>
                      </div>
                    )}

                    <p className="text-gray-900 text-lg font-medium">
                      {item.user_id.name}
                    </p>
                    <p className="text-gray-900 text-sm truncate">
                      Giá: {item.price ? formatPrice(item.price) : "0"} VND
                    </p>
                    <p className="text-gray-900 text-sm truncate">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {totalPages > 1 && renderPagination()}
        </div>
      )}
    </div>
  );
};

export default Doctors;