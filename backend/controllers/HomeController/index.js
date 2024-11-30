const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const RoleUser = require("../../models/User_role"); // Import model RoleUser
const Role = require("../../models/Role"); // Import model Role
const Schedule = require("../../models/Schedule");
const validatePatient = require("../../requests/validatePatient");
const Patient = require("../../models/Patient");
const Doctor = require("../../models/Doctor");
const Appointment = require("../../models/Appointment");
const Payment = require("../../models/Payment");
JWT_SECRET = process.env.JWT_SECRET;

const register = async (req, res) => {
  try {
    // Validate dữ liệu từ client
    const { error } = validatePatient(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Băm mật khẩu
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const patient = await User.create({
      ...req.body,
      password: hashedPassword,
    });

    if (patient) {
      const role = await Role.findOne({ name: "patient" });

      if (!role) {
        return res.status(400).json({ message: "Role 'patient' not found" });
      }

      const roleUser = await RoleUser.create({
        user_id: patient._id,
        role_id: role._id,
      });

      if (!roleUser) {
        return res.status(400).json({ message: "User Role create failed" });
      }

      await Patient.create({
        user_id: patient._id,
      });

      // Trả về thông tin người dùng
      res.status(200).json(patient);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password!" });
    }

    // Lấy danh sách role của người dùng
    const roleUsers = await RoleUser.find({ user_id: user._id }).populate(
      "role_id"
    );
    const userRole = roleUsers.length > 0 ? roleUsers[0].role_id.name : null;

    // Tạo token JWT
    const token = jwt.sign({ id: user._id, role: userRole }, JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.status(200).json({
      message: "Login successful!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: userRole,
        token: token,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const logout = async (req, res) => {
  try {
    // Xóa thông tin người dùng trong session
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out." });
      }
      return res.status(200).json({ message: "Logout successful!" });
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const filter = async (req, res) => {
  try {
    const { doctorId, filterType, specialization } = req.query;
    const now = new Date();
    let startDate, endDate;

    switch (filterType) {
      case "today":
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date(now.setHours(23, 59, 59, 999));
        break;
      case "week":
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        startDate = new Date(startOfWeek.setHours(0, 0, 0, 0));
        endDate = new Date(startOfWeek.setDate(startOfWeek.getDate() + 6));
        endDate = new Date(endDate.setHours(23, 59, 59, 999));
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        endDate = new Date(endDate.setHours(23, 59, 59, 999));
        break;
      default:
        return res.status(400).json({ message: "Invalid filter type" });
    }

    const query = {
      work_date: { $gte: startDate, $lte: endDate },
    };

    if (specialization) {
      query.specialization = specialization;
    }

    const schedules = await Schedule.find(query).sort({ work_date: 1 });

    return res.status(200).json(schedules);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getHistoryAppointment = async (req, res) => {
  try {
    const { id } = req.params;// id user

    const user = await User.findOne({ _id: id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const patient = await Patient.findOne({ user_id: user._id });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const appointments = await Appointment.find({ patient_id: patient._id });
    if (appointments.length === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const detailedHistoryAppointments = [];
    for (const appointment of appointments) {
      const historyEntries = await History_appointment.find({
        appointment_id: appointment._id,
      });

      const doctor = await Doctor.findById(appointment.doctor_id);
      const nameDoctor = await User.findById({ _id: doctor.user_id }).select("name"); 

      for (const history of historyEntries) {
        detailedHistoryAppointments.push({
          history: {
            work_shift: appointment.work_shift,
            work_date: appointment.work_date,
            status: appointment.status,
            doctor_name: nameDoctor ? nameDoctor.name : "Unknown Doctor",
            createdAt: history.createdAt,
            updatedAt: history.updatedAt,
          },
        });
      }
    }

    if (detailedHistoryAppointments.length === 0) {
      return res.status(404).json({ message: "History appointment not found!" });
    }

    // Sort appointments by work_date in descending order
    detailedHistoryAppointments.sort((a, b) => new Date(b.history.updatedAt) - new Date(a.history.updatedAt));

    return res.status(200).json({
      historyAppointments: detailedHistoryAppointments,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

const getdataMoneyDashboardAdmin = async (req, res) => {
  try {
    const payments = await Payment.find({}).populate("appointment_id");
    if (!payments) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Nhóm theo tháng và tính tổng số tiền
    const revenueByMonth = payments.reduce((acc, payment) => {
      const workDate = payment.appointment_id.work_date;
      const month = new Date(workDate).toLocaleString('default', { month: 'long' }); // Lấy tên tháng
      acc[month] = (acc[month] || 0) + payment.amount; // Cộng dồn số tiền
      return acc;
    }, {});

    // Chuyển đổi kết quả thành mảng
    const revenueData = Object.entries(revenueByMonth).map(([month, revenue]) => ({ month, revenue }));

    return res.status(200).json(revenueData);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

 


module.exports = { register, login, logout, filter, getHistoryAppointment, getdataMoneyDashboardAdmin };
