const express = require("express");
const router = express.Router();
const {
  createPatient,
  findAllPatient,
  findPatient,
  updatePatient,
  deletePatient,
  getPatientById,
  countPatient,
  countPatientDashboardDoctor
} = require("../controllers/PatientController/index");

// Định nghĩa route
router.post("/create", createPatient);
router.get("/find-all", findAllPatient);
router.get("/count", countPatient);
router.get("/find/:id", findPatient);
router.put("/update/:id", updatePatient);
router.delete("/delete/:id", deletePatient);
router.get("/get-patient-dashboard/:id", getPatientById);
router.get("/get-patient-dashboard-doctor/:id", countPatientDashboardDoctor);

module.exports = router;
