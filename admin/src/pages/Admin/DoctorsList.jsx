import React, { useContext, useEffect, useState } from 'react';
import { AdminContext } from '../../context/AdminContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
import { convertToSlug } from "../../utils/stringUtils";

const DoctorsList = () => {
  const { doctors, aToken, getAllDoctors } = useContext(AdminContext);
  const [confirmToastId, setConfirmToastId] = useState(null);
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [specializations, setSpecializations] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const doctorsPerPage = 8;

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Xử lý lấy tham số page từ URL để giữ trang hiện tại
    const queryParams = new URLSearchParams(location.search);
    const page = queryParams.get('page');
    if (page) {
      setCurrentPage(Number(page));
    }
    if (aToken) {
      getAllDoctors();
      fetchSpecializations();
    }
  }, [aToken, location.search]);

  const fetchSpecializations = async () => {
    try {
      const response = await axios.get('http://localhost:5000/specialization/find-all');
      if (response.data.success && Array.isArray(response.data.specializations)) {
        setSpecializations(response.data.specializations);
      } else {
        toast.error("Dữ liệu chuyên khoa không hợp lệ.");
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi lấy danh sách chuyên khoa.");
    }
  };

  const deleteDoctor = async (id, name) => {
    if (confirmToastId) {
      toast.dismiss(confirmToastId);
    }

    const newToastId = toast(
      <div>
        <p className="mb-2 font-bold text-lg text-center">Bạn có chắc chắn muốn xóa bác sĩ <strong className="text-red-600">{name}</strong> này không?</p>
        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={() => {
              confirmDeleteDoctor(id);
              toast.dismiss(newToastId);
            }}
            className="bg-red-500 text-white px-3 py-1 rounded"
          >
            Xác nhận
          </button>
          <button
            onClick={() => toast.dismiss(newToastId)}
            className="bg-gray-300 text-gray-800 px-3 py-1 rounded"
          >
            Hủy bỏ
          </button>
        </div>
      </div>,
      {
        autoClose: true,
        closeOnClick: false,
        position: "top-center",
        className: "custom-toast"
      }
    );

    setConfirmToastId(newToastId);
  };

  const confirmDeleteDoctor = async (id) => {
    try {
      const response = await axios.delete(`http://localhost:5000/doctor/delete/${id}`, {
        headers: {
          'Authorization': `Bearer ${aToken}`,
        },
      });

      if (response.data.success) {
        toast.success(`Đã xóa bác sĩ thành công!`);
        getAllDoctors();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi xóa bác sĩ.");
    }
  };

  // Pagination logic
  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;

  // Lọc danh sách bác sĩ theo chuyên khoa đã chọn
  const filteredDoctors = selectedSpecialization
    ? doctors.filter(doctor => doctor.specialization_id.name === selectedSpecialization)
    : doctors;

  const currentDoctors = filteredDoctors.slice(indexOfFirstDoctor, indexOfLastDoctor);
  const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Cập nhật URL mà không cần tham số ?page
    navigate(`/doctor-list${selectedSpecialization ? `/${convertToSlug(selectedSpecialization)}` : ''}`);
  };

  const formatPrice = (price) => {
    if (isNaN(price)) return price;
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  return (
    <div className='m-5 max-h-[90vh] overflow-y-scroll'>
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <h1 className='md:text-3xl text-xl font-bold text-[#0091a1] text-center md:text-left mb-4 md:mb-0'>
          Tất cả bác sĩ
        </h1>
        <div className="flex items-center shadow-lg w-full md:w-auto">
          <select
            value={selectedSpecialization}
            onChange={(e) => {
              setSelectedSpecialization(e.target.value);
              // Cập nhật URL khi người dùng chọn chuyên khoa, nhưng không có tham số page
              navigate(`/doctor-list${e.target.value ? `/${convertToSlug(e.target.value)}` : ''}`);
            }}
            className="px-5 py-3 rounded-lg bg-white text-gray-800 border border-gray-300 transition-all duration-300 shadow-non focus:outline-none hover:border-blue-400 w-full md:w-auto"
          >
            <option value="" className="text-gray-500">Chọn chuyên khoa</option>
            {Array.isArray(specializations) && specializations.map(spec => (
              <option key={spec._id} value={spec.name} className="text-gray-700">{spec.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className='w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-5'>
        {currentDoctors.map((item) => (
          <div
            className='border border-indigo-200 rounded-xl overflow-hidden cursor-pointer group relative'
            key={item.user_id._id}
          >
            <div className='relative h-[360px]'>
              <img
                className='bg-indigo-50 group-hover:bg-primary transition-all duration-500'
                src={item.user_id.image}
                alt="Doctor"
              />

              <span className='absolute top-2 left-2 bg-indigo-100 text-indigo-800 text-xs font-semibold px-2 py-1 rounded-full'>
                {item.specialization_id.name}
              </span>

              <div className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                <button
                  className='bg-red-500 text-white p-2 rounded-full transition duration-200 ease-in-out hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300'
                  onClick={() => deleteDoctor(item.user_id._id, item.user_id.name)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3h6m2 0a1 1 0 011 1v1H6V4a1 1 0 011-1h10zM4 7h16M10 11v6m4-6v6M5 7h14l-1.68 14.14A2 2 0 0115.33 23H8.67a2 2 0 01-1.99-1.86L5 7z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className='p-4'>
              <p className='text-neutral-800 text-lg font-medium'>Bs. {item.user_id.name}</p>
              <p className='text-zinc-600 text-sm'>Giá: {formatPrice(item.price)} (VND)</p>
              <p className='text-zinc-600 text-sm'>SĐT: {item.user_id.phone}</p>
              <p className='text-zinc-600 text-sm truncate'>Email: {item.user_id.email}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {filteredDoctors.length > doctorsPerPage && (
        <div className="flex justify-center gap-4 mt-4">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => paginate(index + 1)}
              className={`px-4 py-2 rounded-md ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorsList;
