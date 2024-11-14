import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const patients = [
    { id: 1, name: 'Nguyễn Văn A', email: 'thang@gmail.com', password: '12345678', phone: '1234567890' },
    { id: 1, name: 'Nguyễn Văn A', email: 'thang@gmail.com', password: '12345678', phone: '1234567890' },
    { id: 1, name: 'Nguyễn Văn A', email: 'thang@gmail.com', password: '12345678', phone: '1234567890' },
    { id: 1, name: 'Nguyễn Văn A', email: 'thang@gmail.com', password: '12345678', phone: '1234567890' },
    { id: 1, name: 'Nguyễn Văn A', email: 'thang@gmail.com', password: '12345678', phone: '1234567890' },
    { id: 1, name: 'Nguyễn Văn A', email: 'thang@gmail.com', password: '12345678', phone: '1234567890' },
    { id: 1, name: 'Nguyễn Văn A', email: 'thang@gmail.com', password: '12345678', phone: '1234567890' },
    { id: 1, name: 'Nguyễn Văn A', email: 'thang@gmail.com', password: '12345678', phone: '1234567890' },
    { id: 1, name: 'Nguyễn Văn A', email: 'thang@gmail.com', password: '12345678', phone: '1234567890' },
    { id: 1, name: 'Nguyễn Văn A', email: 'thang@gmail.com', password: '12345678', phone: '1234567890' },
    { id: 1, name: 'Nguyễn Văn A', email: 'thang@gmail.com', password: '12345678', phone: '1234567890' },
];

const PatientList = () => {
    const navigate = useNavigate(); 
    const [currentPage, setCurrentPage] = useState(1); 
    const [patientsPerPage] = useState(10); 

    const totalPages = Math.ceil(patients.length / patientsPerPage); 

    const indexOfLastPatient = currentPage * patientsPerPage;
    const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
    const currentPatients = patients.slice(indexOfFirstPatient, indexOfLastPatient);

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        navigate(`/patient-list?page=${pageNumber}`); 
    };

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-3">
                <p className="text-lg font-medium">Tất Cả Bệnh Nhân</p>
                <button
                    onClick={() => navigate("/add-patient")}
                    className="flex items-center px-5 py-3 bg-[#219B9D] text-white text-base rounded hover:bg-[#0091a1]"
                >
                    <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
                    </svg>
                    Tạo Mới
                </button>
            </div>
            <div className="mt-4 overflow-x-auto bg-white p-4 rounded-md shadow-md">
                <table className="min-w-full table-auto bg-white border-collapse">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="py-2 px-4 border-b text-left text-sm font-bold text-[16px]">#</th>
                            <th className="py-2 px-4 border-b text-center text-sm font-bold text-[16px]">Tên Bệnh Nhân</th>
                            <th className="py-2 px-4 border-b text-center text-sm font-bold text-[16px]">Email</th>
                            <th className="py-2 px-4 border-b text-center text-sm font-bold text-[16px]">Số Điện Thoại</th>
                            <th className="py-2 px-4 border-b text-center text-sm font-bold text-[16px]">Mật Khẩu</th>
                            <th className="py-2 px-4 border-b text-left text-sm font-bold text-[16px]">Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentPatients.map((patient, index) => (
                            <tr key={patient.id} className="hover:bg-gray-50">
                                <td className="py-2 px-4 border-b text-sm font-bold">{index + 1}</td>
                                <td className="py-2 px-4 border-b text-center">{patient.name}</td>
                                <td className="py-2 px-4 border-b text-center">{patient.email}</td>
                                <td className="py-2 px-4 border-b text-center">{patient.phone}</td>
                                <td className="py-2 px-4 border-b text-center">{patient.password}</td>
                                <td className="py-2 px-4 border-b text-sm flex gap-2">
                                    {/* Action icons */}
                                    <svg
                                        onClick={() => navigate(`/edit-patient`)}
                                        className="w-8 h-8 cursor-pointer text-blue-500 bg-blue-100 rounded-full p-2 transition-all shadow-lg"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            clipRule="evenodd"
                                            d="M3.99 16.854l-1.314 3.504a.75.75 0 0 0 .966.965l3.503-1.314a3 3 0 0 0 1.068-.687L18.36 9.175s-.354-1.061-1.414-2.122c-1.06-1.06-2.122-1.414-2.122-1.414L4.677 15.786a3 3 0 0 0-.687 1.068zm12.249-12.63l1.383-1.383c.248-.248.579-.406.925-.348.487.08 1.232.322 1.934 1.025.703.703.945 1.447 1.025 1.934.058.346-.1.677-.348.925L19.774 7.76s-.353-1.06-1.414-2.12c-1.06-1.062-2.121-1.415-2.121-1.415z"
                                            fill="#000000"
                                        ></path>
                                    </svg>

                                    <svg
                                        onClick={() => console.log("Delete clicked")}
                                        className="w-8 h-8 cursor-pointer text-red-500 bg-red-100 rounded-full p-2 transition-all shadow-lg"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path
                                            d="M5.755,20.283,4,8H20L18.245,20.283A2,2,0,0,1,16.265,22H7.735A2,2,0,0,1,5.755,20.283ZM21,4H16V3a1,1,0,0,0-1-1H9A1,1,0,0,0,8,3V4H3A1,1,0,0,0,3,6H21a1,1,0,0,0,0-2Z"
                                            fill="#c42121"
                                        ></path>
                                    </svg>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {patients.length > patientsPerPage && (
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
            )}
        </div>
    );
};

export default PatientList;
