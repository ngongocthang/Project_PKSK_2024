import React from "react";
import Marquee from "react-fast-marquee";
import { Route, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import ScrollToTopButton from "./components/ScrollToTopButton";
import About from "./pages/About";
import AllSchedule from "./pages/AllSchedule";
import Appointment from "./pages/Appointment";
import Contact from "./pages/Contact";
import Doctors from "./pages/Doctors";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Home from "./pages/Home";
import Login from "./pages/Login";
import MedicalHistory from "./pages/MedicalHistory";
import MyAppointments from "./pages/MyAppointments";
import MyProfile from "./pages/MyProfile";
import Notifications from "./pages/Notifications";
import ResetPassword from "./pages/ResetPassword.jsx";

const App = () => {
  const token = localStorage.getItem("token");
  console.log(token);
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow mx-4 sm:mx-[10%]">
        <Marquee className="marquee-text py-1 font-medium bg-gray-50">
          Phòng khám mở cửa vào các khung giờ: Sáng 7h30 đến 11h30 và Chiều
          13h30 đến 17h30. Xin hãy đến trước 15 phút. Cảm ơn quý khách!
        </Marquee>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/doctors/:speciality" element={<Doctors />} />
          <Route path="/account" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/abouts" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/notifications" element={token ? <Notifications /> : <Home />}/>
          <Route path="/my-appointments" element={token ? <MyAppointments /> : <Home />}/>
          <Route path="/appointment/:docId" element={<Appointment />} />
          <Route path="/medical-history" element={token ? <MedicalHistory /> : <Home />}/>
          <Route path="/all-schedule" element={<AllSchedule />} />
          <Route path="/my-profile" element={token ? <MyProfile /> : <Home />}/>
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Routes>
      </div>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
};

export default App;
