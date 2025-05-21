const nodemailer = require('nodemailer');

// Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOrderConfirmationEmail = async (order, userEmail) => {
  try {
    // Format order items
    const orderItems = order.recipes.map(recipe => 
      `${recipe.recipeId?.name || 'Unknown Recipe'} (${recipe.servings} servings) - Rs. ${recipe.amount.toFixed(2)}`
    ).join('\n');

    // Create email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: "Order Confirmation",
      text: `
Order Confirmation
-----------------
Order ID: ${order._id}
Date: ${new Date(order.createdAt).toLocaleString()}
Status: ${order.status}
Payment: ${order.paymentMethod}

Items:
${orderItems}

Delivery Details:
Name: ${order.customerName}
Address: ${order.address}
Phone: ${order.phoneNumber}

Total Amount: Rs. ${order.totalAmount.toFixed(2)}

Thank you for your order!
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent successfully');
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw error;
  }
};

module.exports = {
  sendOrderConfirmationEmail
}; 