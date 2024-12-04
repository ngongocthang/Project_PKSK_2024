import React, { useContext, useState } from 'react';
import { AdminContext } from '../context/AdminContext';
import { NavLink } from 'react-router-dom';
import { assets } from '../assets/assets';
import { DoctorContext } from '../context/DoctorContext';

const Sidebar = () => {
    const { aToken } = useContext(AdminContext);
    const { dToken } = useContext(DoctorContext);

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <div className="min-h-screen bg-[#3f4d67] border-r relative">
            {/* Mobile Menu Button */}
            <button
                className="block md:hidden px-4 py-2 text-gray-600 bg-gray-200"
                onClick={toggleMobileMenu}
                aria-label="Toggle Sidebar Menu"
            >
                {/* Change icon based on isMobileMenuOpen state */}
                <i
                    className={`fa-solid ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} transform transition-transform duration-300 ease-in-out`}
                    style={{
                        transform: isMobileMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}
                ></i>
            </button>

            {/* Admin Sidebar */}
            {aToken && (
                <ul
                    className={`text-white mt-5 transition-all duration-500 ease-in-out ${
                        isMobileMenuOpen ? 'block' : 'hidden md:block'
                    }`}
                >
                    <NavLink
                        className={({ isActive }) =>
                            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 hover:bg-[#4fc2] cursor-pointer ${isActive ? 'bg-[#4fc2f8] border-r-4 border-primary' : ''}`
                        }
                        to={'/admin-dashboard'}
                    >
                        <img className='filter brightness-0 invert' src={assets.home_icon} alt="" />
                        <p className='hidden md:block'>Tổng quát</p>
                    </NavLink>

                    <NavLink
                        className={({ isActive }) =>
                            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 hover:bg-[#4fc2] cursor-pointer ${isActive ? 'bg-[#4fc2f8] border-r-4 border-primary' : ''}`
                        }
                        to={'/all-appointments'}
                    >
                        <img className='filter brightness-0 invert' src={assets.appointment_icon} alt="" />
                        <p className='hidden md:block'>Cuộc hẹn</p>
                    </NavLink>

                    <NavLink
                        className={({ isActive }) =>
                            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 hover:bg-[#4fc2] cursor-pointer ${isActive ? 'bg-[#4fc2f8] border-r-4 border-primary' : ''}`
                        }
                        to={'/add-doctor'}
                    >
                        <img className='filter brightness-0 invert' src={assets.add_icon} alt="" />
                        <p className='hidden md:block'>Thêm bác sĩ</p>
                    </NavLink>

                    <NavLink
                        className={({ isActive }) =>
                            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 hover:bg-[#4fc2] cursor-pointer ${isActive ? 'bg-[#4fc2f8] border-r-4 border-primary' : ''}`
                        }
                        to={'/doctor-list'}
                    >
                        <img className='filter brightness-0 invert' src={assets.people_icon} alt="" />
                        <p className='hidden md:block'>Danh sách bác sĩ</p>
                    </NavLink>

                    <NavLink
                        className={({ isActive }) =>
                            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 hover:bg-[#4fc2] cursor-pointer ${isActive ? 'bg-[#4fc2f8] border-r-4 border-primary' : ''}`
                        }
                        to={'/patient-list'}
                    >
                        <img className='filter brightness-0 invert' src={assets.people_icon} alt="" />
                        <p className='hidden md:block'>Danh sách bệnh nhân</p>
                    </NavLink>
                </ul>
            )}

            {/* Doctor Sidebar */}
            {dToken && (
                <ul
                    className={`text-white mt-5 transition-all duration-500 ease-in-out ${
                        isMobileMenuOpen ? 'block' : 'hidden md:block'
                    }`}
                >
                    <NavLink
                        className={({ isActive }) =>
                            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 hover:bg-[#4fc2] cursor-pointer ${isActive ? 'bg-[#4fc2f8] border-r-4 border-[#0091a1]' : ''}`
                        }
                        to={'/doctor-dashboard'}
                    >
                        <img className='filter brightness-0 invert' src={assets.home_icon} alt="" />
                        <p className='hidden md:block'>Bảng điều khiển</p>
                    </NavLink>

                    <NavLink
                        className={({ isActive }) =>
                            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 hover:bg-[#4fc2] cursor-pointer ${isActive ? 'bg-[#4fc2f8] border-r-4 border-[#0091a1]' : ''}`
                        }
                        to={'/confirmation-appointments'}
                    >
                        <img className='filter brightness-0 invert w-6 h-[23px]' src={assets.appointments_icon1} alt="" width="24" height="23" />
                        <p className='hidden md:block'>Lịch chờ xác nhận</p>
                    </NavLink>

                    <NavLink
                        className={({ isActive }) =>
                            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 hover:bg-[#4fc2] cursor-pointer ${isActive ? 'bg-[#4fc2f8] border-r-4 border-[#0091a1]' : ''}`
                        }
                        to={'/doctor-appointments'}
                    >
                        <img className='filter brightness-0 invert' src={assets.appointment_icon} alt="" />
                        <p className='hidden md:block'>Lịch hẹn</p>
                    </NavLink>

                    <NavLink
                        className={({ isActive }) =>
                            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 hover:bg-[#4fc2] cursor-pointer ${isActive ? 'bg-[#4fc2f8] border-r-4 border-[#0091a1]' : ''}`
                        }
                        to={'/doctor-work-schedule'}
                    >
                        <img className='filter brightness-0 invert w-6 h-[23px]' src={assets.appointments_icon2} alt="" width="24" height="23" />
                        <p className='hidden md:block'>Lịch làm việc</p>
                    </NavLink>

                    <NavLink
                        className={({ isActive }) =>
                            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 hover:bg-[#4fc2] cursor-pointer ${isActive ? 'bg-[#4fc2f8] border-r-4 border-[#0091a1]' : ''}`
                        }
                        to={'/doctor-profile'}
                    >
                        <img className='filter brightness-0 invert' src={assets.people_icon} alt="" />
                        <p className='hidden md:block'>Hồ sơ của tôi</p>
                    </NavLink>
                </ul>
            )}
        </div>
    );
};

export default Sidebar;