import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const userId = process.argv[2] || 1;
const secret = process.env.JWT_SECRET || 'secret';
const token = jwt.sign({ id: Number(userId) }, secret, { expiresIn: '24h' });
console.log(token);
