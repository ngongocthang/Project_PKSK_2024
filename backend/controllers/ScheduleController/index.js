const Appointment = require("../../models/Appointment");
const Schedule = require("../../models/Schedule");
const Doctor = require("../../models/Doctor");
const validateSchedule = require("../../requests/validateSchedule");

const createSchedule = async (req, res) => {
  try {
    // Validate dữ liệu từ client
    const { error } = validateSchedule(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const schedule = await Schedule.create(req.body);
    if (schedule) {
      return res.status(200).json(schedule);
    }
    return res.status(400).json({ message: "Schedule not found" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const findAllSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.find({});
    if (schedule) {
      return res.status(200).json(schedule);
    }
    return res.status(400).json({ message: "Schedule not found" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const findSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await Schedule.findById(id);
    if (schedule) {
      return res.status(200).json(schedule);
    }
    return res.status(400).json({ message: "Schedule not found" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateSchedule = async (req, res) => {
  try {
    // Validate dữ liệu từ client
    const { error } = validateSchedule(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { id } = req.params;
    const schedule = await Schedule.findByIdAndUpdate(id, req.body);
    if (!schedule) {
      return res.status(400).json({ message: "Schedule not found" });
    }
    const scheduleUpdate = await Schedule.findById(id);
    return res.status(200).json(scheduleUpdate);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await Schedule.findById(id);
    if (!schedule) {
      return res.status(400).json({success: false, message: "Schedule not found" });
    }
    await Schedule.findByIdAndDelete(id);
    return res.status(200).json({success: true, message: "Delete schedule success!" });
  } catch (error) {
    return res.status(500).json({success: false, message: error.message });
  }
};

const getScheduleByDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const today = new Date();

    const doctor = await Doctor.findOne({_id: id});
    if (!doctor) {
      return res.status(400).json({ message: "Doctor not found" }); 
    }
    const schedules = await Schedule.find({
      doctor_id: doctor._id,
      work_date: { $gte: today },
    }).sort({ work_date: 1 });
    if (schedules.length <= 0) {
      return res.status(400).json({ message: "Schedule not found" });
    }
    return res.status(200).json(schedules);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
const getScheduleByDoctorDashboard = async (req, res) => {
  try {
    const { id } = req.params;
    const today = new Date();

    const doctor = await Doctor.findOne({user_id: id});
    if (!doctor) {
      return res.status(400).json({ message: "Doctor not found" }); 
    }
    const schedules = await Schedule.find({
      doctor_id: doctor._id,
      work_date: { $gte: today },
    }).sort({ work_date: 1 });
    if (schedules.length <= 0) {
      return res.status(400).json({ message: "Schedule not found" });
    }
    return res.status(200).json(schedules);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const doctorCreateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findOne({ user_id: id });
    if (!doctor) {
      return res.status(400).json({ message: "Doctor not found" });
    } 
    const schedule = await Schedule.create({
      ...req.body,
      doctor_id: doctor._id});
    if (schedule) {
      return res.status(200).json({ success: true, schedule});
    }
    return res.status(400).json({ success: false, message: "Schedule not found" });
    } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await Schedule.findById(id);
    if (!schedule) {
      return res.status(400).json({success: false, message: "Schedule not found" });
    }
    return res.status(200).json({success: true, schedule});
  } catch (error) {
    return res.status(500).json({success: false, message: error.message });
  }
};
const doctorUpdateSchedule = async (req, res) => {
  try { 
    const { id } = req.params;
    const user_id = req.body.id;
    const doctor = await Doctor.findOne({ user_id: user_id });
    if (!doctor) {
      return res.status(400).json({ message: "Doctor not found" });
    }
    const schedule = await Schedule.findByIdAndUpdate(id, {...req.body, doctor_id: doctor._id}, { new: true });
    if (!schedule) {
      return res.status(400).json({success: false, message: "Schedule not found" });
    }
    return res.status(200).json({success: true, schedule});
  } catch (error) {
    return res.status(500).json({success: false, message: error.message });
  }
};


module.exports = {
  createSchedule,
  findAllSchedule,
  findSchedule,
  updateSchedule,
  deleteSchedule,
  getScheduleByDoctor,
  doctorCreateSchedule,
  doctorUpdateSchedule,
  getSchedule,
  getScheduleByDoctorDashboard
};