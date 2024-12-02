const bcrypt = require("bcrypt");
const Role = require("../../models/Role");
const User = require("../../models/User");
const UserRole = require("../../models/User_role");
const Doctor = require("../../models/Doctor");
const Patient = require("../../models/Patient");
const Payment = require("../../models/Payment");
const cloudinary = require("cloudinary").v2;
const validateDoctor = require("../../requests/validateDoctor");
const Appointment = require("../../models/Appointment");
const Notification = require("../../models/Notification");
const Schedule = require("../../models/Schedule");
const validateUpdateDoctor = require("../../requests/validateUpdateProfileDoctor");
const transporter = require("../../helpers/mailer-config");
const moment = require("moment");
require("moment/locale/vi");

//{ key: value } là một đtuong trong js, thường dùng để crud
/*
{id} dgl "destructuring assignment" (gán giá trị phân rã) lấy các giá trị
từ đối tượng hoặc mảng và gán chúng vào các biến riêng biệt (cach viet khac id = user.id)
*/
/**
  populate dung de lấy dữ liệu từ các bảng (collections) khác trong MongoDB dựa trên các trường 
 tham chiếu (reference fields)
 */
//...req.body: Đây là cú pháp spread operator

const createDoctor = async (req, res) => {
  try {
    const { error } = validateDoctor(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    //check email
    const checkEmail = await User.findOne({ email: req.body.email });
    if (checkEmail) {
      return res.status(400).json({ message: "Email đã tồn tại!" });
    }

    let imageUrl = null;
    if (req.file) {
      // Chuyển đổi buffer của file thành chuỗi Base64 để upload
      const base64Image = `data:${
        req.file.mimetype
      };base64,${req.file.buffer.toString("base64")}`;

      const result = await cloudinary.uploader.upload(base64Image, {
        folder: "doctor",
      });

      imageUrl = result.secure_url;
    }

    const doctor = await User.create({
      ...req.body,
      password: hashedPassword,
      image: imageUrl,
    });

    if (doctor) {
      const role = await Role.findOne({ name: "doctor" });
      if (!role)
        return res.status(400).json({ message: "Role 'doctor' not found" });

      await UserRole.create({ user_id: doctor._id, role_id: role._id });
      await Doctor.create({
        user_id: doctor._id,
        specialization_id: req.body.specialization_id,
        description: req.body.description,
        price: req.body.price,
      });

      res.status(200).json({ success: true, doctor });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// const findAllDoctor = async (req, res) => {
//   try {
//     const doctors = await Doctor.find({})
//       .populate("user_id")
//       .populate("specialization_id");

//     if (doctors) {
//       return res.status(200).json({ success: true, doctors });
//     } else {
//       return res
//         .status(404)
//         .json({ success: false, message: "Doctors not found." });
//     }
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };
const findAllDoctor = async (req, res) => {
  try {
    // Lấy danh sách bác sĩ
    const doctors = await Doctor.find({})
      .populate("user_id")
      .populate("specialization_id");

    // Lấy lịch làm việc cho tất cả bác sĩ
    const schedules = await Schedule.find({
      doctor_id: { $in: doctors.map(doctor => doctor._id) }
    });

    // Ghép lịch làm việc vào thông tin bác sĩ
    const doctorsWithSchedules = doctors.map(doctor => {
      const doctorSchedules = schedules.filter(schedule => 
        schedule.doctor_id.toString() === doctor._id.toString()
      ).map(schedule => ({
        work_date: schedule.work_date,
        work_shift: schedule.work_shift
      }));

      return {
        ...doctor.toObject(), // Chuyển đổi bác sĩ thành đối tượng đơn giản
        schedules: doctorSchedules // Thêm lịch làm việc vào bác sĩ
      };
    });

    return res.status(200).json({ success: true, doctors: doctorsWithSchedules });
    
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


const findDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findById(id)
      .populate("user_id")
      .populate("specialization_id");
    if (doctor) {
      return res.status(200).json(doctor);
    } else {
      return res.status(404).json({ message: "Doctor not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateDoctor = async (req, res) => {
  try {
    console.log(req.body);
    const { id } = req.params;
    const doctor = await Doctor.findById(id).populate("user_id");

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Validate
    const { error } = validateDoctor(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    let hashedPassword = doctor.user_id.password;
    if (req.body.password) {
      hashedPassword = await bcrypt.hash(req.body.password, 10);
    }

    let imageUrl = doctor.user_id.image;

    if (req.file) {
      const base64Image = `data:${
        req.file.mimetype
      };base64,${req.file.buffer.toString("base64")}`;

      if (imageUrl) {
        const publicId = imageUrl.split("/").slice(-1)[0].split(".")[0];
        await cloudinary.uploader.destroy(`doctor/${publicId}`);
      }

      const result = await cloudinary.uploader.upload(base64Image, {
        folder: "doctor",
      });

      imageUrl = result.secure_url;
    }

    await User.findByIdAndUpdate(doctor.user_id._id, {
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      image: imageUrl,
      phone: req.body.phone,
    });

    const doctorUpdate = await Doctor.findByIdAndUpdate(
      id,
      {
        specialization_id: req.body.specialization_id,
        description: req.body.description,
        price: req.body.price,
      },
      { new: true }
    );

    return res.status(200).json(doctorUpdate);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findOne({ user_id: id }).populate("user_id");

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found!" });
    }

    const imageUrl = doctor.user_id.image;
    if (imageUrl) {
      const publicId = imageUrl.split("/").slice(-1)[0].split(".")[0];
      await cloudinary.uploader.destroy(`doctor/${publicId}`);
    }

    await Doctor.findByIdAndDelete(doctor._id);
    await User.deleteOne({ _id: id });
    await UserRole.deleteOne({ user_id: id });

    return res
      .status(200)
      .json({ success: true, message: "Delete doctor success!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const confirmAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Thêm "completed" vào danh sách trạng thái hợp lệ
    if (!["confirmed", "canceled", "completed"].includes(status)) {
      return res.status(400).json({
        message:
          "Invalid status. Status must be 'confirmed', 'canceled', or 'completed'.",
      });
    }

    // Cập nhật trạng thái cuộc hẹn
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Định dạng ngày tháng
    moment.locale("vi");
    const vietnamTime = moment
      .utc(updatedAppointment.work_date)
      .tz("Asia/Ho_Chi_Minh")
      .format("dddd, DD-MM-YYYY");

    const formattedVietnamTime =
      vietnamTime.charAt(0).toUpperCase() + vietnamTime.slice(1);

    const shiftType =
      updatedAppointment.work_shift === "morning" ? "Sáng" : "Chiều";

    // Tạo thông báo
    let notificationContent;
    if (status === "confirmed") {
      notificationContent = `Lịch hẹn ngày ${formattedVietnamTime} của bạn đã được xác nhận.`;
    } else if (status === "canceled") {
      notificationContent = `Lịch hẹn ngày ${formattedVietnamTime} của bạn đã bị hủy.`;
    } else if (status === "completed") {
      notificationContent = `Lịch hẹn ngày ${formattedVietnamTime} của bạn đã hoàn thành. Cảm ơn bạn đã đến!`;
    }

    await Notification.create({
      content: notificationContent,
      patient_id: updatedAppointment.patient_id,
      doctor_id: updatedAppointment.doctor_id,
      appointment_id: updatedAppointment._id,
      recipientType: "patient",
    });

    // Tìm thông tin bệnh nhân
    const patient = await Patient.findById(updatedAppointment.patient_id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const userInfo = await User.findById(patient.user_id);
    if (!userInfo) {
      return res.status(404).json({ message: "User info not found" });
    }

    // Nội dung email
    let emailSubject;
    let emailText;

    if (status === "confirmed") {
      emailSubject = "Phản hồi: Lịch hẹn của bạn đã được xác nhận.";
      emailText = `Kính gửi ${userInfo.name},\n\nLịch hẹn của bạn đã được xác nhận như sau:\n\nNgày: ${formattedVietnamTime}\nCa khám: ${shiftType}\n\nVui lòng có mặt đúng giờ để đảm bảo quá trình khám diễn ra thuận lợi.\n\nNếu cần hỗ trợ, vui lòng liên hệ chúng tôi qua email hoặc số điện thoại.\n\nTrân trọng!\n[Đội ngũ hỗ trợ khách hàng].`;
    } else if (status === "canceled") {
      emailSubject = "Phản hồi: Lịch hẹn của bạn đã bị hủy.";
      emailText = `Kính gửi ${userInfo.name},\n\nLịch hẹn của bạn vào ngày ${formattedVietnamTime} - Ca khám: ${shiftType} đã bị hủy.\n\nNếu có bất kỳ thắc mắc nào, vui lòng liên hệ chúng tôi qua email hoặc số điện thoại.\n\nTrân trọng!\n[Đội ngũ hỗ trợ khách hàng].`;
    } else if (status === "completed") {
      emailSubject = "Phản hồi: Lịch hẹn của bạn đã hoàn thành.";
      emailText = `Kính gửi ${userInfo.name},\n\nLịch hẹn của bạn vào ngày ${formattedVietnamTime} - Ca khám: ${shiftType} đã hoàn thành. Cảm ơn bạn đã đến!\n\nNếu cần hỗ trợ, vui lòng liên hệ chúng tôi qua email hoặc số điện thoại.\n\nTrân trọng!\n[Đội ngũ hỗ trợ khách hàng].`;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userInfo.email,
      subject: emailSubject,
      text: emailText,
    };

    // Gửi email
    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      message: `Appointment ${status} successfully!`,
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error("Error in confirmAppointment:", error);
    return res.status(500).json({ message: error.message });
  }
};

const getDoctorAppointments = async (req, res) => {
  try {
    const user_id = req.user?.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const doctor = await Doctor.findOne({ user_id: user_id });
    if (!doctor) {
      return res.status(400).json({ message: "Doctor not found" });
    }

    const appointments = await Appointment.find({
      doctor_id: doctor._id,
      work_date: { $gte: today },
    })
      .populate({
        path: "patient_id",
        populate: {
          path: "user_id",
          select: "name",
        },
      })
      .populate({
        path: "doctor_id",
        populate: {
          path: "user_id",
          select: "name image",
        },
      })
      .sort({ updatedAt: -1 });

    if (appointments.length > 0) {
      return res.status(200).json(appointments);
    }

    return res.status(404).json({ message: "Appointments not found" });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return res.status(500).json({ message: error.message });
  }
};
const getSpecializations = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findOne({ user_id: id }).populate(
      "specialization_id"
    );
    if (!doctor) {
      return res.status(400).json({ message: "Doctor not found" });
    }
    return res.status(200).json(doctor);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
const getProfileDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const doctor = await Doctor.findOne({ user_id: id }).populate(
      "specialization_id"
    );
    if (!doctor) {
      return res.status(400).json({ message: "Doctor not found" });
    }

    const doctorProfile = {
      ...doctor.toObject(),
      name: user.name,
      email: user.email,
      image: user.image,
      phone: user.phone,
      password: user.password,
    };

    return res.status(200).json({ success: true, doctorProfile });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
const updateProfileDoctor = async (req, res) => {
  try {
    // Validate dữ liệu từ client
    const { error } = validateUpdateDoctor(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { id } = req.params;

    const doctor = await Doctor.findOne({ user_id: id }).populate(
      "specialization_id"
    );
    if (!doctor) {
      return res.status(400).json({ message: "Doctor not found" });
    }

    const user = await User.findOne({ _id: id });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    // Kiểm tra mật khẩu cũ
    if (req.body.oldPassword) {
      const checkNewPassord = await bcrypt.compare(
        req.body.newPassword,
        user.password
      );
      if (checkNewPassord) {
        return res
          .status(400)
          .json({ message: "Mật khẩu mới không được giống mật sách cũ!" });
      }
      const isMatch = await bcrypt.compare(req.body.oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Mật khẩu cũ không chính xác" });
      }
    }

    let hashedPassword = doctor.user_id.password;
    if (req.body.newPassword) {
      hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
    }

    let imageUrl = doctor.user_id.image;

    if (req.file) {
      const base64Image = `data:${
        req.file.mimetype
      };base64,${req.file.buffer.toString("base64")}`;

      if (imageUrl) {
        const publicId = imageUrl.split("/").slice(-1)[0].split(".")[0];
        await cloudinary.uploader.destroy(`doctor/${publicId}`);
      }

      const result = await cloudinary.uploader.upload(base64Image, {
        folder: "doctor",
      });
      imageUrl = result.secure_url;
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: id },
      {
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        image: imageUrl,
        phone: req.body.phone,
      },
      { new: true }
    );
    if (!updatedUser) {
      return res
        .status(400)
        .json({ message: "Cập nhật hồ sơ không thành công" });
    }

    const updatedDoctor = await Doctor.findOneAndUpdate(
      { user_id: id },
      {
        specialization_id: req.body.specialization_id,
        description: req.body.description,
        price: req.body.price,
      },
      { new: true }
    );
    if (!updatedDoctor) {
      return res
        .status(400)
        .json({ message: "Cập nhật hồ sơ không thành công" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Cập nhật hồ sơ thành công!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
const getTopDoctor = async (req, res) => {
  try {
    // Tìm tất cả các bác sĩ
    const doctors = await Doctor.find({})
      .populate("user_id")
      .populate("specialization_id");

    // Lấy danh sách các lịch hẹn với trạng thái 'completed' và nhóm theo doctor_id
    const appointments = await Appointment.aggregate([
      {
        $match: { status: "completed" }, // Lọc các lịch hẹn có trạng thái 'completed'
      },
      {
        $group: {
          _id: "$doctor_id", // Nhóm theo doctor_id
          count: { $sum: 1 }, // Đếm số lượng lịch hẹn
        },
      },
    ]);

    // Chuyển đổi appointments thành một đối tượng để dễ dàng truy cập
    const appointmentCount = {};
    appointments.forEach((app) => {
      appointmentCount[app._id] = app.count;
    });

    // Thêm số lượng lịch hẹn vào thông tin bác sĩ
    const doctorsWithCounts = doctors.map((doctor) => ({
      ...doctor.toObject(), // Chuyển đổi Mongoose Document thành Object
      appointmentCount: appointmentCount[doctor._id] || 0, // Lấy số lượng lịch hẹn hoặc 0 nếu không có
    }));

    // Sắp xếp bác sĩ theo số lượng lịch hẹn từ cao đến thấp
    doctorsWithCounts.sort((a, b) => b.appointmentCount - a.appointmentCount);

    return res.status(200).json({ success: true, doctors: doctorsWithCounts });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAppointmentConfirmByDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findOne({ user_id: id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    // Lấy work_date từ req.body
    const workDate = new Date(req.body.work_date);
    const startOfDay = new Date(workDate.setUTCHours(0, 0, 0, 0));
    const endOfDay = new Date(workDate.setUTCHours(23, 59, 59, 999));

    const appointments = await Appointment.find({
      doctor_id: doctor._id,
      status: "confirmed",
      work_date: { $gte: startOfDay, $lte: endOfDay },
      work_shift: req.body.work_shift,
    }).populate({
      path: "patient_id",
      populate: { path: "user_id", select: "name" },
    });

    if (!appointments || appointments.length === 0) {
      return res.status(404).json({ success: false, message: "No appointments found" });
    }

    // Lấy thông tin thanh toán cho các cuộc hẹn
    const appointmentIds = appointments.map((appointment) => appointment._id);
    const payments = await Payment.find({
      appointment_id: { $in: appointmentIds },
    });

    // Tạo một đối tượng để lưu trạng thái thanh toán theo appointment_id
    const paymentStatusMap = {};
    payments.forEach((payment) => {
      paymentStatusMap[payment.appointment_id] = payment.status;
    });

    // Thêm trạng thái thanh toán vào từng cuộc hẹn
    const result = appointments.map((appointment) => ({
      ...appointment.toObject(),
      paymentStatus: paymentStatusMap[appointment._id] || "false",
    }));

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const formatVietnameseDate = (date) => {
  moment.locale("vi");
  const formattedDate = moment
    .utc(date)
    .tz("Asia/Ho_Chi_Minh")
    .format("dddd, DD-MM-YYYY");
  return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
};

const completeApointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }
    const updatedAppointment = await Appointment.findOneAndUpdate(
      { _id: appointment._id },
      { status: "completed" },
      { new: true }
    );
    if (!updatedAppointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    const formattedDate = formatVietnameseDate(updatedAppointment.work_date);

    await Notification.create({
      patient_id: updatedAppointment.patient_id,
      doctor_id: updatedAppointment.doctor_id,
      content: `Lịch hẹn vào ngày: ${formattedDate} của bạn đã hoàn thành. \n\n Trân trọng. `,
      appointment_id: updatedAppointment._id,
      recipientType: "patient",
    });

    return res.status(200).json({ success: true, data: updatedAppointment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

//search
const searchPatient = async (req, res) => {
  const { query } = req.query;
  try {
    const results = await Appointment.find()
      .populate({
        path: "patient_id",
        populate: {
          path: "user_id",
          match: { name: { $regex: query, $options: "i" } },
          select: "name",
        },
      })
      .exec();

    // Lọc kết quả để chỉ lấy những bệnh nhân có tên phù hợp
    const filteredResults = results.filter(
      (appointment) => appointment.patient_id && appointment.patient_id.user_id
    );

    if (filteredResults.length <= 0) {
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });
    }

    res.json({ success: true, data: filteredResults });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// sum amount money
const sumAmountMoney = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findOne({user_id: id}); 
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    const appointments = await Appointment.find({ doctor_id: doctor._id });
    if (appointments.length <= 0) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    // Lấy tất cả các ID của các cuộc hẹn
    const appointmentIds = appointments.map(appointment => appointment._id);

    // Tìm tất cả các thanh toán liên quan đến các cuộc hẹn
    const payments = await Payment.find({ appointment_id: { $in: appointmentIds } });

    // Tính tổng số tiền
    const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);

    // Trả về kết quả
    return res.status(200).json({ success: true, data: totalAmount });
    
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


module.exports = {
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
};
