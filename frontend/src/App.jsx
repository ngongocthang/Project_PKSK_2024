import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import About from './pages/About'
import AllSchedule from './pages/AllSchedule'
import Appointment from './pages/Appointment'
import Contact from './pages/Contact'
import Doctors from './pages/Doctors'
import Home from './pages/Home'
import Login from './pages/Login'
import MedicalHistory from './pages/MedicalHistory'
import MyAppointments from './pages/MyAppointments'
import MyProfile from './pages/MyProfile'
import Notifications from './pages/Notifications'
import Marquee from "react-fast-marquee";
import ScrollToTopButton from './components/ScrollToTopButton.jsx'

const App = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow mx-4 sm:mx-[10%]">
        <Marquee className="marquee-text py-1 font-medium bg-gray-50">
          Phòng khám mở cửa vào các khung giờ: Sáng 7h30 đến 11h30 và Chiều 13h30 đến 18h00. Xin hãy đến trước 15 phút. Cảm ơn quý khách!
        </Marquee>
        <Navbar />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/doctors' element={<Doctors />} />
          <Route path='/doctors/:speciality' element={<Doctors />} />
          <Route path='/account' element={<Login />} />
          <Route path='/abouts' element={<About />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/notifications' element={<Notifications />} />
          <Route path='/my-profile' element={<MyProfile />} />
          <Route path='/my-appointments' element={<MyAppointments />} />
          <Route path='/appointment/:docId' element={<Appointment />} />
          <Route path='/medical-history' element={<MedicalHistory />} />
          <Route path='/all-schedule' element={<AllSchedule />} />
        </Routes>
      </div>
      <Footer />
      <ScrollToTopButton />
    </div>
  )
}

export default App;
