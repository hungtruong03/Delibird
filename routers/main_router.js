const express = require('express');
const { createOTP, verifyOTP, getOtpHistory } = require('../controllers/main_controller');
const router = express.Router();

router.post('/generate-otp', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        const result = await createOTP(email);
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to generate OTP' });
    }
});

router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ message: 'Email and OTP are required' });
    }

    try {
        const result = await verifyOTP(email, otp);
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to verify OTP' });
    }
});

router.get('/otp-history', async (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        const history = await getOtpHistory(email);
        res.status(200).json(history);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to retrieve OTP history' });
    }
});

module.exports = router;