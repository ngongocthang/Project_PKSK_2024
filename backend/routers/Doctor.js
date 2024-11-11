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
  getSpecializations
} = require("../controllers/DoctorController/index");
const upload = require('../helpers/multer-config'); // Import multer config
const {
  getScheduleByDoctor,
  doctorCreateSchedule,
  doctorUpdateSchedule,
  getSchedule
} = require("../controllers/ScheduleController/index");

const userMiddleware = require("../middlewares/index");



// Định nghĩa route
router.post("/create", upload.single('image'), createDoctor);
router.get("/find-all", findAllDoctor);
router.get("/find/:id", findDoctor);
router.put("/update/:id", upload.single('image'), updateDoctor);
router.delete("/delete/:id", deleteDoctor);
router.put("/confirm-appointment/:id", confirmAppointment);
router.get("/appointment", userMiddleware, getDoctorAppointments);
router.get("/schedule/:id", getScheduleByDoctor);
router.get("/get-specializations/:id", getSpecializations);
router.post("/create-schedule/:id", doctorCreateSchedule);
router.get("/find-schedule/:id", getSchedule);
router.put("/update-schedule/:id", doctorUpdateSchedule);


module.exports = router;
