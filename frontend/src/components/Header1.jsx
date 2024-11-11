import React from 'react';
import Slider from 'react-slick';
import { assets } from '../assets/assets';
import HomepageBanner from '../assets/Homepage-Banner.jpg';
import HomepageBanner3 from '../assets/banner.png';
import HomepageBanner4 from '../assets/banner6.png';
import '../index.css';

const Header1 = () => {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2000,
    };
    

    return (
        <div className='flex justify-center'>
            <div className='rounded-lg px-6 md:px-10 lg:px-20' style={{ width: "115%" }}>
                <Slider {...settings}>
                    <div className='relative' style={{ height: "300px" }}>
                        <img
                            src={HomepageBanner}
                            alt="Homepage Banner"
                            className='absolute inset-0 w-full h-full object-cover z-0 rounded-lg'
                        />
                        <div className='flex flex-col md:flex-row flex-wrap relative z-10'>
                            <div className='md:w-1/2 flex flex-col items-start justify-center gap-4 py-10 md:py-[10vw] ml-8'>
                                <p className='text-3xl md:text-4xl lg:text-5xl text-[#00759c]'>
                                    Đặt lịch hẹn <br /> Với bác sĩ đáng tin cậy
                                </p>
                                <div className='flex flex-col md:flex-row items-start gap-3 text-[#00759c]'>
                                    <img className='w-28 rounded-lg' src={assets.group_profiles} alt="" />
                                    <p>
                                        Với các bác sĩ đáng tin cậy, <br className='hidden sm:block' /> lên lịch cuộc hẹn của bạn một cách dễ dàng.
                                    </p>
                                </div>
                                <a href="#speciality" className='flex items-center gap-2 bg-white px-8 py-3 rounded-full text-[#00759c] text-sm hover:scale-105 transition-all duration-300'>
                                    Đặt lịch hẹn <img className='w-3' src={assets.arrow_icon} alt="" />
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className='relative' style={{ height: "200px" }}>
                        <img
                            src={HomepageBanner3}
                            alt="Homepage Banner3"
                            className='absolute inset-0 w-full h-full object-cover z-0 rounded-lg'
                        />
                        <div className='flex flex-col md:flex-row flex-wrap relative z-10'>
                            <div className='md:w-1/2 flex flex-col items-start justify-center gap-4 py-10 md:py-[10vw] ml-8'>
                                <p className='text-3xl md:text-4xl lg:text-5xl text-[#00759c]'>
                                    Chăm sóc sức khỏe tốt hơn <br /> với đội ngũ chuyên gia
                                </p>
                                <div className='flex flex-col md:flex-row items-start gap-3 text-[#00759c]'>
                                    <img className='w-28 rounded-lg' src={assets.group_profiles} alt="" />
                                    <p>
                                        Đặt lịch với các bác sĩ của chúng tôi <br className='hidden sm:block' /> và nhận sự chăm sóc tốt nhất.
                                    </p>
                                </div>
                                <a href="#speciality" className='flex items-center gap-2 bg-white px-8 py-3 rounded-full text-[#00759c] text-sm hover:scale-105 transition-all duration-300'>
                                    Tìm hiểu thêm <img className='w-3' src={assets.arrow_icon} alt="" />
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className='relative' style={{ height: "200px" }}>
                        <img
                            src={HomepageBanner4}
                            alt="Homepage Banner4"
                            className='absolute inset-0 w-full h-full object-cover z-0 rounded-lg'
                        />
                        <div className='flex flex-col md:flex-row flex-wrap relative z-10'>
                            <div className='md:w-1/2 flex flex-col items-start justify-center gap-4 py-10 md:py-[10vw] ml-8'>
                                <p className='text-3xl md:text-4xl lg:text-5xl text-[#00759c]'>
                                    Công nghệ tiên tiến <br /> cho sức khỏe tốt hơn
                                </p>
                                <div className='flex flex-col md:flex-row items-start gap-3 text-[#00759c]'>
                                    <img className='w-28 rounded-lg' src={assets.group_profiles} alt="" />
                                    <p>
                                        Chúng tôi sử dụng công nghệ hiện đại để <br className='hidden sm:block' /> cung cấp dịch vụ chăm sóc sức khỏe chất lượng cao.
                                    </p>
                                </div>
                                <a href="#services" className='flex items-center gap-2 bg-white px-8 py-3 rounded-full text-[#00759c] text-sm hover:scale-105 transition-all duration-300'>
                                    Tìm hiểu thêm <img className='w-3' src={assets.arrow_icon} alt="" />
                                </a>
                            </div>
                        </div>
                    </div>
                </Slider>
            </div>
        </div>
    );
};

export default Header1;