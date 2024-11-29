import React, { useContext } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { AdminContext } from './context/AdminContext';
import { DoctorContext } from './context/DoctorContext';
import AddDoctor from './pages/Admin/AddDoctor';
import AddPatient from './pages/Admin/AddPatient';
import AllAppointments from './pages/Admin/AllAppointments';
import Dashboard from './pages/Admin/Dashboard';
import DoctorsList from './pages/Admin/DoctorsList';
import EditPatient from './pages/Admin/EditPatient';
import PatientList from './pages/Admin/PatientList';
import ConfirmationAppointments from './pages/Doctor/ConfirmationAppointments';
import ConfirmCompletedAppointments from './pages/Doctor/ConfirmCompletedAppointments';
import DoctorAppointments from './pages/Doctor/DoctorAppointments';
import DoctorCreateSchedule from './pages/Doctor/DoctorCreateSchedule';
import DoctorDashboard from './pages/Doctor/DoctorDashboard';
import DoctorProfile from './pages/Doctor/DoctorProfile';
import DoctorWorkSchedule from './pages/Doctor/DoctorWorkSchedule';
import EditWorkSchedule from './pages/Doctor/EditWorkSchedule';
import Login from './pages/Login';

const App = () => {

  const { aToken } = useContext(AdminContext)
  const { dToken } = useContext(DoctorContext)

  return aToken || dToken ? (
    <div className='bg-[#F8F9FD]'>
      <ToastContainer />
      <Navbar />
      <div className='flex items-start'>
        <Sidebar />
        <Routes>
          {/* Admin Route */}
          <Route path='/' element={<></>} />
          <Route path='/admin-dashboard' element={<Dashboard />} />
          <Route path='/all-appointments' element={<AllAppointments />} />
          <Route path='/add-doctor' element={<AddDoctor />} />
          <Route path='/doctor-list' element={<DoctorsList />} />
          <Route path="/doctor-list/:speciality" element={<DoctorsList />} />
          <Route path='/patient-list' element={<PatientList />} />
          <Route path='/add-patient' element={<AddPatient />} />
          <Route path='/edit-patient/:id' element={<EditPatient />} />

          {/* Doctor Route */}
          <Route path='/doctor-dashboard' element={<DoctorDashboard />} />
          <Route path='/doctor-appointments' element={<DoctorAppointments />} />
          <Route path='/confirm-completed-appointments' element={<ConfirmCompletedAppointments />} />
          <Route path='/doctor-profile' element={<DoctorProfile />} />
          <Route path='/doctor-work-schedule' element={<DoctorWorkSchedule />} />
          <Route path='/doctor-create-schedule' element={<DoctorCreateSchedule />} />
          <Route path='/confirmation-appointments' element={<ConfirmationAppointments />} />
          <Route path='/edit-work-schedule/:id' element={<EditWorkSchedule />} />
        </Routes>
      </div>
    </div>
  ) : (
    <>
      <Login />
      <ToastContainer />
    </>
  )
}

export default App