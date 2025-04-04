const Transaction = require('../models/Transaction');

/**
 * Initiates an eSewa payment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const EsewaInitiatePayment = async (req, res) => {
  const { amount, productId } = req.body;

  try {
    // ✅ Use dynamic import() for ES modules
    const esewajs = await import('esewajs');

    const reqPayment = await esewajs.EsewaPaymentGateway(
      amount, 0, 0, 0, productId,
      process.env.MERCHANT_ID,
      process.env.SECRET,
      process.env.SUCCESS_URL,
      process.env.FAILURE_URL,
      process.env.ESEWAPAYMENT_URL
    );

    if (!reqPayment) {
      return res.status(400).json({ success: false, message: "Error sending data" });
    }

    if (reqPayment.status === 200) {
      const transaction = new Transaction({
        product_id: productId,
        amount: parseFloat(amount),
        status: "PENDING"
      });

      await transaction.save();
      console.log("Transaction created:", transaction);

      return res.status(200).json({
        success: true,
        message: "Payment initiated successfully",
        url: reqPayment.request.res.responseUrl
      });
    }

    return res.status(400).json({ success: false, message: "Failed to initiate payment" });
  } catch (error) {
    console.error("Error initiating payment:", error);
    return res.status(400).json({ success: false, message: "Error sending data", error: error.message });
  }
};

/**
 * Processes the eSewa payment status callback
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const paymentStatus = async (req, res) => {
  const { product_id } = req.body;

  try {
    const transaction = await Transaction.findOne({ product_id });
    if (!transaction) {
      return res.status(400).json({ success: false, message: "Transaction not found" });
    }

    // ✅ Use dynamic import() for ES modules
    const esewajs = await import('esewajs');

    const paymentStatusCheck = await esewajs.EsewaCheckStatus(
      transaction.amount,
      transaction.product_id,
      process.env.MERCHANT_ID,
      process.env.ESEWAPAYMENT_STATUS_CHECK_URL
    );

    if (paymentStatusCheck.status === 200) {
      transaction.status = paymentStatusCheck.data.status || "COMPLETE";
      await transaction.save();

      return res.status(200).json({
        success: true,
        message: "Transaction status updated successfully",
        status: transaction.status
      });
    } else {
      return res.status(400).json({ success: false, message: "Failed to verify payment status" });
    }
  } catch (error) {
    console.error("Error updating transaction status:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = { EsewaInitiatePayment, paymentStatus };
