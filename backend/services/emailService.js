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
    const orderItems = order.recipes.map(recipe => {
      return `
        Recipe: ${recipe.recipeId.name}
        Servings: ${recipe.servings}
        Amount: Rs. ${recipe.amount.toFixed(2)}
      `;
    }).join('\n');

    // Create email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: "Order Confirmation - Your Order Details",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Order Confirmation</h2>
          <p>Thank you for your order! Here are your order details:</p>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #444;">Order Information</h3>
            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
          </div>

          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #444;">Order Items</h3>
            <pre style="white-space: pre-wrap;">${orderItems}</pre>
          </div>

          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #444;">Delivery Information</h3>
            <p><strong>Customer Name:</strong> ${order.customerName}</p>
            <p><strong>Delivery Address:</strong> ${order.address}</p>
            <p><strong>Phone Number:</strong> ${order.phoneNumber}</p>
          </div>

          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #444;">Total Amount</h3>
            <p><strong>Total:</strong> Rs. ${order.totalAmount.toFixed(2)}</p>
          </div>

          <p style="color: #666; font-size: 14px;">If you have any questions about your order, please contact our support team.</p>
        </div>
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