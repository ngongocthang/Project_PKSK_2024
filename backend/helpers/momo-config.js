  const axios = require("axios");
  const crypto = require("crypto");
  const { console } = require("inspector");
  const Payment = require("../models/Payment");

  var accessKey = process.env.MOMO_ACCESS_KEY;
  var secretKey = process.env.MOMO_SECRET_KEY;


  const payment = async (req, res) => {
    const {id} = req.params;
    const {price} = req.body;

    //parameters
  var orderInfo = "Pay with MoMo";
  var partnerCode = "MOMO";
  var redirectUrl = "http://localhost:5173/my-appointments";
  var ipnUrl = "https://b628-116-98-249-88.ngrok-free.app/callback";
  var requestType = "payWithMethod";
  var amount = price;
  var orderId = partnerCode + new Date().getTime();
  var requestId = orderId;
  var extraData = "";
  var orderGroupId = "";
  var autoCapture = true;
  var lang = "vi";

  var rawSignature =
    "accessKey=" +
    accessKey +
    "&amount=" +
    amount +
    "&extraData=" +
    extraData +
    "&ipnUrl=" +
    ipnUrl +
    "&orderId=" +
    orderId +
    "&orderInfo=" +
    orderInfo +
    "&partnerCode=" +
    partnerCode +
    "&redirectUrl=" +
    redirectUrl +
    "&requestId=" +
    requestId +
    "&requestType=" +
    requestType;

    //puts raw signature
    console.log("--------------------RAW SIGNATURE----------------");
    console.log(rawSignature);
    //signature
    const crypto = require("crypto");
    var signature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");
    console.log("--------------------SIGNATURE----------------");
    console.log(signature);

    //json object send to MoMo endpoint
    const requestBody = JSON.stringify({
      partnerCode: partnerCode,
      partnerName: "Test",
      storeId: "MomoTestStore",
      requestId: requestId,
      amount: amount,
      orderId: orderId,
      orderInfo: orderInfo,
      redirectUrl: redirectUrl,
      ipnUrl: ipnUrl,
      lang: lang,
      requestType: requestType,
      autoCapture: autoCapture,
      extraData: extraData,
      orderGroupId: orderGroupId,
      signature: signature,
    });
    // options for axios
    const options = {
      method: "POST",
      url: "https://test-payment.momo.vn/v2/gateway/api/create",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(requestBody),
      },
      data: requestBody,
    };

    let result;
    try {
      result = await axios(options);
      if (result.data.resultCode === 0) {
        const newPayment = new Payment({
          appointment_id: id,
          amount: price,  
          status: false,
          order_id: orderId
        });

        await newPayment.save();
      }
      return res.status(200).json(result.data);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };

  const callback = async (req, res) => {
    try {
      if (req.body) {
        console.log("callback received:", req.body);

        if (req.body.resultCode === 0) {
          const { orderId } = req.body;

          const payment = await Payment.findOneAndUpdate( 
            { order_id: orderId },
            { status: true },
            { new: true }
          );
          if (payment) {
            return res.status(200).json({ success: true, message: "Payment successful." }); 
          }
        }

        return res.status(400).json({ success: false, message: "Payment failed." });
      }
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };

  const checkPaymentStatus = async (req, res) => {
    const appointment_id  = req.params.id;
  
    try {
      const payment = await Payment.findOne({ appointment_id: appointment_id  });
  
      if (!payment) {
        return res.status(404).json({ success: false, message: "Payment not found." , appointmentId: appointment_id});
      }
  
      return res.status(200).json({
        success: true,
        status: payment.status,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };

  module.exports = {
    payment,
    callback,
    checkPaymentStatus
  };
