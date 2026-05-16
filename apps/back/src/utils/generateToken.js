import jwt from 'jsonwebtoken';

export const generateToken = (userId, res) => {
  
  const token = jwt.sign(
    { id: userId },  // era "userId" — padronizado para "id" que o middleware de auth usa
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.cookie('jwt', token, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',   // "strict" bloqueava o cookie no redirect pós-login
    secure: process.env.NODE_ENV === 'production',
  });

  return token;
};