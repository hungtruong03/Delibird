require('dotenv').config();
const express = require('express');
const app = express();
const PORT = 3000;
const Routers = require('./routers/main_router.js');

app.use(express.json());

app.use('/otp', Routers);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});