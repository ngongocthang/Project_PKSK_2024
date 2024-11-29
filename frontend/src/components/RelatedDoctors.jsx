import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import axios from 'axios';

const RelatedDoctors = ({ speciality, docId }) => {
    const navigate = useNavigate();
    const [relDoc, setRelDocs] = useState([]);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await axios.get('http://localhost:5000/doctor/find-all');
                // Kiểm tra xem dữ liệu có thành công và có mảng doctors không
                if (response.data.success && Array.isArray(response.data.doctors)) {
                    const doctorsData = response.data.doctors;

                    // Lọc bác sĩ theo chuyên ngành và loại bỏ bác sĩ hiện tại
                    const filteredDocs = doctorsData.filter(doc =>
                        doc.specialization_id.name === speciality && doc._id !== docId
                    );
                    setRelDocs(filteredDocs);
                } else {
                    console.error("Invalid data format for doctors");
                    setRelDocs([]); // Thiết lập giá trị mặc định
                }
            } catch (error) {
                console.error('Error fetching doctors:', error);
            }
        };



        fetchDoctors();
    }, [speciality, docId]);

    // Kiểm tra nếu không có bác sĩ nào cùng chuyên ngành
    if (relDoc.length === 0) {
        return null;
    }

    return (
        <div className='flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10'>
            <h1 className='text-3xl font-medium'>Bác sĩ liên quan</h1>
            <p className='sm:w-1/2 text-center'>Chỉ cần duyệt qua danh sách rộng lớn các bác sĩ đáng tin cậy của chúng tôi.</p>
            <div className='w-full grid grid-cols-auto gap-4 pt-5 gap-y-6 px-3 sm:px-0'>
                {relDoc.slice(0, 5).map((item, index) => (
                    <div onClick={() => { navigate(`/appointment/${item._id}`); scrollTo(0, 0); }}
                        className='border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500' key={index}>
                        <div className='relative'>
                            <img className='bg-blue-50' src={item.user_id.image} alt={item.user_id.name} />
                            <span className='absolute top-2 left-2 bg-indigo-100 text-indigo-800 text-xs font-semibold px-2 py-1 rounded-full'>
                                {item.specialization_id.name}
                            </span>
                        </div>
                        <div className='p-4'>
                            <div className='flex items-center gap-2 text-sm text-center text-[#00759c]'>
                                <p className='w-2 h-2 bg-[#00759c] rounded-full'></p><p>Đặt lịch</p>
                            </div>
                            <p className='text-gray-900 text-lg font-medium'>{item.user_id.name}</p>
                            <p className='text-gray-600 text-sm truncate'>{item.description}</p>
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={() => { navigate('/doctors'); scrollTo(0, 0); }} className='bg-blue-50 text-gray-600 px-12 py-3 rounded-full mt-10'>Tất cả</button>
        </div>
    );
}

RelatedDoctors.propTypes = {
    speciality: PropTypes.string.isRequired,
    docId: PropTypes.string.isRequired,
}

export default RelatedDoctors;
