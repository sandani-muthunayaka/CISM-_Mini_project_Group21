require('dotenv').config();
const express = require('express');
const { encrypt, decrypt } = require('../Utils/crypto');

const router = express.Router();

router.post('/encrypt', async (req, res) => {
    try {
        const { text } = req.body;
        const encryptedData = encrypt(text);
        res.json(encryptedData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/decrypt', async (req, res) => {
    try {
        const { text } = req.body;
        const decryptedData = decrypt(text);
        res.json(decryptedData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;