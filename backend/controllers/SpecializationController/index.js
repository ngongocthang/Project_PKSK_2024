const Specialization = require("../../models/Specialization");
const Doctor = require("../../models/Doctor");
const validateSpecialization = require("../../requests/validateSpecialization");

const createSpecialization = async (req, res) => {
  try {
    // Validate dữ liệu từ client
    const { error } = validateSpecialization(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const specialization = await Specialization.create(req.body);
    if (specialization) {
      return res.status(200).json(specialization);
    }
    return res.status(400).json({ message: "Specialization not found" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const findAllSpecialization = async (req, res) => {
  try {
    const specializations = await Specialization.find({});
    if (specializations) {
      return res.status(200).json(specializations);
    }
    return res.status(400).json({ message: "Specialization not found" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const findSpecialization = async (req, res) => {
  try {
    const { id } = req.params;
    const specialization = await Specialization.findById(id);
    if (specialization) {
      return res.status(200).json(specialization);
    }
    return res.status(400).json({ message: "Specialization not found" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateSpecialization = async (req, res) => {
  try {
    // Validate dữ liệu từ client
    const { error } = validateSpecialization(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { id } = req.params;
    const specialization = await Specialization.findByIdAndUpdate(id, req.body);
    if (!specialization) {
      return res.status(400).json({ message: "Specialization not found" });
    }
    const specializationUpdate = await Specialization.findById(id);
    return res.status(200).json(specializationUpdate);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteSpecialization = async (req, res) => {
  try {
    const { id } = req.params;
    const specialization = await Specialization.findById(id);
    if (!specialization) {
      return res.status(400).json({ message: "Specialization not found" });
    }
    await Specialization.findByIdAndDelete(id);
    await Doctor.updateMany(
      { specialization_id: id },
      { $set: { specialization_id: null } }
    );
    return res.status(200).json({ message: "Delete specialization success!" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createSpecialization,
  findAllSpecialization,
  findSpecialization,
  updateSpecialization,
  deleteSpecialization,
};
