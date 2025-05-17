const Transaction = require('../models/Transaction');
const Order = require('../models/Order');
const Ingredient = require('../models/Ingredient');

/**
 * Initiates an eSewa payment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const EsewaInitiatePayment = async (req, res) => {
  const { amount, productId, orderDetails } = req.body;

  try {
    console.log('eSewa payment request:', { amount, productId });
    console.log('Order details:', JSON.stringify(orderDetails, null, 2));
    
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
      // Save transaction record
      const transaction = new Transaction({
        product_id: productId,
        amount: parseFloat(amount),
        status: "PENDING"
      });
      await transaction.save();

      // Save order record
      if (orderDetails) {
        // Convert old schema format if needed
        if (orderDetails.recipe && !orderDetails.recipes) {
          console.log('Converting old schema format to new schema format in eSewa payment');
          orderDetails.recipes = [{
            recipeId: orderDetails.recipe,
            ingredients: orderDetails.ingredients || [],
            servings: orderDetails.servings || 1,
            amount: orderDetails.totalAmount || 0
          }];
          
          // Delete old fields
          delete orderDetails.recipe;
          delete orderDetails.ingredients;
          delete orderDetails.servings;
        }

        // Update ingredient stock levels
        for (const recipe of orderDetails.recipes) {
          for (const ingredient of recipe.ingredients) {
            const ingredientDoc = await Ingredient.findById(ingredient.ingredient);
            if (!ingredientDoc) {
              return res.status(400).json({ message: `Ingredient ${ingredient.ingredient} not found` });
            }

            // Calculate total quantity needed (quantity per recipe * number of servings)
            const totalQuantity = ingredient.quantity * recipe.servings;

            // Check if enough stock is available
            if (ingredientDoc.stock < totalQuantity) {
              return res.status(400).json({ 
                message: `Not enough stock for ${ingredientDoc.name}. Available: ${ingredientDoc.stock} ${ingredientDoc.stockUnit}, Required: ${totalQuantity} ${ingredientDoc.stockUnit}`
              });
            }

            // Reduce stock
            ingredientDoc.stock -= totalQuantity;
            await ingredientDoc.save();
          }
        }
        
        const order = new Order({
          ...orderDetails,
          paymentMethod: 'esewa',
          status: 'pending',
          paymentDetails: {
            transactionId: productId,
            paymentStatus: 'pending',
            paymentDate: new Date(),
            paymentMethod: 'esewa'
          }
        });
        
        console.log('Creating eSewa order with data:', JSON.stringify(order, null, 2));
        await order.save();
      }

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
  const { product_id, status } = req.body;

  try {
    // Update transaction status
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
      // Update transaction status
      transaction.status = paymentStatusCheck.data.status || "COMPLETE";
      await transaction.save();

      // Update order status
      const order = await Order.findOne({ 'paymentDetails.transactionId': product_id });
      if (order) {
        order.status = status === 'success' ? 'delivered' : 'failed';
        order.paymentDetails.paymentStatus = status;
        order.paymentDetails.paymentDate = new Date();
        await order.save();
      }

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
