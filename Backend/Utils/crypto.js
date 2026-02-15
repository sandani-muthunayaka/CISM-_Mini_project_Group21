const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
const key = Buffer.from(process.env.SECRET_KEY, 'utf-8');
const iv = crypto.randomBytes(16);

function encrypt(text) {
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return {
        iv: iv.toString('hex'),
        encryptedData: encrypted
    };
}

function decrypt(encryptedData, ivHex) {
    const decipher = crypto.createDecipheriv(
        algorithm,
        key,
        Buffer.from(ivHex, 'hex')
    );
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

module.exports = { encrypt, decrypt };
