// utils/generateToken.js
import jwt from 'jsonwebtoken';

export const generateToken = (userId, res) => {
  
  const token = jwt.sign(
    { userId: userId },  
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  // Cookie para navegador
  res.cookie('jwt', token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production'
  });

  return token;
};