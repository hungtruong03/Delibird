const crypto = require('crypto');
const redis = require('../utilities/redis');
const pool = require('../utilities/database');
const { sendOtpEmail } = require('../utilities/emailService');

function generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
}

async function createOTP(email) {
    const otp = generateOTP();
    
    const existingOtp = await redis.get(email);

    if (existingOtp) {
        await redis.del(email);
        await pool.execute(
            'UPDATE otp_history SET verified_at = NOW() WHERE email = ? AND verified_at IS NULL',
            [email]
        );
    }

    await redis.set(email, otp, 'EX', 300);

    await pool.execute(
        'INSERT INTO otp_history (email, otp, created_at) VALUES (?, ?, NOW())',
        [email, otp]
    );

    await sendOtpEmail(email, otp);

    return { message: 'OTP sent successfully' };
}

async function verifyOTP(email, otp) {
    const storedOtp = await redis.get(email);

    if (!storedOtp || storedOtp !== otp) {
        return { message: 'Invalid or expired OTP' };
    }

    await pool.execute(
        'UPDATE otp_history SET verified_at = NOW() WHERE email = ? AND otp = ? AND verified_at IS NULL',
        [email, otp]
    );

    await redis.del(email);

    return { message: 'OTP verified successfully' };
}

async function getOtpHistory(email) {
    const [rows] = await pool.execute(
        'SELECT otp, created_at, verified_at FROM otp_history WHERE email = ? ORDER BY created_at DESC',
        [email]
    );

    return rows;
}

module.exports = {
    createOTP,
    verifyOTP,
    getOtpHistory
};