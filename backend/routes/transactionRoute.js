const express = require('express');
const { EsewaInitiatePayment, paymentStatus } = require('../controller/esewa.controller');
const router = express.Router();

router.post('/initiate-payment',EsewaInitiatePayment);
router.post('/payment-status', paymentStatus);

module.exports = router;
