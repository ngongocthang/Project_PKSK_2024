import React, { useContext, useEffect, useState } from 'react';
import { AdminContext } from '../../context/AdminContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';

const DoctorsList = () => {
  const { doctors, aToken, getAllDoctors } = useContext(AdminContext);
  const [confirmToastId, setConfirmToastId] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const doctorsPerPage = 8;

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Parse the page query parameter from the URL
    const queryParams = new URLSearchParams(location.search);
    const page = queryParams.get('page');
    if (page) {
      setCurrentPage(Number(page));
    }
    if (aToken) {
      getAllDoctors();
    }
  }, [aToken, location.search]);

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
        toast.success(`Đã xóa bác sĩ ${name} thành công!`);
        getAllDoctors();

        if (currentDoctors.length === 1 && currentPage > 1) {
          navigate('/doctor-list?page=1');
        }
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error deleting doctor:", error);
      toast.error("Đã xảy ra lỗi khi xóa bác sĩ.");
    }
  };

  // Pagination logic
  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = doctors.slice(indexOfFirstDoctor, indexOfLastDoctor);

  // Handle page change and update the URL
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    navigate(`/doctor-list?page=${pageNumber}`);
  };

  const totalPages = Math.ceil(doctors.length / doctorsPerPage);

  return (
    <div className='m-5 max-h-[90vh] overflow-y-scroll'>
      <h1 className='text-3xl font-bold text-[#0091a1]'>Tất cả bác sĩ</h1>
      <div className='w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-5'>
        {currentDoctors.map((item, index) => (
          <div
            className='border border-indigo-200 rounded-xl overflow-hidden cursor-pointer group relative'
            key={index}
          >
            <div className='relative'>
              <img
                className='bg-indigo-50 group-hover:bg-primary transition-all duration-500'
                src={item.user_id.image}
                alt=""
              />

              <span className='absolute top-2 left-2 bg-indigo-100 text-indigo-800 text-xs font-semibold px-2 py-1 rounded-full'>
                {item.specialization_id.name}
              </span>

              {/* Delete icon on the image */}
              <div
                className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300'
              >
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
              <p className='text-zinc-600 text-sm'>SĐT: {item.user_id.phone}</p>
              <p className='text-zinc-600 text-sm'>Email: {item.user_id.email}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center gap-4 mt-4">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            onClick={() => paginate(index + 1)}
            className={`px-4 py-2 rounded-md ${currentPage === index + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DoctorsList;
