import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  // Defer throwing until functions are used so tests can import file safely
}

export function signToken(payload, opts = {}) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not set');
  return jwt.sign(payload, secret, { expiresIn: opts.expiresIn || '7d' });
}

export function verifyToken(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not set');
  return jwt.verify(token, secret);
}

export function generateAuthTokens(userId, { accessExpires = '20m', refreshExpires = '30d', isAdmin = false } = {}) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not set');

  const accessToken = jwt.sign({ userId, isAdmin }, secret, { expiresIn: accessExpires });

  // Use a tokenId to track refresh tokens for rotation/revocation
  const tokenId = crypto.randomBytes(16).toString('hex');
  const refreshToken = jwt.sign({ userId, tokenId }, secret, { expiresIn: refreshExpires });

  return { accessToken, refreshToken, tokenId };
}

export function verifyRefreshToken(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not set');
  return jwt.verify(token, secret);
}

export async function hashPassword(plain) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

export async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

export default { signToken, verifyToken, generateAuthTokens, verifyRefreshToken, hashPassword, comparePassword };
