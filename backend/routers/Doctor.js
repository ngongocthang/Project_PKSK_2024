const express = require("express");
const router = express.Router();
const {
  createDoctor,
  findAllDoctor,
  findDoctor,
  updateDoctor,
  deleteDoctor,
  confirmAppointment,
  getDoctorAppointments,
  getSpecializations,
  getProfileDoctor,
  updateProfileDoctor,
  getTopDoctor,
  getAppointmentConfirmByDoctor,
  completeApointment,
  searchPatient,
  sumAmountMoney
} = require("../controllers/DoctorController/index");
const upload = require('../helpers/multer-config');
const {
  getScheduleByDoctorDashboard,
  doctorCreateSchedule,
  doctorUpdateSchedule,
  getSchedule
} = require("../controllers/ScheduleController/index");

const userMiddleware = require("../middlewares/index");



// Định nghĩa route
router.post("/create", upload.single('image'), createDoctor);
router.get("/find-all", findAllDoctor);
router.get("/find-top", getTopDoctor);
router.get("/find/:id", findDoctor);
router.put("/update/:id", upload.single('image'), updateDoctor);
router.delete("/delete/:id", deleteDoctor);
router.put("/confirm-appointment/:id", confirmAppointment);
router.get("/appointment", userMiddleware, getDoctorAppointments);
router.get("/schedule/:id", getScheduleByDoctorDashboard);
router.get("/get-specializations/:id", getSpecializations);
router.post("/create-schedule/:id", doctorCreateSchedule);
router.get("/find-schedule/:id", getSchedule);
router.put("/update-schedule/:id", doctorUpdateSchedule);
router.get("/profile/:id", getProfileDoctor);
router.put("/update-profile/:id",upload.single('image'), updateProfileDoctor);
router.post("/appointment-confirm/:id", getAppointmentConfirmByDoctor);
router.put("/complete-appointment/:id", completeApointment);
router.get("/search", searchPatient);
router.get("/get-amount-dashboard-doctor/:id", sumAmountMoney);


module.exports = router;
