const express = require("express");
const router = express.Router();
const {
  createDoctor,
  findAllDoctor,
  findDoctor,
  updateDoctor,
  deleteDoctor,
  confirmAppointment
} = require("../controllers/DoctorController/index");
const upload = require('../helpers/multer-config'); // Import multer config

// Định nghĩa route
router.post("/create", upload.single('image'), createDoctor);
router.get("/find-all", findAllDoctor);
router.get("/find/:id", findDoctor);
router.put("/update/:id", upload.single('image'), updateDoctor);
router.delete("/delete/:id", deleteDoctor);
router.put("/confirm-appointment/:id", confirmAppointment);

module.exports = router;
