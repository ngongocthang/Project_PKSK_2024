const express = require("express");
const router = express.Router();
const userMiddleware = require("../middlewares/index");

const {
  findAppointment,
  findAllAppointment,
  updateAppointment,
  deleteAppointment,
  getAllAppointmentAdmin,
  deleteAppointmentByStatus,
  adminUpdateAppointment
} = require("../controllers/AppointmentController/index");

// Định nghĩa route
router.get("/find-all", findAllAppointment);
router.put("/update/:id", userMiddleware, updateAppointment);
router.delete("/delete/:id", deleteAppointment);
router.get("/get-all-admin", getAllAppointmentAdmin);
router.delete("/delete-by-status/:id", deleteAppointmentByStatus);
router.get("/find/:id", findAppointment);
router.put("/admin-update/:id", adminUpdateAppointment);

module.exports = router;
