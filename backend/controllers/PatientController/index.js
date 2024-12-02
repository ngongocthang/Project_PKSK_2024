const bcrypt = require("bcrypt");
const Role = require("../../models/Role");
const User = require("../../models/User");
const UserRole = require("../../models/User_role");
const Doctor = require("../../models/Doctor");
const validatePatient = require("../../requests/validatePatient");
const validateUpdatePatient = require("../../requests/validateUpdatePatientDashboard");
const Patient = require("../../models/Patient");
const Appointment = require("../../models/Appointment");

//{ key: value } là một đtuong trong js, thường dùng để crud
/*
{id} dgl "destructuring assignment" (gán giá trị phân rã) lấy các giá trị
từ đối tượng hoặc mảng và gán chúng vào các biến riêng biệt (cach viet khac id = user.id)
*/
/**
  populate dung de lấy dữ liệu từ các bảng (collections) khác trong MongoDB dựa trên các trường 
 tham chiếu (reference fields)
 */
const createPatient = async (req, res) => {
  try {
    // Validate dữ liệu từ client
    const { error } = validatePatient(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Băm mật khẩu
    const hashedPassword = await bcrypt.hash(req.body.password, 10); // 10 là số vòng băm

    const patient = await User.create({
      ...req.body,
      password: hashedPassword,
    });

    // Kiểm tra xem người dùng có được tạo thành công không
    if (patient) {
      // Tìm ID của vai trò "patient"
      const role = await Role.findOne({ name: "patient" });

      if (!role) {
        return res.status(400).json({ message: "Role 'patient' not found" });
      }

      // Tạo bản ghi trong bảng user_role
      await UserRole.create({ user_id: patient._id, role_id: role._id });

      // Tạo bản ghi trong bảng patient
      await Patient.create({
        user_id: patient._id,
      });

      // Trả về thông tin người dùng
      res.status(200).json({success: true, data: patient});
    }
  } catch (error) {
    return res.status(500).json({success: false, message: error.message });
  }
};

const findAllPatient = async (req, res) => {
  try {
    const patient = await Patient.find({}).populate("user_id");

    if (patient) {
      return res.status(200).json({success: true, data: patient});
    } else {
      return res.status(400).json({ message: "Patient not found." });
    }
  } catch (error) {
    return res.status(500).json({success: true, message: error.message });
  }
};

const countPatient = async (req, res) => {
  try {
    // Tìm tất cả các lịch hẹn có trạng thái 'completed'
    const completedAppointments = await Appointment.find({ status: 'completed' })
      .populate('patient_id'); // Lấy thông tin bệnh nhân từ patient_id

    // Lấy danh sách bệnh nhân từ các lịch hẹn đã hoàn thành
    const patients = completedAppointments.map(appointment => appointment.patient_id);

    // Loại bỏ các bệnh nhân trùng lặp
    const uniquePatients = [...new Map(patients.map(patient => [patient._id, patient])).values()];

    if (uniquePatients.length > 0) {
      return res.status(200).json({ success: true, data: uniquePatients });
    } else {
      return res.status(400).json({ message: "No patients with completed appointments found." });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


const findPatient = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findById(id).populate("user_id");
    if (patient) {
      return res.status(200).json(patient);
    } else {
      return res.status(400).json({ message: "Patient not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Validate dữ liệu từ client
    const { error } = validateUpdatePatient(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Cập nhật thông tin bệnh nhân
    const patientUpdate = await Patient.findByIdAndUpdate(id, req.body, { new: true });

    // Chỉ băm mật khẩu nếu nó được cung cấp
    if (req.body.password) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      await User.findByIdAndUpdate(
        { _id: patient.user_id },
        {
          name: req.body.name,
          email: req.body.email,
          password: hashedPassword,
          phone: req.body.phone,
        }
      );
    } else {
      // Nếu không có mật khẩu mới, chỉ cập nhật các trường khác
      await User.findByIdAndUpdate(
        { _id: patient.user_id },
        {
          name: req.body.name,
          email: req.body.email,
          phone: req.body.phone,
        }
      );
    }

    return res.status(200).json({success: true, data: patientUpdate});
  } catch (error) {
    console.error(error); // Ghi lại lỗi
    return res.status(500).json({success: false, message: error.message });
  }
};


const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findById(id);

    if (!patient) {
      return res.status(404).json({ message: "Patient not found!" });
    }
    // Xóa benh nhan
    await Patient.findByIdAndDelete(id);

    // Xóa info liên quan
    await User.deleteOne({ _id: patient.user_id });
    await UserRole.deleteOne({ user_id: patient.user_id });
    return res.status(200).json({success: true, message: "Delete patient success!" });
  } catch (error) {
    res.status(500).json({success: false, message: error.message });
  }
};

const profilePatient = async (req, res) => {
  try {
    const user_id = req.user.id; // Lấy ID người dùng từ token
    const userInfo  = await User.findById(user_id);


    // Kiểm tra xem userInfo có tồn tại không
    if (!userInfo) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User information retrieved successfully",
      user: userInfo, // Trả về thông tin người dùng
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateProfilePatient = async (req, res) => {
  try {
    const { error } = validateUpdatePatient(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const user_id = req.params.id;
    const { oldPassword, newPassword, name, email, phone } = req.body;

    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại!" });
    }

    // Kiểm tra email chỉ nếu email mới khác với email hiện tại
    if (email !== user.email) {
      const checkEmail = await User.findOne({ email: email });
      if (checkEmail) {
        return res.status(400).json({ message: "Email đã tồn tại!" });
      }
    }

    if (newPassword) {
      const checkNewPassord = await bcrypt.compare(newPassword, user.password);
      if (checkNewPassord) {
        return res.status(400).json({ message: "Mật khẩu mới không được trùng với mật khẩu cũ!" });
      }
      const isOldPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
      if (!isOldPasswordCorrect) {
        return res.status(400).json({ message: "Mật khẩu cũ không chính xác!" });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    // Cập nhật thông tin người dùng
    user.name = name;
    user.email = email;
    user.phone = phone;

    await user.save();

    return res.status(200).json({ success: true, message: "Thông tin đã được cập nhật thành công!", user });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Đã xảy ra lỗi khi cập nhật: " + error.message });
  }
};


const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findById(id).populate("user_id");
    if (patient) {
      return res.status(200).json({success: true, patient});
    } else {
      return res.status(400).json({ message: "Patient not found" });
    }
  } catch (error) {
    return res.status(500).json({success: false, message: error.message });
  }
};

const countPatientDashboardDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findOne({user_id: id});
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    // Tìm tất cả các lịch hẹn có trạng thái 'completed'
    const completedAppointments = await Appointment.find({ doctor_id: doctor._id, status: 'completed' })
      .populate('patient_id'); // Lấy thông tin bệnh nhân từ patient_id

    // Lấy danh sách bệnh nhân từ các lịch hẹn đã hoàn thành
    const patients = completedAppointments.map(appointment => appointment.patient_id);

    // Loại bỏ các bệnh nhân trùng lặp
    const uniquePatients = [...new Map(patients.map(patient => [patient._id, patient])).values()];

    if (uniquePatients.length > 0) {
      return res.status(200).json({ success: true, data: uniquePatients });
    } else {
      return res.status(400).json({ message: "No patients with completed appointments found." });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


module.exports = {
  createPatient,
  countPatient,
  findPatient,
  updatePatient,
  deletePatient,
  profilePatient,
  updateProfilePatient,
  getPatientById,
  findAllPatient,
  countPatientDashboardDoctor
};
