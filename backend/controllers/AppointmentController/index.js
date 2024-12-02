const Appointment = require("../../models/Appointment");
const Appointment_history = require("../../models/Appointment_history");
const validateAppointment = require("../../requests/validateAppointment");
const Patient = require("../../models/Patient");
const Doctor = require("../../models/Doctor");
const Notification = require("../../models/Notification");
const transporter = require("../../helpers/mailer-config");
const User = require("../../models/User");
const moment = require("moment-timezone");
require("moment/locale/vi");
const User_role = require("../../models/User_role");
const Role = require("../../models/Role");

const createAppointment = async (req, res) => {
  try {
    // Validate dữ liệu từ client
    const { error } = validateAppointment(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const appointment = await Appointment.create(req.body);
    if (appointment) {
      return res.status(200).json(appointment);
    }
    return res.status(400).json({ message: "Appointment not found" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const findAllAppointment = async (req, res) => {
  try {
    const appointments = await Appointment.find({});
    if (!appointments || appointments.length === 0) {
      return res.status(400).json({ message: "Appointment not found" });
    }

    // Sắp xếp các cuộc hẹn theo createdAt từ mới nhất đến cũ nhất
    appointments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const appointmentsWithDetails = await Promise.all(
      appointments.map(async (appointment) => {
        const patient = await Patient.findOne({ _id: appointment.patient_id });
        const patientInfo = await User.findOne({ _id: patient.user_id });
        const doctor = await Doctor.findOne({ _id: appointment.doctor_id });
        const doctorInfo = await User.findOne({ _id: doctor.user_id });

        return {
          ...appointment.toObject(),
          patientInfo,
          doctorInfo,
        };
      })
    );

    return res
      .status(200)
      .json({ success: true, appointments: appointmentsWithDetails });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const findAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);
    if (appointment) {
      return res.status(200).json(appointment);
    }
    return res.status(400).json({ message: "Appointment not found" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateAppointment = async (req, res) => {
  try {
    const user_id = req.user.id;
    if (!user_id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Validate dữ liệu từ client
    const { error } = validateAppointment(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { id } = req.params;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(400).json({ message: "Appointment not found" });
    }

    const oldDate = moment(appointment.work_date)
      .tz("Asia/Ho_Chi_Minh")
      .format("dddd, MMMM DD YYYY");

    const oldShift = appointment.work_shift === "morning" ? "Sáng" : "Chiều";

    const appointmentUpdate = await Appointment.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
      }
    );

    if (!appointmentUpdate) {
      return res.status(400).json({ message: "Appointment not found" });
    }

    const patient = await Patient.findById(appointmentUpdate.patient_id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    const doctor = await Doctor.findById(appointmentUpdate.doctor_id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    const patientInfo = await User.findOne({ _id: patient.user_id });
    if (!patientInfo) {
      return res
        .status(404)
        .json({ message: "Information of patient not found" });
    }
    const doctorInfo = await User.findOne({ _id: doctor.user_id });
    if (!doctorInfo) {
      return res
        .status(404)
        .json({ message: "Information of doctor not found" });
    }

    const newDate = moment(appointmentUpdate.work_date)
      .tz("Asia/Ho_Chi_Minh")
      .format("dddd, MMMM DD YYYY");

    const newShift =
      appointmentUpdate.work_shift === "morning" ? "Sáng" : "Chiều";

    await Notification.create({
      patient_id: appointmentUpdate.patient_id,
      doctor_id: appointmentUpdate.doctor_id,
      content: `Thông báo lịch hẹn ${oldDate}-${oldShift} của bạn đã thay đổi: \nNgày khám mới: ${newDate}. \n Ca khám mới: ${newShift}.`,
      appointment_id: appointmentUpdate._id,
      recipientType: "patient",
    });

    const mailOptionsPatient = {
      from: process.env.EMAIL_USER,
      to: patientInfo.email,
      subject: "Thông báo lịch hẹn:",
      text: `Xin chào ${patientInfo.name}, lịch hẹn của bạn đã thay đổi: \nNgày khám mới: ${newDate}. \n Ca khám mới: ${newShift}.`,
    };

    // const mailOptionsDoctor = {
    //   from: process.env.EMAIL_USER,
    //   to: doctorInfo.email,
    //   subject: "Notification Appointment",
    //   text: `Dear Doctor, your appointment with patient has been updated. \nNew date: ${vietnamTime}. \nTime: ${appointment.work_shift}.`,
    // };

    // Gửi email
    await transporter.sendMail(mailOptionsPatient);
    // await transporter.sendMail(mailOptionsDoctor);

    return res.status(200).json(appointmentUpdate);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(400).json({ message: "Appointment not found" });
    }
    await Appointment.findByIdAndDelete(id);
    return res.status(200).json({ message: "Delete appointment success!" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
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

const patientCreateAppointment = async (req, res) => {
  try {
    const user_id = req.params.id;
    const today = new Date();

    // Lấy thông tin bệnh nhân
    const patient = await Patient.findOne({ user_id: user_id });
    if (!patient) {
      return res.status(400).json({ message: "Patient not found" });
    }

    // Kiểm tra xem lịch hẹn đã tồn tại chưa
    const checkAppointment = await Appointment.findOne({
      patient_id: patient._id,
      work_date: req.body.work_date,
      work_shift: req.body.work_shift,
      status: { $nin: ["canceled"] },
    });
    if (checkAppointment) {
      return res.status(400).json({ message: "Bạn đã đặt lịch hẹn này rồi!" });
    }

    //check neu dat qua 2 lan va huy
    // const canceledCount = await Appointment.countDocuments({
    //   patient_id: patient._id,
    //   work_date: req.body.work_date,
    //   work_shift: req.body.work_shift,
    //   status: "canceled"
    // });

    // if (canceledCount >= 2) {
    //   return res.status(400).json({ message: "Bạn đã hủy lịch hẹn này hai lần, không thể đặt lại!" });
    // }

    // Lấy thời gian từ work_date và chuyển đổi sang giờ Việt Nam
    const appointmentDate = new Date(req.body.work_date);
    const appointmentDateVN = new Date(
      appointmentDate.getTime() + 7 * 60 * 60 * 1000
    );

    // Xác định thời gian cho buổi sáng và buổi chiều
    const morningTime = new Date(appointmentDateVN);
    morningTime.setHours(7, 30, 0, 0); // 7h30

    const afternoonTime = new Date(appointmentDateVN);
    afternoonTime.setHours(13, 30, 0, 0); // 1h30

    // Kiểm tra thời gian hiện tại và chuyển đổi sang giờ Việt Nam
    const currentTime = new Date();
    const currentTimeVN = new Date(currentTime.getTime() + 7 * 60 * 60 * 1000);

    // Kiểm tra nếu là buổi sáng
    if (appointmentDateVN >= morningTime && appointmentDateVN < afternoonTime) {
      const minAppointmentTime = new Date(
        morningTime.getTime() - 30 * 60 * 1000
      );
      if (currentTimeVN > minAppointmentTime) {
        return res.status(400).json({
          message: "Bạn chỉ có thể đặt lịch hẹn trước 30 phút cho buổi sáng!",
        });
      }
    }

    // Kiểm tra nếu là buổi chiều
    if (appointmentDateVN >= afternoonTime) {
      const minAppointmentTime = new Date(
        afternoonTime.getTime() - 30 * 60 * 1000
      );
      if (currentTimeVN > minAppointmentTime) {
        return res.status(400).json({
          message: "Bạn chỉ có thể đặt lịch hẹn trước 30 phút cho buổi chiều!",
        });
      }
    }

    // Tạo lịch hẹn
    const appointment = await Appointment.create({
      ...req.body,
      patient_id: patient._id,
    });

    // Lưu vào lịch sử hẹn
    await Appointment_history.create({
      appointment_id: appointment._id,
      patient_id: patient._id,
      doctor_id: appointment.doctor_id,
    });

    const formattedDate = formatVietnameseDate(appointment.work_date);

    // Tạo thông báo
    await Notification.create({
      patient_id: appointment.patient_id,
      doctor_id: appointment.doctor_id,
      content: `Bạn đã đặt lịch hẹn vào ngày: ${formattedDate}, hãy chờ phản hồi từ bác sĩ.`,
      appointment_id: appointment._id,
      recipientType: "patient",
    });

    await Notification.create({
      patient_id: appointment.patient_id,
      doctor_id: appointment.doctor_id,
      content: `Bạn có lịch hẹn đang chờ xác nhận vào ngày: ${formattedDate}.`,
      appointment_id: appointment._id,
      recipientType: "doctor",
    });

    return res.status(200).json(appointment);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getCurrentUserAppointments = async (req, res) => {
  try {
    const user_id = req.user?.id;
    const user_role = req.user?.role;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let appointments;

    if (user_role === "patient") {
      const patient = await Patient.findOne({ user_id: user_id });
      if (!patient) {
        return res.status(400).json({ message: "Patient not found" });
      }

      appointments = await Appointment.find({
        patient_id: patient._id,
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
    } else if (user_role === "doctor") {
      const doctor = await Doctor.findOne({ user_id: user_id });
      if (!doctor) {
        return res.status(400).json({ message: "Doctor not found" });
      }

      appointments = await Appointment.find({
        doctor_id: doctor._id,
        work_date: { $gte: today },
        status: "pending",
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
        .sort({ updatedAt: -1 }); // Sắp xếp theo updatedAt giảm dần

      if (appointments.length > 0) {
        return res.status(200).json(appointments);
      }
    }
    return res.status(404).json({ message: "Appointments not found" });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return res.status(500).json({ message: error.message });
  }
};

const processPrematureCancellation = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(400).json({ message: "Appointment not found" });
    }

    const patient = await Patient.findById(appointment.patient_id);
    if (!patient) {
      return res.status(400).json({ message: "Patient not found" });
    }

    const infoPatient = await User.findById(patient.user_id);
    if (!infoPatient) {
      return res.status(400).json({ message: "Info patient not found" });
    }

    const doctor = await Doctor.findById(appointment.doctor_id);
    if (!doctor) {
      return res.status(400).json({ message: "Doctor not found" });
    }

    const infoDoctor = await User.findById(doctor.user_id);
    if (!infoDoctor) {
      return res.status(400).json({ message: "Info doctor not found" });
    }

    // Lấy thời gian hiện tại và thời gian hẹn
    const now = new Date();
    const appointmentDate = new Date(appointment.work_date);

    // Kiểm tra xem lịch hẹn có còn hơn 1 ngày nữa không
    const timeDifference = appointmentDate - now;
    const oneDayInMillis = 24 * 60 * 60 * 1000;

    if (timeDifference <= oneDayInMillis) {
      return res.status(400).json({
        message: "You can only cancel appointments more than 1 day in advance.",
      });
    }

    // Cập nhật lịch hẹn
    const appointmentUd = await Appointment.findByIdAndUpdate(id, {
      $set: { status: "canceled" },
    });

    if (!appointmentUd) {
      return res.status(404).json({ message: "Update appointment failed" });
    }

    const vietnamTime = moment(appointmentUd.work_date)
      .tz("Asia/Ho_Chi_Minh")
      .format("dddd, MMMM DD YYYY");

    const converWshift =
    appointmentUd.work_shift === "morning" ? "Sáng" : "Chiều";

    await Notification.create({
      patient_id: appointmentUd.patient_id,
      doctor_id: appointmentUd.doctor_id,
      content: `Thông báo: Bệnh nhân ${infoPatient.name} đã huỷ lịch hẹn ngày: ${vietnamTime} - ca khám : ${converWshift}.`,
      appointment_id: appointmentUd._id,
      recipientType: "doctor",
    });

    const mailOptionsDoctor = {
      from: process.env.EMAIL_USER,
      to: infoDoctor.email,
      subject: "Thông báo lịch hẹn: Huỷ lịch hẹn",
      text: `Xin chào bác sĩ, Bệnh nhân ${infoPatient.name} đã huỷ lịch hẹn ngày: ${vietnamTime} - ca khám : ${converWshift}. \\ Trân trọng.`,
    };
    await sendMail(mailOptionsDoctor);
    await transporter.sendMail(mailOptionsDoctor);

    return res.status(200).json({ message: "Delete appointment success!" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const showUpcomingAppointments = async (req, res) => {
  try {
    const user_id = req.params.id;

    const user_role = await User_role.findOne({ user_id: user_id });
    if (!user_role) {
      return res.status(403).json({ message: "User role not found" });
    }

    const role = await Role.findOne({ _id: user_role.role_id });
    if (!role) {
      return res.status(403).json({ message: "Role not found" });
    }

    const now = new Date();
    let upcomingAppointments;

    if (role.name === "admin") {
      upcomingAppointments = await Appointment.find({
        work_date: { $gte: now },
      }).sort({ work_date: 1 });
    } else {
      const doctor = await Doctor.findOne({ user_id: user_id });
      if (!doctor) {
        return res.status(403).json({ message: "Doctor not found" });
      }

      upcomingAppointments = await Appointment.find({
        doctor_id: doctor._id,
        work_date: { $gte: now },
        status: "confirmed",
      }).sort({ work_date: 1 });
    }

    const updatedAppointments = await Promise.all(
      upcomingAppointments.map(async (appointment) => {
        const patient = await Patient.findOne({ _id: appointment.patient_id });
        if (!patient) {
          throw new Error("Patient not found");
        }

        const user = await User.findOne({ _id: patient.user_id });
        if (!user) {
          throw new Error("User not found");
        }

        return {
          ...appointment.toObject(),
          patient_name: user.name,
        };
      })
    );

    return res.status(200).json(updatedAppointments);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAppointmentByStatus = async (req, res) => {
  try {
    const user_id = req.params.id;

    const user_role = await User_role.findOne({ user_id: user_id });
    if (!user_role) {
      return res.status(403).json({ message: "User role not found" });
    }

    const role = await Role.findOne({ _id: user_role.role_id });
    if (!role) {
      return res.status(403).json({ message: "Role not found" });
    }

    let appointments;
    if (role.name === "admin") {
      appointments = await Appointment.find({
        status: { $in: ["confirmed", "completed"] },
      });
    } else {
      const doctor = await Doctor.findOne({ user_id: user_id });
      if (!doctor) {
        return res.status(403).json({ message: "Doctor not found" });
      }
      appointments = await Appointment.find({
        status: { $in: ["confirmed", "completed"] },
        doctor_id: doctor._id,
      });
    }

    const updatedAppointments = await Promise.all(
      appointments.map(async (appointment) => {
        const patient = await Patient.findOne({ _id: appointment.patient_id });
        if (!patient) {
          throw new Error("Patient not found");
        }

        const user = await User.findOne({ _id: patient.user_id });
        if (!user) {
          throw new Error("User not found");
        }

        return {
          ...appointment.toObject(),
          patient_name: user.name,
        };
      })
    );

    return res.status(200).json(updatedAppointments);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const countAppointmentDoctorDashboard = async (req, res) => {
  try {
    const user_id = req.params.id;
    const doctor = await Doctor.findOne({ user_id: user_id });
    if (!doctor) {
      return res
        .status(403)
        .json({ success: false, message: "Doctor not found" });
    }

    // Đếm số lượng lịch hẹn theo trạng thái và tháng
    const appointments = await Appointment.aggregate([
      {
        $match: {
          doctor_id: doctor._id,
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$work_date" }, // Lấy tháng từ trường word_date
            status: "$status", // Nhóm theo trạng thái
          },
          count: { $sum: 1 }, // Đếm số lượng
        },
      },
      {
        $project: {
          _id: 0,
          month: "$_id.month",
          status: "$_id.status",
          count: 1,
        },
      },
      {
        $sort: { year: 1, month: 1, status: 1 }, // Sắp xếp theo năm, tháng và trạng thái
      },
    ]);

    return res.status(200).json({ success: true, appointments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getUpcomingAppointmentsDashboardAdmin = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const appointments = await Appointment.find({
      work_date: { $gte: today },
      status: "confirmed",
    })
      .populate({
        path: "doctor_id",
        populate: {
          path: "user_id",
          select: "name image",
        },
        select: "-specialization_id -description -createdAt -updatedAt -__v",
      })
      .populate({
        path: "patient_id",
        populate: {
          path: "user_id",
          select: "name",
        },
        select: "-__v",
      })
      .sort({ work_date: 1 });

    if (appointments.length <= 0) {
      return res
        .status(200)
        .json({ success: false, message: "Appointment not found" });
    }

    return res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAllAppointmentAdmin = async (req, res) => {
  try {
    const appointments = await Appointment.find({ status: "completed" });
    if (appointments.length <= 0) {
      return res
        .status(200)
        .json({ success: false, message: "Appointment not found" });
    }
    return res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createAppointment,
  findAllAppointment,
  findAppointment,
  updateAppointment,
  deleteAppointment,
  patientCreateAppointment,
  getCurrentUserAppointments,
  processPrematureCancellation,
  showUpcomingAppointments,
  getAppointmentByStatus,
  countAppointmentDoctorDashboard,
  getUpcomingAppointmentsDashboardAdmin,
  getAllAppointmentAdmin,
};
