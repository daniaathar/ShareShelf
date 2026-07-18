import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/app-error.js';

const tokenFor = (user) => jwt.sign({ sub: user.id, email: user.email }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
export async function register(input) {
  const exists = await prisma.user.findUnique({ where: { email: input.email } });
  if (exists) throw new AppError(409, 'EMAIL_TAKEN', 'An account already exists for this email');
  const { password, ...profile } = input;
  const user = await prisma.user.create({ data: { ...profile, passwordHash: await bcrypt.hash(password, 12) } });
  return { user, accessToken: tokenFor(user) };
}
export async function login(input) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) throw new AppError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect');
  return { user, accessToken: tokenFor(user) };
}
