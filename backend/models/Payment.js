const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    order_id: {
      type: String,
      required: true,
    },
    appointment_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment",
        required: true
      },
      amount: {
        type: Number,
        required: true,
      },
      status: {
        type: Boolean,
        required: true,
      },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Payment", PaymentSchema);
